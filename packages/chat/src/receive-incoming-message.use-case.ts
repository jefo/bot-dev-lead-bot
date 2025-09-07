import { z } from "zod";
import { usePort } from "@maxdev1/sotajs/lib/di.v2";
import { findChatByIdPort, findPersonaByIdPort } from "./chat.domain.ports";
import { createChatUseCase } from "./create-chat.use-case";
import { createPersonaUseCase } from "./create-persona.use-case";
import { sendMessageUseCase } from "./send-message.use-case";
import { randomUUID } from "crypto";

// DTO для входящего сообщения, не зависящий от платформы
const ReceiveMessageInputSchema = z.object({
  chatId: z.string(),
  personaId: z.string(),
  personaName: z.string(),
  text: z.string(),
});

type ReceiveMessageInput = z.infer<typeof ReceiveMessageInputSchema>;

/**
 * Оркестрирующий Use Case.
 * Принимает сообщение, гарантирует наличие Персоны и Чата,
 * а затем передает управление в sendMessageUseCase.
 */
export const receiveIncomingMessageUseCase = async (input: unknown) => {
  const validInput = ReceiveMessageInputSchema.parse(input);

  const findPersona = usePort(findPersonaByIdPort);
  const findChat = usePort(findChatByIdPort);

  // 1. Убедимся, что Персона и Чат существуют
  let persona = await findPersona(validInput.personaId);
  if (!persona) {
    console.log(`[Core]: Persona ${validInput.personaId} not found. Creating...`);
    await createPersonaUseCase({ id: validInput.personaId, name: validInput.personaName });
  }

  let chat = await findChat(validInput.chatId);
  if (!chat) {
    console.log(`[Core]: Chat ${validInput.chatId} not found. Creating...`);
    await createChatUseCase({ 
      id: validInput.chatId, 
      title: 'Telegram Chat', // Можно будет передавать из адаптера
      participantIds: [validInput.personaId]
    });
  }

  // 2. Передаем управление основному use case для отправки сообщения
  return await sendMessageUseCase({
    chatId: validInput.chatId,
    senderId: validInput.personaId,
    content: validInput.text,
  });
};
