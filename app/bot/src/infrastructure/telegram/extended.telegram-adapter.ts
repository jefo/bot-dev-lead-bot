import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleDemonstrationUseCase,
  handleLeadCaptureUseCase,
  handleWarmupSubscriptionUseCase,
  transferLeadUseCase
} from '../use-cases/extended.use-cases';
import { 
  SegmentationChoiceDto,
  QualificationQuestionDto,
  DemonstrationGalleryDto,
  DemonstrationDetailDto,
  LeadCaptureDto,
  WarmupSubscriptionDto,
  LeadCardDto
} from '../dtos/extended.dtos';
import { loggerPort } from '../../domain/ports/bot.ports';

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

// Driving порт для Telegram - консумер всех use cases
export const telegramDrivingAdapter = async (req: any, res: any) => {
  try {
    const update: TelegramWebhookDto = req.body;
    
    // Получаем зависимости
    const log = usePort(loggerPort);
    
    log('Received Telegram webhook', { update_id: update.update_id });
    
    // Platform-agnostic результат для отправки через Telegram API
    let responseToSend: any = null;
    let shouldAnswerCallback = false;
    
    // Обрабатываем сообщение в зависимости от его типа
    if (update.message) {
      // Обработка текстового сообщения
      const message = update.message;
      if (message.from && message.text) {
        const userId = message.from.id.toString();
        const chatId = message.chat.id;
        
        // Определяем тип сообщения и вызываем соответствующий use case
        if (message.text === '/start') {
          // Начало диалога - сегментация
          const result = await handleSegmentationUseCase({
            userId,
            platform: 'telegram',
            actionType: 'text',
            payload: message.text,
            timestamp: new Date(message.date * 1000),
          });
          
          responseToSend = transformSegmentationToTelegram(result, chatId);
        } else {
          // Обычное текстовое сообщение - захват лида
          const result = await handleLeadCaptureUseCase({
            userId,
            platform: 'telegram',
            actionType: 'text',
            payload: message.text,
            timestamp: new Date(message.date * 1000),
          });
          
          responseToSend = transformLeadCaptureToTelegram(result, chatId);
        }
      }
    } else if (update.callback_query) {
      // Обработка callback query (нажатие кнопки)
      const callback = update.callback_query;
      const userId = callback.from.id.toString();
      const chatId = callback.message?.chat.id || callback.from.id;
      const data = callback.data || '';
      
      // Преобразуем callback data в action type
      let actionType = 'button';
      let payload = data;
      
      // Определяем тип действия по префиксу data
      if (data.startsWith('seg_')) {
        actionType = 'segmentation';
        payload = data.substring(4);
      } else if (data.startsWith('qual_')) {
        actionType = 'qualification';
        payload = data.substring(5);
      } else if (data.startsWith('demo_')) {
        actionType = 'demonstration';
        payload = data.substring(5);
      } else if (data.startsWith('lead_')) {
        actionType = 'lead';
        payload = data.substring(5);
      } else if (data.startsWith('warmup_')) {
        actionType = 'warmup';
        payload = data.substring(7);
      }
      
      // Вызываем соответствующий use case
      let result: any = null;
      
      switch (actionType) {
        case 'segmentation':
          result = await handleSegmentationUseCase({
            userId,
            platform: 'telegram',
            actionType: 'choice',
            payload,
            timestamp: new Date(),
          });
          responseToSend = transformSegmentationToTelegram(result, chatId);
          break;
          
        case 'qualification':
          result = await handleQualificationUseCase({
            userId,
            platform: 'telegram',
            actionType: 'choice',
            payload,
            timestamp: new Date(),
          });
          responseToSend = transformQualificationToTelegram(result, chatId);
          break;
          
        case 'demonstration':
          result = await handleDemonstrationUseCase({
            userId,
            platform: 'telegram',
            actionType: 'choice',
            payload,
            timestamp: new Date(),
          });
          if (result && 'demonstrations' in result) {
            responseToSend = transformDemonstrationGalleryToTelegram(result, chatId);
          } else {
            responseToSend = transformDemonstrationDetailToTelegram(result, chatId);
          }
          break;
          
        case 'lead':
          result = await handleLeadCaptureUseCase({
            userId,
            platform: 'telegram',
            actionType: 'choice',
            payload,
            timestamp: new Date(),
          });
          responseToSend = transformLeadCaptureToTelegram(result, chatId);
          break;
          
        case 'warmup':
          result = await handleWarmupSubscriptionUseCase({
            userId,
            platform: 'telegram',
            actionType: 'choice',
            payload,
            timestamp: new Date(),
          });
          responseToSend = transformWarmupSubscriptionToTelegram(result, chatId);
          break;
          
        default:
          // Просто подтверждаем callback
          shouldAnswerCallback = true;
          break;
      }
      
      // Отвечаем на callback query чтобы убрать "крутилку"
      if (shouldAnswerCallback || responseToSend) {
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

// Функции преобразования platform-agnostic DTO в Telegram-specific формат

function transformSegmentationToTelegram(dto: SegmentationChoiceDto, chatId: number): any {
  return {
    chat_id: chatId,
    text: `${dto.greeting}\n\n${dto.description}`,
    reply_markup: {
      inline_keyboard: dto.options.map(option => [{
        text: option.text,
        callback_data: `seg_${option.value}`
      }])
    }
  };
}

function transformQualificationToTelegram(dto: QualificationQuestionDto, chatId: number): any {
  const text = dto.description 
    ? `${dto.question}\n\n${dto.description}`
    : dto.question;
    
  return {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: dto.options.map(option => [{
        text: option.text,
        callback_data: `qual_${option.value}`
      }])
    }
  };
}

function transformDemonstrationGalleryToTelegram(dto: DemonstrationGalleryDto, chatId: number): any {
  const text = `${dto.title}\n\n${dto.description}\n\n` +
    dto.demonstrations.map(demo => `🔹 ${demo.title} - ${demo.description}`).join('\n');
    
  const keyboard = dto.demonstrations.map(demo => [{
    text: demo.title,
    callback_data: `demo_${demo.id}`
  }]);
  
  // Добавляем кнопку "Назад"
  keyboard.push([{
    text: "🔙 Назад",
    callback_data: "seg_qualification"
  }]);
  
  return {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: keyboard
    }
  };
}

function transformDemonstrationDetailToTelegram(dto: DemonstrationDetailDto, chatId: number): any {
  const text = `${dto.title}\n\n${dto.description}\n\n` +
    "Преимущества:\n" +
    dto.benefits.map(benefit => `✅ ${benefit}`).join('\n') +
    `\n\n${dto.cta}`;
    
  return {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "📩 Обсудить", callback_data: "lead_capture" }],
        [{ text: "🔙 Назад к галерее", callback_data: "demo_gallery" }]
      ]
    }
  };
}

function transformLeadCaptureToTelegram(dto: LeadCaptureDto, chatId: number): any {
  const text = `${dto.title}\n\n${dto.description}`;
  
  // Если есть placeholder, это форма ввода текста
  if (dto.placeholder) {
    return {
      chat_id: chatId,
      text,
      reply_markup: {
        force_reply: true
      }
    };
  }
  
  // Иначе это подтверждение
  return {
    chat_id: chatId,
    text
  };
}

function transformWarmupSubscriptionToTelegram(dto: WarmupSubscriptionDto, chatId: number): any {
  const text = `${dto.title}\n\n${dto.description}\n\n` +
    "Преимущества подписки:\n" +
    dto.benefits.map(benefit => `✅ ${benefit}`).join('\n');
    
  return {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Да, подписаться", callback_data: "warmup_yes" }],
        [{ text: "❌ Нет, спасибо", callback_data: "warmup_no" }]
      ]
    }
  };
}