import { z } from 'zod';

// DTO для команды обработчика шага с одним выбором
export const GenericSingleChoiceCommandSchema = z.object({
  telegramId: z.number(),
  value: z.string(), // Значение, которое выбрал пользователь
});
export type GenericSingleChoiceCommand = z.infer<typeof GenericSingleChoiceCommandSchema>;
