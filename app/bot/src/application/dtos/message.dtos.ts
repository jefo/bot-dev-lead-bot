import { z } from 'zod';

// Базовые DTOs для обмена сообщениями

// DTO для входящего сообщения от пользователя
export const IncomingMessageDtoSchema = z.object({
  userId: z.string(),
  platform: z.enum(['telegram', 'whatsapp', 'web']),
  messageId: z.string(),
  text: z.string().optional(),
  payload: z.string().optional(), // для callback данных от кнопок
  timestamp: z.date(),
});

export type IncomingMessageDto = z.infer<typeof IncomingMessageDtoSchema>;

// DTO для исходящего сообщения пользователю
export const OutgoingMessageDtoSchema = z.object({
  userId: z.string(),
  platform: z.enum(['telegram', 'whatsapp', 'web']),
  text: z.string(),
  buttons: z.array(z.object({
    text: z.string(),
    callbackData: z.string().optional(),
  })).optional(),
  imageUrl: z.string().optional(),
  timestamp: z.date(),
});

export type OutgoingMessageDto = z.infer<typeof OutgoingMessageDtoSchema>;

// DTO для начала нового диалога
export const StartDialogDtoSchema = z.object({
  userId: z.string(),
  platform: z.enum(['telegram', 'whatsapp', 'web']),
});

export type StartDialogDto = z.infer<typeof StartDialogDtoSchema>;

// DTO для обработки выбора пользователя
export const HandleUserChoiceDtoSchema = z.object({
  sessionId: z.string(),
  choice: z.string(),
  userId: z.string(),
});

export type HandleUserChoiceDto = z.infer<typeof HandleUserChoiceDtoSchema>;

// DTO для завершения диалога
export const EndDialogDtoSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
});

export type EndDialogDto = z.infer<typeof EndDialogDtoSchema>;

// DTO для передачи оператору
export const TransferToOperatorDtoSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  reason: z.string().optional(),
});

export type TransferToOperatorDto = z.infer<typeof TransferToOperatorDtoSchema>;