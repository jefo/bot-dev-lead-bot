import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  findChatByIdPort, 
  findPersonaByIdPort, 
  saveMessagePort 
} from './chat.domain.ports';
import { messageSentOutPort } from './chat.application.ports';
import { Message } from './message.entity';

// Zod schema for input validation
const SendMessageInputSchema = z.object({
  chatId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1),
});

type SendMessageInput = z.infer<typeof SendMessageInputSchema>;

export const sendMessageUseCase = async (input: unknown) => {
  // 1. Validate input at the boundary of the use case
  const validInput = SendMessageInputSchema.parse(input);
  
  // 2. Declare dependencies with hooks
  const findChatById = usePort(findChatByIdPort);
  const findPersonaById = usePort(findPersonaByIdPort);
  const saveMessage = usePort(saveMessagePort);
  const messageSentOut = usePort(messageSentOutPort);
  
  // 3. Orchestrate logic, using validated data
  // Check if chat exists
  const chat = await findChatById(validInput.chatId);
  if (!chat) {
    throw new Error(`Chat with id ${validInput.chatId} not found`);
  }
  
  // Check if sender exists
  const sender = await findPersonaById(validInput.senderId);
  if (!sender) {
    throw new Error(`Persona with id ${validInput.senderId} not found`);
  }
  
  // Check if sender is a participant of the chat
  if (!chat.state.participantIds.includes(validInput.senderId)) {
    throw new Error(`Persona ${validInput.senderId} is not a participant of chat ${validInput.chatId}`);
  }
  
  // 4. Create domain entity
  const message = Message.create({
    id: crypto.randomUUID(),
    chatId: validInput.chatId,
    senderId: validInput.senderId,
    content: validInput.content,
    timestamp: new Date(),
  });
  
  // 5. Save the message
  await saveMessage(message);
  
  // 6. Notify about the message being sent
  await messageSentOut({
    messageId: message.id,
    chatId: validInput.chatId,
    senderId: validInput.senderId,
    content: validInput.content,
    timestamp: message.state.timestamp,
  });
  
  return { messageId: message.id };
};