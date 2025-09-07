import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { sendTelegramMessage } from './src/telegram-api.client';
import { runTelegramAdapter } from './src/telegram.adapter';
import type { PersonaEntity, PersonaEntityType } from './src/persona.entity';
import type { ChatEntity, ChatEntityType } from './src/chat.entity';
import type { MessageEntityType } from './src/message.entity';
import { findChatByIdPort, findPersonaByIdPort, saveChatPort, saveMessagePort, savePersonaPort } from './src/chat.domain.ports';
import { messageSentOutPort } from './src/chat.application.ports';

// --- In-Memory DB --- 
const personas = new Map<string, PersonaEntityType>();
const chats = new Map<string, ChatEntityType>();
const messages = new Map<string, MessageEntityType>();

// --- Composition Root --- 
function composeApp() {
  resetDI();

  // Адаптеры для портов репозитория (работают с in-memory DB)
  setPortAdapter(findPersonaByIdPort, async (id) => personas.get(id) || null);
  setPortAdapter(savePersonaPort, async (p) => { personas.set(p.id, p); });
  setPortAdapter(findChatByIdPort, async (id) => chats.get(id) || null);
  setPortAdapter(saveChatPort, async (c) => { chats.set(c.id, c); });
  setPortAdapter(saveMessagePort, async (m) => { messages.set(m.id, m); });

  // Адаптер для порта вывода (отправляет сообщение через наш клиент)
  setPortAdapter(messageSentOutPort, async (dto) => {
    const text = `Echo from Core: ${dto.content}`;
    
    // Парсим наш внутренний ID, чтобы получить чистый ID для Telegram
    const [platform, platformChatId] = dto.chatId.split(':');
    if (platform !== 'telegram' || !platformChatId) {
      console.error(`Invalid chatId format for Telegram platform: ${dto.chatId}`);
      return;
    }

    await sendTelegramMessage(Number(platformChatId), text);
  });

  console.log('[Composition]: Application composed successfully.');
}

// --- Main Application Entry Point ---

function main() {
  console.log('Starting application...');
  composeApp();
  runTelegramAdapter();
}

main();
