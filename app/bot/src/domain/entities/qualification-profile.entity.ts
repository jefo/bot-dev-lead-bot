import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs/lib/entity';

// Определяем возможные роли как экспортируемый тип для переиспользования
export const UserRoleSchema = z.enum(['business_owner', 'specialist', 'explorer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Схема для свойств сущности
const QualificationProfileSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.number(),
  role: UserRoleSchema.nullable(),
});

export type QualificationProfileState = z.infer<typeof QualificationProfileSchema>;

// Создаем сущность с помощью фабрики из sotajs
export const QualificationProfile = createEntity({
  schema: QualificationProfileSchema,
  actions: {
    /**
     * Бизнес-метод для обновления роли.
     * Гарантирует, что роль можно установить только один раз.
     */
    assignRole(state: QualificationProfileState, role: UserRole): QualificationProfileState {
      if (state.role) {
        // В полноценной реализации здесь будет выброшено доменное исключение
        console.warn(`Role for profile ${state.id} has already been assigned.`);
        return state;
      }
      return { ...state, role };
    },
  },
});