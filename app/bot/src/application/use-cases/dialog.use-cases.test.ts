import { test, expect, beforeEach } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { handleUserActionUseCase } from './dialog.use-cases';
import { 
  findUserByIdPort, 
  saveUserPort, 
  findActiveDialogSessionByUserIdPort, 
  createDialogSessionPort, 
  updateDialogSessionPort, 
  saveMessagePort, 
  loggerPort 
} from '../../domain/ports/bot.ports';
import { consoleLoggerAdapter } from '../../infrastructure/telegram/adapters/telegram.adapters';
import { SingleChoiceDto, InfoMessageDto } from '../dtos/platform-agnostic.dtos';

// Сброс DI container перед каждым тестом
beforeEach(() => {
  resetDI();
  
  // Устанавливаем mock адаптеры для тестирования
  setPortAdapter(findUserByIdPort, async (id: string) => null);
  setPortAdapter(saveUserPort, async (user: any) => {});
  setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => null);
  setPortAdapter(createDialogSessionPort, async (session: any) => session);
  setPortAdapter(updateDialogSessionPort, async (session: any) => session);
  setPortAdapter(saveMessagePort, async (message: any) => {});
  setPortAdapter(loggerPort, consoleLoggerAdapter);
});

test('should handle new user and return welcome message with choices', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'text',
    payload: '/start',
    timestamp: new Date(),
  };

  const result = await handleUserActionUseCase(input);

  // Проверяем, что результат является правильным DTO
  expect(result).toBeDefined();
  expect((result as InfoMessageDto).content).toContain('Добро пожаловать');
  
  // Проверяем, что следующий шаг - выбор
  const nextInput = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'text',
    payload: 'audit',
    timestamp: new Date(),
  };
  
  const nextResult = await handleUserActionUseCase(nextInput);
  expect(nextResult).toBeDefined();
  expect((nextResult as SingleChoiceDto).question).toContain('в какой сфере ваш бизнес');
  expect((nextResult as SingleChoiceDto).options.length).toBe(5);
});

test('should validate input data', async () => {
  const invalidInput = {
    userId: 'test-user-1',
    platform: '', // Пустая платформа
    actionType: 'invalid-type', // Невалидный тип действия
    payload: '/start',
    timestamp: new Date(),
  };

  await expect(handleUserActionUseCase(invalidInput)).rejects.toThrow();
});

test('should return platform-agnostic DTOs', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'text',
    payload: '/start',
    timestamp: new Date(),
  };

  const result = await handleUserActionUseCase(input);
  
  // Проверяем, что результат соответствует одному из ожидаемых типов DTO
  if (result && 'options' in result) {
    // Это SingleChoiceDto
    expect((result as SingleChoiceDto).question).toBeDefined();
    expect((result as SingleChoiceDto).options).toBeInstanceOf(Array);
  } else if (result && 'content' in result) {
    // Это InfoMessageDto
    expect((result as InfoMessageDto).content).toBeDefined();
  }
});