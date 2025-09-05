import { z } from 'zod';
import { UserRoleSchema } from '../../domain/entities/qualification-profile.entity';

// DTO для команды на старт онбординга
export const StartCommandSchema = z.object({
  telegramId: z.number(),
  username: z.string().optional(),
});
export type StartCommand = z.infer<typeof StartCommandSchema>;

// DTO для команды на выбор роли
export const SelectRoleCommandSchema = z.object({
  telegramId: z.number(), // Используем telegramId для поиска пользователя
  role: UserRoleSchema,
});
export type SelectRoleCommand = z.infer<typeof SelectRoleCommandSchema>;

// DTO для порта, сообщающего о приветствии пользователя
export const UserWelcomedOutputSchema = z.object({ telegramId: z.number() });
export type UserWelcomedOutput = z.infer<typeof UserWelcomedOutputSchema>;

// DTO для портов, сообщающих о выборе пути
export const PathSelectedOutputSchema = z.object({
  telegramId: z.number(),
  role: UserRoleSchema,
});
export type PathSelectedOutput = z.infer<typeof PathSelectedOutputSchema>;