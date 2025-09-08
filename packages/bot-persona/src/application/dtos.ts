import { z } from 'zod';

// --- DTO для команд ---

export const DefineBotPersonaCommandSchema = z.object({
  name: z.string(),
  fsm: z.any(), // Валидация будет на уровне домена
  viewMap: z.any(),
});
export type DefineBotPersonaCommand = z.infer<typeof DefineBotPersonaCommandSchema>;

export const StartConversationCommandSchema = z.object({
  botPersonaId: z.string().uuid(),
  chatId: z.string(),
});
export type StartConversationCommand = z.infer<typeof StartConversationCommandSchema>;

export const ProcessUserInputCommmandSchema = z.object({
  chatId: z.string(),
  event: z.string(),
  payload: z.unknown().optional(),
});
export type ProcessUserInputCommmand = z.infer<typeof ProcessUserInputCommmandSchema>;


// --- DTO для выходных портов ---

export type ComponentRenderDto = {
  chatId: string;
  componentName: string;
  props: Record<string, any>;
};

export type FailureDto = {
  chatId: string;
  reason: string;
  timestamp: Date;
};
