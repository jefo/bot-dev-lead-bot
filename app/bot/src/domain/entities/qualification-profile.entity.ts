import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs/lib/entity';

// Определяем возможные роли как экспортируемый тип для переиспользования
export const UserRoleSchema = z.enum(['business_owner', 'specialist', 'explorer']);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Схема для свойств сущности
const NicheSchema = z.enum(['ecommerce', 'infobiz', 'services', 'horeca', 'b2b', 'personal_brand']);

// Схема для свойств сущности
const QualificationProfileSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.number(),
  role: UserRoleSchema.nullable(),
  niche: NicheSchema.nullable(), // Используем схему для типа
});

export type QualificationProfileState = z.infer<typeof QualificationProfileSchema>;

// Создаем сущность с помощью фабрики из sotajs
export const QualificationProfile = createEntity({
  schema: QualificationProfileSchema,
  actions: {
    /**
     * Бизнес-метод для обновления роли.
     */
    assignRole(state: QualificationProfileState, role: UserRole): QualificationProfileState {
      if (state.role) {
        console.warn(`Role for profile ${state.id} has already been assigned.`);
        return state;
      }
      return { ...state, role };
    },

    /**
     * Бизнес-метод для установки ниши.
     * Теперь он сам отвечает за валидацию.
     */
    setNiche(state: QualificationProfileState, niche: unknown): QualificationProfileState {
      const validatedNiche = NicheSchema.parse(niche); // Валидация внутри!
      return { ...state, niche: validatedNiche };
    }
  },
});