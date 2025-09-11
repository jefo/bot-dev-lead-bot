import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs';

const FormSchema = z.object({
  id: z.string().uuid(),
  fields: z.record(z.string(), z.any()), // A simple key-value store for form data
});

export const Form = createEntity(FormSchema, 'Form');
export type Form = ReturnType<typeof Form.create>;
