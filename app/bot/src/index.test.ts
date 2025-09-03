import { test, expect } from 'bun:test';
import { processMessageUseCase } from './application/use-cases/message.use-cases';
import { IncomingMessageDto } from './application/dtos/message.dtos';

// Mock-зависимости для тестирования
const mockDependencies = {
  findUserById: async (id: string) => null,
  saveUser: async (user: any) => {},
  findActiveDialogSession: async (userId: string) => null,
  saveDialogSession: async (session: any) => {},
  findDialogSessionById: async (id: string) => null,
  log: (message: string, context?: object) => console.log(`[TEST LOG] ${message}`, context),
};

test('should process incoming message and return welcome message for new user', async () => {
  const input: IncomingMessageDto = {
    userId: 'test-user-1',
    platform: 'telegram',
    messageId: 'msg-1',
    text: '/start',
    timestamp: new Date(),
  };

  const result = await processMessageUseCase(input, mockDependencies);

  expect(result.userId).toBe('test-user-1');
  expect(result.platform).toBe('telegram');
  expect(result.text).toContain('Привет! 👋');
  expect(result.buttons).toBeDefined();
  expect(result.buttons?.length).toBe(3);
});