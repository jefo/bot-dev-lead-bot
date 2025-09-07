import { z } from 'zod';

// DTO для команды на определение нового бота
// Разделяем FSM и ViewModel для удобства API
export const DefineBotCommandSchema = z.object({
  botName: z.string().min(1),
  fsmDefinition: z.any(),
  viewModelDefinition: z.any(),
});

export type DefineBotCommand = z.infer<typeof DefineBotCommandSchema>;
