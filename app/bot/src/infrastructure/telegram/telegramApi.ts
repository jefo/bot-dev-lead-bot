// В реальном приложении здесь будет класс или объект с методами для общения с Telegram API
export const telegramApi = {
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
