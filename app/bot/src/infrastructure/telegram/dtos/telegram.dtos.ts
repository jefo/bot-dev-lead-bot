import { z } from 'zod';

// DTO для входящего сообщения от Telegram
export const TelegramIncomingMessageDtoSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    from: z.object({
      id: z.number(),
      is_bot: z.boolean(),
      first_name: z.string(),
      last_name: z.string().optional(),
      username: z.string().optional(),
    }),
    chat: z.object({
      id: z.number(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      username: z.string().optional(),
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
    message: z.object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        is_bot: z.boolean(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        username: z.string().optional(),
        type: z.string(),
      }),
      date: z.number(),
      text: z.string().optional(),
    }).optional(),
    chat_instance: z.string(),
    data: z.string().optional(),
  }).optional(),
});

export type TelegramIncomingMessageDto = z.infer<typeof TelegramIncomingMessageDtoSchema>;

// DTO для исходящего сообщения в Telegram
export const TelegramOutgoingMessageDtoSchema = z.object({
  chat_id: z.number(),
  text: z.string(),
  reply_markup: z.object({
    inline_keyboard: z.array(
      z.array(
        z.object({
          text: z.string(),
          callback_data: z.string().optional(),
        })
      )
    ).optional(),
  }).optional(),
});

export type TelegramOutgoingMessageDto = z.infer<typeof TelegramOutgoingMessageDtoSchema>;

// DTO для ответа на callback query
export const TelegramCallbackAnswerDtoSchema = z.object({
  callback_query_id: z.string(),
  text: z.string().optional(),
  show_alert: z.boolean().optional(),
});

export type TelegramCallbackAnswerDto = z.infer<typeof TelegramCallbackAnswerDtoSchema>;