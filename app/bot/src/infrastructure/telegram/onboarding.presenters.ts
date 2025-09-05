import { PathSelectedOutput, UserWelcomedOutput } from '../application/dtos/onboarding.dtos';

// В реальном приложении здесь будет класс или объект с методами для общения с Telegram API
const telegramApi = {
  sendMessage: async (chatId: number, text: string, keyboard?: any) => {
    console.log(`
--- TO TELEGRAM (chatId: ${chatId}) ---
${text}
Keyboard: ${JSON.stringify(keyboard || {}, null, 2)}
-----------------------------------
`);
    return Promise.resolve();
  }
}

/**
 * Адаптер для порта userWelcomedOutPort.
 * Отправляет приветственное сообщение с кнопками.
 */
export async function welcomeUserAdapter(output: UserWelcomedOutput): Promise<void> {
  const text = 'Здравствуйте! Увидел ваш интерес на Kwork. Я — бот-ассистент, который поможет за 3 минуты собрать из вашей идеи четкое ТЗ для разработчика. Готовы?';
  const keyboard = {
    inline_keyboard: [
      [{ text: '👨‍💼 Я владелец бизнеса', callback_data: 'business_owner' }],
      [{ text: '🎯 Я маркетолог / специалист', callback_data: 'specialist' }],
      [{ text: '🤔 Я пока просто изучаю', callback_data: 'explorer' }],
    ]
  };
  await telegramApi.sendMessage(output.telegramId, text, keyboard);
}

/**
 * Адаптер для портов ...pathSelectedOutPort.
 * Отправляет сообщение-заглушку о выборе пути.
 */
export async function pathSelectedAdapter(output: PathSelectedOutput): Promise<void> {
  const text = `Вы выбрали путь '${output.role}'. Продолжение следует...`;
  await telegramApi.sendMessage(output.telegramId, text);
}