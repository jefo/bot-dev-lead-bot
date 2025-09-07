import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import { z } from 'zod';

// DTOs for application ports
export const MessageSentOutputSchema = z.object({
  messageId: z.string().uuid(),
  chatId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string(),
  timestamp: z.date(),
});

export type MessageSentOutput = z.infer<typeof MessageSentOutputSchema>;

// Application ports (work with DTOs)
export const messageSentOutPort = createPort<(dto: MessageSentOutput) => Promise<void>>();