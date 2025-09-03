import { test, expect, beforeEach } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { processMessageUseCase } from './application/use-cases/message.use-cases';
import { 
  findUserByIdPort, 
  saveUserPort, 
  findActiveDialogSessionByUserIdPort, 
  saveDialogSessionPort, 
  loggerPort 
} from './domain/ports/repository.ports';
import { consoleLoggerAdapter } from './infrastructure/telegram/adapters/telegram.adapters';

// Сброс DI container перед каждым тестом
beforeEach(() => {
  resetDI();
  
  // Устанавливаем mock адаптеры для тестирования
  setPortAdapter(findUserByIdPort, async (id: string) => null);
  setPortAdapter(saveUserPort, async (user: any) => {});
  setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => null);
  setPortAdapter(saveDialogSessionPort, async (session: any) => {});
  setPortAdapter(loggerPort, consoleLoggerAdapter);
});

test('should process incoming message and return welcome message for new user', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    messageId: 'msg-1',
    text: '/start',
    timestamp: new Date(),
  };

  const result = await processMessageUseCase(input);

  expect(result.userId).toBe('test-user-1');
  expect(result.platform).toBe('telegram');
  expect(result.text).toContain('Привет! 👋');
  expect(result.buttons).toBeDefined();
  expect(result.buttons?.length).toBe(3);
});

test('should validate input data', async () => {
  const invalidInput = {
    userId: 'test-user-1',
    platform: 'invalid-platform', // Невалидная платформа
    messageId: 'msg-1',
    text: '/start',
    timestamp: new Date(),
  };

  await expect(processMessageUseCase(invalidInput)).rejects.toThrow();
});