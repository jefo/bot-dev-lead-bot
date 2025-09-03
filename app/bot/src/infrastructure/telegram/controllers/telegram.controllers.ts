import { telegramMessageAdapter, telegramCallbackAnswerAdapter } from './adapters/telegram.adapters';
import {
  processMessageUseCase,
  startDialogUseCase,
  handleUserChoiceUseCase
} from '../../application/use-cases/message.use-cases';
import { IncomingMessageDto } from '../../application/dtos/message.dtos';
import { TelegramIncomingMessageDto } from './dtos/telegram.dtos';

// Мock-зависимости для use cases (в реальной реализации будут получены через usePort)
const mockDependencies = {
  findUserById: async (id: string) => null,
  saveUser: async (user: any) => {},
  findActiveDialogSession: async (userId: string) => null,
  saveDialogSession: async (session: any) => {},
  findDialogSessionById: async (id: string) => null,
  log: (message: string, context?: object) => console.log(`[LOG] ${message}`, context),
};

// Контроллер для обработки входящих сообщений от Telegram
export const telegramWebhookController = async (req: any, res: any) => {
  try {
    // Парсим входящее сообщение
    const update: TelegramIncomingMessageDto = req.body;
    
    // Обрабатываем сообщение в зависимости от его типа
    if (update.message) {
      // Обработка текстового сообщения
      const message = update.message;
      const userId = message.from.id.toString();
      const chatId = message.chat.id;
      const text = message.text || '';
      
      // Преобразуем данные в формат DTO для use case
      const messageDto: IncomingMessageDto = {
        userId,
        platform: 'telegram',
        messageId: message.message_id.toString(),
        text,
        timestamp: new Date(message.date * 1000), // Telegram использует Unix timestamp
      };
      
      // Вызываем use case для обработки сообщения
      const response = await processMessageUseCase(messageDto, mockDependencies);
      
      // Преобразуем ответ в формат Telegram
      const telegramResponse = {
        chat_id: chatId,
        text: response.text,
        reply_markup: response.buttons ? {
          inline_keyboard: response.buttons.map(button => [{
            text: button.text,
            callback_data: button.callbackData || button.text
          }])
        } : undefined
      };
      
      // Отправляем ответ через Telegram API
      await telegramMessageAdapter(telegramResponse);
      
      // Отправляем HTTP ответ
      res.status(200).json({ status: 'ok' });
    } else if (update.callback_query) {
      // Обработка callback query (нажатие кнопки)
      const callback = update.callback_query;
      const userId = callback.from.id.toString();
      const chatId = callback.message?.chat.id || callback.from.id;
      const data = callback.data || '';
      
      // Отвечаем на callback query сразу, чтобы убрать "крутилку" в интерфейсе Telegram
      const callbackAnswer = {
        callback_query_id: callback.id,
        text: 'Обрабатываю ваш запрос...',
      };
      
      await telegramCallbackAnswerAdapter(callbackAnswer);
      
      // Преобразуем данные в формат DTO для use case
      const messageDto: IncomingMessageDto = {
        userId,
        platform: 'telegram',
        messageId: callback.id,
        payload: data,
        timestamp: new Date(),
      };
      
      // Вызываем use case для обработки выбора пользователя
      const response = await processMessageUseCase(messageDto, mockDependencies);
      
      // Преобразуем ответ в формат Telegram
      const telegramResponse = {
        chat_id: chatId,
        text: response.text,
        reply_markup: response.buttons ? {
          inline_keyboard: response.buttons.map(button => [{
            text: button.text,
            callback_data: button.callbackData || button.text
          }])
        } : undefined
      };
      
      // Отправляем ответ через Telegram API
      await telegramMessageAdapter(telegramResponse);
      
      // Отправляем HTTP ответ
      res.status(200).json({ status: 'ok' });
    } else {
      // Неизвестный тип update
      res.status(400).json({ error: 'Unknown update type' });
    }
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Контроллер для установки webhook
export const setWebhookController = async (req: any, res: any) => {
  try {
    const { url } = req.body;
    
    // Здесь должна быть логика установки webhook
    // Пока просто возвращаем успешный ответ
    
    res.status(200).json({ status: 'Webhook set successfully' });
  } catch (error) {
    console.error('Error setting webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};