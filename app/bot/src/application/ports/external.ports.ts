import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import {
  IncomingMessageDto,
  OutgoingMessageDto,
  StartDialogDto,
  HandleUserChoiceDto,
  EndDialogDto
} from '../dtos/message.dtos';

// Порты для взаимодействия с внешними мессенджерами (Telegram, WhatsApp, etc.)

// Порт для отправки сообщения через внешнюю платформу
export const sendMessagePort = createPort<(dto: OutgoingMessageDto) => Promise<void>>();

// Порт для получения сообщения от внешней платформы
export const receiveMessagePort = createPort<(dto: IncomingMessageDto) => Promise<void>>();

// Порт для логирования событий
export const externalLoggerPort = createPort<(message: string, context?: object) => void>();