import { z } from 'zod';

export const StartConversationCommandSchema = z.object({
  botId: z.string().uuid(),
  personaId: z.string().min(1),
  chatId: z.string().min(1),
});
export type StartConversationCommand = z.infer<typeof StartConversationCommandSchema>;


const UserInputSchema = z.object({
    type: z.enum(['text', 'callback']),
    value: z.union([z.string(), z.object({}).passthrough()]).optional(),
});

export const ProcessUserInputCommmandSchema = z.object({
  // Вместо sessionId будем использовать personaId для поиска активной сессии
  personaId: z.string().min(1),
  userInput: UserInputSchema,
});
export type ProcessUserInputCommmand = z.infer<typeof ProcessUserInputCommmandSchema>;
