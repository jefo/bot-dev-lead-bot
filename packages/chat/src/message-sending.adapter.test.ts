import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { messageSentOutPort } from './index';
import * as TelegramApiClient from './telegram-api.client';

// Мокируем наш API клиент
const sendTelegramMessageSpy = jest.spyOn(TelegramApiClient, 'sendTelegramMessage');

describe('MessageSentOutPort Adapter Test', () => {
  let messageSentAdapter: (dto: { chatId: string, content: string }) => Promise<void>;

  beforeEach(() => {
    resetDI();
    sendTelegramMessageSpy.mockClear();

    // --- Composition Root (для этого теста) ---
    // Мы не можем импортировать адаптер напрямую из run.ts, поэтому воссоздаем его здесь
    messageSentAdapter = async (dto) => {
      const text = `Echo from Core: ${dto.content}`;
      const [platform, platformChatId] = dto.chatId.split(':');
      if (platform !== 'telegram' || !platformChatId) {
        console.error(`Invalid chatId format for Telegram platform: ${dto.chatId}`);
        return;
      }
      await TelegramApiClient.sendTelegramMessage(Number(platformChatId), text);
    };

    setPortAdapter(messageSentOutPort, messageSentAdapter);
  });

  it('should correctly parse platform-agnostic ID and call telegram client with numeric ID', async () => {
    // Arrange
    const outputDto = {
      chatId: 'telegram:12345678',
      senderId: 'telegram:87654321',
      content: 'test message',
      messageId: 'uuid-goes-here',
      timestamp: new Date(),
    };

    // Act
    await messageSentAdapter(outputDto);

    // Assert
    expect(sendTelegramMessageSpy).toHaveBeenCalledTimes(1);
    // Проверяем, что в клиент был передан именно числовой ID
    expect(sendTelegramMessageSpy).toHaveBeenCalledWith(12345678, expect.any(String));
  });

  it('should not call telegram client if chatId format is invalid', async () => {
    // Arrange
    const outputDto = { chatId: 'slack:12345', content: 'test' };

    // Act
    await messageSentAdapter(outputDto as any);

    // Assert
    expect(sendTelegramMessageSpy).not.toHaveBeenCalled();
  });
});
