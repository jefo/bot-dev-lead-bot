import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { loggerPort } from '../../domain/ports/bot.ports';
import { handleUserActionUseCase } from '@application/use-cases/dialog.use-cases';

// DTO для Telegram webhook
const TelegramWebhookDtoSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      last_name: z.string().optional(),
      username: z.string().optional(),
    }).optional(),
    chat: z.object({
      id: z.number(),
      type: z.string(),
    }),
    date: z.number(),
    text: z.string().optional(),
  }).optional(),
  callback_query: z.object({
    id: z.string(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      last_name: z.string().optional(),
      username: z.string().optional(),
    }),
    data: z.string().optional(),
    message: z.object({
      message_id: z.number(),
      chat: z.object({
        id: z.number(),
      }),
    }).optional(),
  }).optional(),
});

type TelegramWebhookDto = z.infer<typeof TelegramWebhookDtoSchema>;

// Driving порт для Telegram - консумер use cases
export const telegramDrivingAdapter = async (req: any, res: any) => {
  try {
    const update: TelegramWebhookDto = req.body;
    
    // Получаем зависимости
    const log = usePort(loggerPort);
    
    log('Received Telegram webhook', { update_id: update.update_id });
    
    // Platform-agnostic результат для отправки через Telegram API
    let responseToSend: any = null;
    
    // Обрабатываем сообщение в зависимости от его типа
    if (update.message) {
      // Обработка текстового сообщения
      const message = update.message;
      if (message.from && message.text) {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;
        
        // Преобразуем в platform-agnostic формат и вызываем use case
        const result = await handleUserActionUseCase({
          userId,
          platform: 'telegram',
          actionType: 'text',
          payload: message.text,
          timestamp: new Date(message.date * 1000), // Telegram использует Unix timestamp
        });
        
        // Преобразуем platform-agnostic результат в Telegram-specific формат
        responseToSend = transformToTelegramFormat(result, chatId);
      }
    } else if (update.callback_query) {
      // Обработка callback query (нажатие кнопки)
      const callback = update.callback_query;
      const userId = callback.from.id.toString();
      const chatId = callback.message?.chat.id || callback.from.id;
      const data = callback.data || '';
      
      // Преобразуем в platform-agnostic формат и вызываем use case
      const result = await handleUserActionUseCase({
        userId,
        platform: 'telegram',
        actionType: 'choice',
        payload: data,
        timestamp: new Date(),
      });
      
      // Преобразуем platform-agnostic результат в Telegram-specific формат
      responseToSend = transformToTelegramFormat(result, chatId);
      
      // Отвечаем на callback query чтобы убрать "крутилку"
      if (responseToSend) {
        // Отправляем сообщение
        res.status(200).json({
          method: 'sendMessage',
          chat_id: chatId,
          text: responseToSend.text,
          reply_markup: responseToSend.reply_markup
        });
      } else {
        // Просто подтверждаем callback
        res.status(200).json({
          method: 'answerCallbackQuery',
          callback_query_id: callback.id,
          text: 'Обрабатываю ваш запрос...'
        });
      }
      return;
    }
    
    // Отправляем результат через Telegram API
    if (responseToSend) {
      res.status(200).json({
        method: 'sendMessage',
        chat_id: responseToSend.chat_id,
        text: responseToSend.text,
        reply_markup: responseToSend.reply_markup
      });
    } else {
      res.status(200).json({ status: 'ok' });
    }
  } catch (error) {
    console.error('Error processing Telegram webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Функция преобразования platform-agnostic DTO в Telegram-specific формат
function transformToTelegramFormat(
  dto: SingleChoiceDto | InfoMessageDto | null, 
  chatId: number
): any {
  if (!dto) return null;
  
  // Определяем тип DTO и преобразуем соответственно
  if ('options' in dto) {
    // Это SingleChoiceDto
    return {
      chat_id: chatId,
      text: dto.question,
      reply_markup: {
        inline_keyboard: dto.options.map(option => [{
          text: option.text,
          callback_data: option.value
        }])
      }
    };
  } else if ('content' in dto) {
    // Это InfoMessageDto
    return {
      chat_id: chatId,
      text: dto.title ? `${dto.title}\n\n${dto.content}` : dto.content,
    };
  }
  
  return null;
}