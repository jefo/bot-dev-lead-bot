import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { savePersonaPort } from './chat.domain.ports';
import { PersonaEntity } from './persona.entity';

// Zod schema for input validation
const CreatePersonaInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

type CreatePersonaInput = z.infer<typeof CreatePersonaInputSchema>;

export const createPersonaUseCase = async (input: unknown) => {
  // 1. Validate input at the boundary of the use case
  const validInput = CreatePersonaInputSchema.parse(input);
  
  // 2. Declare dependencies with hooks
  const savePersona = usePort(savePersonaPort);
  
  // 3. Create domain entity
  const persona = PersonaEntity.create({
    id: validInput.id,
    name: validInput.name,
  });
  
  // 4. Save the persona
  await savePersona(persona);
  
  return { personaId: persona.id };
};