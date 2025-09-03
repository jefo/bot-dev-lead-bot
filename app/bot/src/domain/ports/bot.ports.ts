import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import { User, DialogSession, Message } from '../entities/bot.entities';
import { 
  SingleChoiceDto, 
  MultiChoiceDto, 
  FreeTextDto, 
  InfoMessageDto, 
  DialogEndDto,
  TransferToOperatorDto
} from '../dtos/platform-agnostic.dtos';

// Порты для работы с пользователями
export const findUserByIdPort = createPort<(id: string) => Promise<User | null>>();
export const saveUserPort = createPort<(user: User) => Promise<void>>();

// Порты для работы с сессиями диалога
export const findDialogSessionByIdPort = createPort<(id: string) => Promise<DialogSession | null>>();
export const findActiveDialogSessionByUserIdPort = createPort<(userId: string) => Promise<DialogSession | null>>();
export const createDialogSessionPort = createPort<(session: DialogSession) => Promise<DialogSession>>();
export const updateDialogSessionPort = createPort<(session: DialogSession) => Promise<DialogSession>>();

// Порты для работы с сообщениями
export const saveMessagePort = createPort<(message: Message) => Promise<void>>();

// Порты для отображения контента пользователю (platform-agnostic)
export const showSingleChoicePort = createPort<(dto: SingleChoiceDto) => Promise<void>>();
export const showMultiChoicePort = createPort<(dto: MultiChoiceDto) => Promise<void>>();
export const showFreeTextPort = createPort<(dto: FreeTextDto) => Promise<void>>();
export const showInfoMessagePort = createPort<(dto: InfoMessageDto) => Promise<void>>();
export const showDialogEndPort = createPort<(dto: DialogEndDto) => Promise<void>>();
export const transferToOperatorPort = createPort<(dto: TransferToOperatorDto) => Promise<void>>();

// Порт для логирования
export const loggerPort = createPort<(message: string, context?: object) => void>();