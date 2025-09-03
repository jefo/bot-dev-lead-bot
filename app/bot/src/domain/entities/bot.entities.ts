import { z } from 'zod';
import { createEntity } from '@maxdev1/sotajs/lib/entity';
import { UserId, DialogSessionId, MessageId } from '../shared/ids';

// Сущность User с бизнес-логикой
const UserSchema = z.object({
  id: UserId.schema,
  platform: z.enum(['telegram', 'whatsapp', 'web']),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  createdAt: z.date(),
  lastActiveAt: z.date(),
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
    // Бизнес-логика: проверка является ли пользователь активным
    isActive: (state: UserProps, thresholdHours: number = 24) => {
      const hoursSinceLastActive = (Date.now() - state.lastActiveAt.getTime()) / (1000 * 60 * 60);
      return hoursSinceLastActive <= thresholdHours;
    }
  },
});

// Сущность DialogSession с бизнес-логикой
const DialogSessionSchema = z.object({
  id: DialogSessionId.schema,
  userId: UserId.schema,
  currentState: z.string(),
  currentStep: z.string(),
  context: z.record(z.string(), z.any()).optional(),
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
    
    // Бизнес-логика: обновление контекста
    updateContext: (state: DialogSessionProps, key: string, value: any) => ({
      ...state,
      context: {
        ...state.context,
        [key]: value
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
    getProgress: (state: DialogSessionProps, totalSteps: number) => {
      // Простая реализация - в реальном приложении может быть сложнее
      const stepIndex = ['welcome', 'business_type', 'pain_point', 'solution_proposal'].indexOf(state.currentStep);
      return stepIndex >= 0 ? (stepIndex + 1) / totalSteps : 0;
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