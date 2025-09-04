import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  SegmentationChoiceDto,
  QualificationQuestionDto,
  DemonstrationGalleryDto,
  DemonstrationDetailDto,
  LeadCaptureDto,
  WarmupSubscriptionDto,
  LeadTransferDto
} from '../dtos/extended.dtos';

// Ведомые порты (для отображения контента пользователю)

// Порт для отображения сегментации
export const showSegmentationPort = createPort<(dto: SegmentationChoiceDto) => Promise<void>>();

// Порт для отображения вопроса квалификации
export const showQualificationQuestionPort = createPort<(dto: QualificationQuestionDto) => Promise<void>>();

// Порт для отображения галереи демонстраций
export const showDemonstrationGalleryPort = createPort<(dto: DemonstrationGalleryDto) => Promise<void>>();

// Порт для отображения деталей демонстрации
export const showDemonstrationDetailPort = createPort<(dto: DemonstrationDetailDto) => Promise<void>>();

// Порт для захвата лида
export const captureLeadPort = createPort<(dto: LeadCaptureDto) => Promise<void>>();

// Порт для предложения подписки на прогрев
export const showWarmupSubscriptionPort = createPort<(dto: WarmupSubscriptionDto) => Promise<void>>();

// Порт для передачи лида
export const transferLeadPort = createPort<(dto: LeadTransferDto) => Promise<void>>();

// Ведущие порты (для получения данных от пользователя)

// Порт для получения выбора при сегментации
export const segmentationChoicePort = createPort<() => Promise<string>>();

// Порт для получения ответа на вопрос квалификации
export const qualificationAnswerPort = createPort<() => Promise<string>>();

// Порт для получения выбора демонстрации
export const demonstrationChoicePort = createPort<() => Promise<string>>();

// Порт для получения заявки от пользователя
export const leadSubmissionPort = createPort<() => Promise<string>>();

// Порт для получения согласия на подписку
export const warmupSubscriptionPort = createPort<() => Promise<boolean>>();