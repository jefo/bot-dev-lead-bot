import { createEntity } from '@maxdev1/sotajs';
import { z } from 'zod';

// Persona Entity
const PersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

type PersonaProps = z.infer<typeof PersonaSchema>;

export const Persona = createEntity({
  schema: PersonaSchema,
  actions: {
    rename: (state: PersonaProps, newName: string) => {
      return { ...state, name: newName };
    },
  },
});