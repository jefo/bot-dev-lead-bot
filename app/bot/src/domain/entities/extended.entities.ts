import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs/lib/entity';
import { UserId, DialogSessionId, MessageId } from '../shared/ids';

// Расширенная сущность User с поддержкой подписки на прогрев
const UserSchema = z.object({
  id: UserId.schema,
  platform: z.enum(['telegram', 'whatsapp', 'web']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  createdAt: z.date(),
  lastActiveAt: z.date(),
  isSubscribedToWarmup: z.boolean().default(false),
  warmupSubscriptionDate: z.date().optional(),
});

type UserProps = z.infer<typeof UserSchema>;

export const User = createEntity({
  schema: UserSchema,
  actions: {
    updateName: (state: UserProps, firstName: string, lastName?: string) => ({
      ...state,
      firstName,
      lastName
    }),
    updateUsername: (state: UserProps, username: string) => ({
      ...state,
      username
    }),
    updateLastActive: (state: UserProps) => ({
      ...state,
      lastActiveAt: new Date()
    }),
    subscribeToWarmup: (state: UserProps) => ({
      ...state,
      isSubscribedToWarmup: true,
      warmupSubscriptionDate: new Date()
    }),
    unsubscribeFromWarmup: (state: UserProps) => ({
      ...state,
      isSubscribedToWarmup: false,
      warmupSubscriptionDate: undefined
    }),
    // Бизнес-логика: проверка является ли пользователь активным
    isActive: (state: UserProps, thresholdHours: number = 24) => {
      const hoursSinceLastActive = (Date.now() - state.lastActiveAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastActive <= thresholdHours;
    }
  },
});

// Расширенная сущность DialogSession с поддержкой всех блоков workflow
const DialogSessionSchema = z.object({
  id: DialogSessionId.schema,
  userId: UserId.schema,
  currentPath: z.enum(['segmentation', 'qualification', 'demonstration', 'lead_capture', 'warmup', 'completed']).default('segmentation'),
  currentStep: z.string().default('welcome'),
  context: z.record(z.string(), z.any()).optional(),
  qualificationData: z.object({
    painPoint: z.string().optional(),
    niche: z.string().optional(),
    scale: z.string().optional(),
  }).optional(),
  demonstrationData: z.object({
    selectedDemo: z.string().optional(),
  }).optional(),
  leadData: z.object({
    message: z.string().optional(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  endedAt: z.date().optional(),
});

type DialogSessionProps = z.infer<typeof DialogSessionSchema>;

export const DialogSession = createEntity({
  schema: DialogSessionSchema,
  actions: {
    // Бизнес-логика: переход к следующему шагу
    advanceToStep: (state: DialogSessionProps, step: string) => ({
      ...state,
      currentStep: step,
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: переход к другой ветке
    switchToPath: (state: DialogSessionProps, path: DialogSessionProps['currentPath']) => ({
      ...state,
      currentPath: path,
      currentStep: 'start',
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: обновление контекста
    updateContext: (state: DialogSessionProps, key: string, value: any) => ({
      ...state,
      context: {
        ...state.context,
        [key]: value
      },
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: сохранение данных квалификации
    saveQualificationData: (state: DialogSessionProps, data: Partial<DialogSessionProps['qualificationData']>) => ({
      ...state,
      qualificationData: {
        ...state.qualificationData,
        ...data
      },
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: сохранение данных демонстрации
    saveDemonstrationData: (state: DialogSessionProps, data: Partial<DialogSessionProps['demonstrationData']>) => ({
      ...state,
      demonstrationData: {
        ...state.demonstrationData,
        ...data
      },
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: сохранение данных лида
    saveLeadData: (state: DialogSessionProps, message: string) => ({
      ...state,
      leadData: {
        message
      },
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: завершение сессии
    endSession: (state: DialogSessionProps) => ({
      ...state,
      endedAt: new Date(),
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: проверка активности сессии
    isExpired: (state: DialogSessionProps, timeoutMinutes: number = 30) => {
      if (state.endedAt) return true;
      const minutesSinceUpdate = (Date.now() - state.updatedAt.getTime()) / (1000 * 60);
      return minutesSinceUpdate > timeoutMinutes;
    },
    
    // Бизнес-логика: получение прогресса диалога
    getProgress: (state: DialogSessionProps) => {
      // Простая реализация - в реальном приложении может быть сложнее
      const steps = ['welcome', 'pain_point', 'niche', 'scale', 'value_proposition'];
      const stepIndex = steps.indexOf(state.currentStep);
      return stepIndex >= 0 ? (stepIndex + 1) / steps.length : 0;
    }
  },
});

// Сущность Message
const MessageSchema = z.object({
  id: MessageId.schema,
  sessionId: DialogSessionId.schema,
  userId: UserId.schema,
  text: z.string().optional(),
  payload: z.string().optional(),
  direction: z.enum(['incoming', 'outgoing']),
  timestamp: z.date(),
});

type MessageProps = z.infer<typeof MessageSchema>;

export const Message = createEntity({
  schema: MessageSchema,
  actions: {
    updateText: (state: MessageProps, text: string) => ({
      ...state,
      text
    }),
  },
});

// Новая сущность LeadProfile для профиля потенциального клиента
const LeadProfileSchema = z.object({
  id: z.string().uuid(),
  userId: UserId.schema,
  path: z.enum(['qualification', 'demonstration', 'direct_contact']),
  painPoint: z.string().optional(),
  niche: z.string().optional(),
  scale: z.string().optional(),
  userMessage: z.string().optional(),
  temperature: z.enum(['hot', 'warm', 'cold']).default('warm'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type LeadProfileProps = z.infer<typeof LeadProfileSchema>;

export const LeadProfile = createEntity({
  schema: LeadProfileSchema,
  actions: {
    updateProfile: (state: LeadProfileProps, updates: Partial<Omit<LeadProfileProps, 'id' | 'userId' | 'createdAt'>>) => ({
      ...state,
      ...updates,
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: установка температуры лида
    setTemperature: (state: LeadProfileProps, temperature: 'hot' | 'warm' | 'cold') => ({
      ...state,
      temperature,
      updatedAt: new Date()
    }),
    
    // Бизнес-логика: определение является ли лид горячим
    isHotLead: (state: LeadProfileProps) => {
      // Простая логика - в реальном приложении может быть сложнее
      return state.temperature === 'hot' || 
             (state.scale === 'Есть стабильный трафик' && 
              state.painPoint !== undefined && 
              state.niche !== undefined);
    }
  },
});

// Новая сущность Demonstration для демонстраций
const DemonstrationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['crm', 'payments', 'marketing', 'gamification']),
  mediaUrl: z.string().optional(),
  benefits: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type DemonstrationProps = z.infer<typeof DemonstrationSchema>;

export const Demonstration = createEntity({
  schema: DemonstrationSchema,
  actions: {
    updateDemonstration: (state: DemonstrationProps, updates: Partial<Omit<DemonstrationProps, 'id' | 'createdAt'>>) => ({
      ...state,
      ...updates,
      updatedAt: new Date()
    }),
  },
});