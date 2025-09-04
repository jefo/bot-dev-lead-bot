import { z } from 'zod';
import { ChoiceOptionDto } from './platform-agnostic.dtos';

// DTO для сегментации пользователей (БЛОК 1)
export const SegmentationChoiceDtoSchema = z.object({
  greeting: z.string(),
  description: z.string(),
  options: z.array(ChoiceOptionDtoSchema),
});

export type SegmentationChoiceDto = z.infer<typeof SegmentationChoiceDtoSchema>;

// DTO для вопроса квалификации (БЛОК 2)
export const QualificationQuestionDtoSchema = z.object({
  step: z.enum(['pain_point', 'niche', 'scale', 'value_proposition']),
  question: z.string(),
  description: z.string().optional(),
  options: z.array(ChoiceOptionDtoSchema),
});

export type QualificationQuestionDto = z.infer<typeof QualificationQuestionDtoSchema>;

// DTO для галереи демонстраций (БЛОК 3)
export const DemonstrationGalleryDtoSchema = z.object({
  title: z.string(),
  description: z.string(),
  demonstrations: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(['crm', 'payments', 'marketing', 'gamification']),
  })),
});

export type DemonstrationGalleryDto = z.infer<typeof DemonstrationGalleryDtoSchema>;

// DTO для деталей демонстрации
export const DemonstrationDetailDtoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  mediaUrl: z.string().optional(),
  benefits: z.array(z.string()),
  cta: z.string(),
});

export type DemonstrationDetailDto = z.infer<typeof DemonstrationDetailDtoSchema>;

// DTO для захвата лида (БЛОК 4)
export const LeadCaptureDtoSchema = z.object({
  title: z.string(),
  description: z.string(),
  placeholder: z.string(),
  maxLength: z.number().optional(),
});

export type LeadCaptureDto = z.infer<typeof LeadCaptureDtoSchema>;

// DTO для предложения подписки на прогрев (БЛОК 5)
export const WarmupSubscriptionDtoSchema = z.object({
  title: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
  confirmation: z.string(),
});

export type WarmupSubscriptionDto = z.infer<typeof WarmupSubscriptionDtoSchema>;

// DTO для карточки лида (БЛОК 6)
export const LeadCardDtoSchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  path: z.enum(['qualification', 'demonstration', 'direct_contact']),
  painPoint: z.string().optional(),
  niche: z.string().optional(),
  scale: z.string().optional(),
  userMessage: z.string().optional(),
  temperature: z.enum(['hot', 'warm', 'cold']),
  timestamp: z.date(),
});

export type LeadCardDto = z.infer<typeof LeadCardDtoSchema>;

// DTO для передачи лида
export const LeadTransferDtoSchema = z.object({
  leadCard: LeadCardDtoSchema,
  developerContact: z.string(), // Telegram handle разработчика
  notificationMessage: z.string(),
});

export type LeadTransferDto = z.infer<typeof LeadTransferDtoSchema>;