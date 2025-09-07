import { receiveIncomingMessageUseCase } from './index';
import { getTelegramUpdates } from './telegram-api.client';

/**
 * Преобразует "сырое" обновление от Telegram в наш внутренний DTO.
 */
async function handleTelegramUpdate(update: any) {
  const message = update.message;
  if (!message || !message.text) return;

  const payload = {
    chatId: `telegram:${message.chat.id}`,
    personaId: `telegram:${message.from.id}`,
    personaName: message.from.first_name || 'User',
    text: message.text,
  };

  console.log(`< [Adapter]: Received message from ${payload.personaName}. Routing to Core...`);
  await receiveIncomingMessageUseCase(payload);
}

/**
 * Главный цикл адаптера, который опрашивает Telegram.
 */
export async function runTelegramAdapter() {
  console.log('Running Telegram Adapter...');
  let offset = 0;
  while (true) {
    try {
      const updates = await getTelegramUpdates(offset);
      for (const update of updates) {
        offset = update.update_id + 1;
        await handleTelegramUpdate(update);
      }
    } catch (error) {
      console.error('[Adapter]: Error in polling loop:', error);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}
