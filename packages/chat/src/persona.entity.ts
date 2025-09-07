import { createEntity } from "@maxdev1/sotajs/lib/entity";
import { z } from "zod";

// Persona Entity
const PersonaSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
});

type PersonaProps = z.infer<typeof PersonaSchema>;

export const PersonaEntity = createEntity({
	schema: PersonaSchema,
	actions: {
		rename: (state: PersonaProps, newName: string) => {
			return { ...state, name: newName };
		},
	},
});

export type PersonaEntityType = ReturnType<typeof PersonaEntity.create>;
