import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import { User, DialogSession, Message } from '../entities/bot.entities';
import { UserId, DialogSessionId } from '../shared/ids';

// Порты для работы с пользователями
export const findUserByIdPort = createPort<(id: string) => Promise<User | null>>();
export const saveUserPort = createPort<(user: User) => Promise<void>>();
export const findUserByPlatformIdPort = createPort<(platform: string, platformUserId: string) => Promise<User | null>>();

// Порты для работы с сессиями диалога
export const findDialogSessionByIdPort = createPort<(id: string) => Promise<DialogSession | null>>();
export const findActiveDialogSessionByUserIdPort = createPort<(userId: string) => Promise<DialogSession | null>>();
export const saveDialogSessionPort = createPort<(session: DialogSession) => Promise<void>>();
export const endDialogSessionPort = createPort<(id: string) => Promise<void>>();

// Порты для работы с сообщениями
export const findMessageByIdPort = createPort<(id: string) => Promise<Message | null>>();
export const saveMessagePort = createPort<(message: Message) => Promise<void>>();
export const findMessagesBySessionIdPort = createPort<(sessionId: string) => Promise<Message[]>>();

// Порт для логирования
export const loggerPort = createPort<(message: string, context?: object) => void>();