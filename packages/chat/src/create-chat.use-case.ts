import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { saveChatPort, findPersonaByIdPort } from './chat.domain.ports';
import { ChatEntity } from './chat.entity';

// Zod schema for input validation
const CreateChatInputSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  participantIds: z.array(z.string().min(1)),
});

type CreateChatInput = z.infer<typeof CreateChatInputSchema>;

export const createChatUseCase = async (input: unknown) => {
  // 1. Validate input at the boundary of the use case
  const validInput = CreateChatInputSchema.parse(input);
  
  // 2. Declare dependencies with hooks
  const saveChat = usePort(saveChatPort);
  const findPersonaById = usePort(findPersonaByIdPort);
  
  // 3. Validate that all participants exist
  for (const participantId of validInput.participantIds) {
    const participant = await findPersonaById(participantId);
    if (!participant) {
      throw new Error(`Persona with id ${participantId} not found`);
    }
  }
  
  // 4. Create domain entity
  const chat = ChatEntity.create({
    id: validInput.id,
    title: validInput.title,
    participantIds: validInput.participantIds,
    createdAt: new Date(),
  });
  
  // 5. Save the chat
  await saveChat(chat);
  
  return { chatId: chat.id };
};