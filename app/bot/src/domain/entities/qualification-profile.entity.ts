import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs/lib/entity';

// --- Схемы для полей сущности ---
export const UserRoleSchema = z.enum(['business_owner', 'specialist', 'explorer']);
const NicheSchema = z.enum(['ecommerce', 'infobiz', 'services', 'horeca', 'b2b', 'personal_brand']);
const PainPointSchema = z.enum(['leadgen', 'sales_automation', 'support_automation', 'community']);

export type UserRole = z.infer<typeof UserRoleSchema>;

// --- Схема самой сущности ---
const QualificationProfileSchema = z.object({
  id: z.string().uuid(),
  telegramId: z.number(),
  role: UserRoleSchema.nullable(),
  niche: NicheSchema.nullable(),
  painPoint: PainPointSchema.nullable(),
});

export type QualificationProfileState = z.infer<typeof QualificationProfileSchema>;

// --- Создание Сущности ---
export const QualificationProfile = createEntity({
  schema: QualificationProfileSchema,
  actions: {
    assignRole(state: QualificationProfileState, role: unknown): QualificationProfileState {
      const validatedRole = UserRoleSchema.parse(role);
      if (state.role) {
        console.warn(`Role for profile ${state.id} has already been assigned.`);
        return state;
      }
      return { ...state, role: validatedRole };
    },
    setNiche(state: QualificationProfileState, niche: unknown): QualificationProfileState {
      const validatedNiche = NicheSchema.parse(niche);
      return { ...state, niche: validatedNiche };
    },
    setPainPoint(state: QualificationProfileState, painPoint: unknown): QualificationProfileState {
      const validatedPainPoint = PainPointSchema.parse(painPoint);
      return { ...state, painPoint: validatedPainPoint };
    }
  },
});