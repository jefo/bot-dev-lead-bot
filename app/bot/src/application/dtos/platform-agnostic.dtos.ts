import { z } from 'zod';

// Platform-agnostic DTOs для бизнес-логики

// DTO для варианта выбора пользователя
export const ChoiceOptionDtoSchema = z.object({
  id: z.string(),
  text: z.string(),
  value: z.string(),
});

export type ChoiceOptionDto = z.infer<typeof ChoiceOptionDtoSchema>;

// DTO для множественного выбора
export const MultiChoiceDtoSchema = z.object({
  question: z.string(),
  options: z.array(ChoiceOptionDtoSchema),
  minSelections: z.number().optional(),
  maxSelections: z.number().optional(),
});

export type MultiChoiceDto = z.infer<typeof MultiChoiceDtoSchema>;

// DTO для одиночного выбора
export const SingleChoiceDtoSchema = z.object({
  question: z.string(),
  options: z.array(ChoiceOptionDtoSchema),
});

export type SingleChoiceDto = z.infer<typeof SingleChoiceDtoSchema>;

// DTO для свободного текста
export const FreeTextDtoSchema = z.object({
  question: z.string(),
  placeholder: z.string().optional(),
  maxLength: z.number().optional(),
});

export type FreeTextDto = z.infer<typeof FreeTextDtoSchema>;

// DTO для отображения информации
export const InfoMessageDtoSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  imageUrl: z.string().optional(),
});

export type InfoMessageDto = z.infer<typeof InfoMessageDtoSchema>;

// DTO для завершения диалога
export const DialogEndDtoSchema = z.object({
  summary: z.string(),
  nextSteps: z.array(z.string()),
});

export type DialogEndDto = z.infer<typeof DialogEndDtoSchema>;

// DTO для передачи оператору
export const TransferToOperatorDtoSchema = z.object({
  reason: z.string(),
  userInfo: z.object({
    id: z.string(),
    platform: z.string(),
  }),
});

export type TransferToOperatorDto = z.infer<typeof TransferToOperatorDtoSchema>;