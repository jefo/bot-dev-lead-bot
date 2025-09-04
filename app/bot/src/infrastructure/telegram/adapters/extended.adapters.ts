import { LeadTransferDto } from '../../application/dtos/extended.dtos';

// Driven адаптер для передачи лида разработчику
export const telegramLeadTransferAdapter = async (dto: LeadTransferDto) => {
  console.log('[Telegram Lead Transfer Adapter] Transferring lead:', dto);
  
  // В реальной реализации здесь будет код для отправки сообщения разработчику через Telegram API
  /*
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: process.env.DEVELOPER_CHAT_ID,
      text: formatLeadCardMessage(dto.leadCard),
      parse_mode: 'Markdown'
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.statusText}`);
  }
  
  return response.json();
  */
  
  // Пока просто логируем для демонстрации
  return { success: true, message: 'Lead transferred' };
};

// Функция форматирования карточки лида для Telegram
function formatLeadCardMessage(leadCard: any): string {
  let message = `🔥 НОВЫЙ ГОРЯЧИЙ ЛИД! 🔥\n\n`;
  
  if (leadCard.username) {
    message += `Клиент: @${leadCard.username}\n`;
  } else {
    message += `Клиент ID: ${leadCard.userId}\n`;
  }
  
  if (leadCard.painPoint) {
    message += `Задача: ${leadCard.painPoint}\n`;
  }
  
  if (leadCard.niche) {
    message += `Ниша: ${leadCard.niche}\n`;
  }
  
  if (leadCard.scale) {
    message += `Масштаб: ${leadCard.scale}\n`;
  }
  
  if (leadCard.userMessage) {
    message += `Запрос: "${leadCard.userMessage}"\n`;
  }
  
  message += `\n[${new Date(leadCard.timestamp).toLocaleString()}]`;
  
  return message;
}

// Driven адаптер для управления подпиской на прогрев
export const warmupSubscriptionAdapter = async (userId: string, subscribe: boolean) => {
  console.log(`[Warmup Subscription Adapter] ${subscribe ? 'Subscribing' : 'Unsubscribing'} user ${userId}`);
  
  // В реальной реализации здесь будет код для управления подпиской
  // Например, добавление/удаление пользователя из списка рассылки в базе данных
  
  return { success: true, message: `User ${subscribe ? 'subscribed to' : 'unsubscribed from'} warmup` };
};

// Driven адаптер для хранения и предоставления контента демонстраций
export const demonstrationContentAdapter = async (demoId: string) => {
  console.log(`[Demonstration Content Adapter] Fetching content for demo ${demoId}`);
  
  // В реальной реализации здесь будет код для получения контента демонстрации
  // из базы данных или файловой системы
  
  // Мок данные для демонстрации
  const mockContent = {
    crm: {
      id: "crm",
      title: "Интеграция с CRM",
      description: "Автоматизация обработки заявок и поддержки клиентов",
      category: "crm",
      mediaUrl: "https://example.com/crm-demo.gif",
      benefits: [
        "Экономия 10+ часов в неделю на обработке заявок",
        "Повышение конверсии на 25%",
        "Исключение человеческих ошибок"
      ]
    },
    payments: {
      id: "payments",
      title: "Прием платежей",
      description: "Встроенные платежи без перехода на сайт",
      category: "payments",
      mediaUrl: "https://example.com/payments-demo.gif",
      benefits: [
        "Увеличение конверсии на 40%",
        "Мгновенная оплата без отвлечения клиента",
        "Поддержка всех популярных способов оплаты"
      ]
    }
  };
  
  return mockContent[demoId as keyof typeof mockContent] || null;
};