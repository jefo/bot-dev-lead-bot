import { test, expect, beforeEach } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleDemonstrationUseCase,
  handleLeadCaptureUseCase
} from './extended.use-cases';
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
import { 
  SegmentationChoiceDto,
  QualificationQuestionDto,
  DemonstrationGalleryDto,
  LeadCaptureDto
} from '../dtos/extended.dtos';
import { DialogSession } from '../../domain/entities/extended.entities';
import { DialogSessionId, UserId } from '../../domain/shared/ids';

// Сброс DI container перед каждым тестом
beforeEach(() => {
  resetDI();
  
  // Устанавливаем mock адаптеры для тестирования
  setPortAdapter(findUserByIdPort, async (id: string) => null);
  setPortAdapter(saveUserPort, async (user: any) => {});
  setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
    // Создаем mock сессию для тестов
    return DialogSession.create({
      id: DialogSessionId.create('test-session-id').value,
      userId: UserId.create(userId).value,
      currentPath: 'segmentation',
      currentStep: 'welcome',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
  setPortAdapter(createDialogSessionPort, async (session: any) => session);
  setPortAdapter(updateDialogSessionPort, async (session: any) => session);
  setPortAdapter(saveMessagePort, async (message: any) => {});
  setPortAdapter(loggerPort, consoleLoggerAdapter);
});

test('should handle user segmentation and return segmentation choices', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'text',
    payload: '/start',
    timestamp: new Date(),
  };

  const result = await handleSegmentationUseCase(input);

  // Проверяем, что результат является правильным DTO
  expect(result).toBeDefined();
  expect(result.greeting).toContain('Добро пожаловать');
  expect(result.options.length).toBe(3);
  expect(result.options[0].value).toBe('qualification');
  expect(result.options[1].value).toBe('demonstration');
  expect(result.options[2].value).toBe('direct_contact');
});

test('should handle qualification path and return pain point question', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'qualification',
    timestamp: new Date(),
  };

  const result = await handleQualificationUseCase(input);

  // Проверяем, что результат является правильным DTO
  expect(result).toBeDefined();
  expect(result.step).toBe('pain_point');
  expect(result.question).toContain('Какую основную задачу должен решить бот');
  expect(result.options.length).toBe(4);
});

test('should handle demonstration path and return gallery', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'demonstration',
    timestamp: new Date(),
  };

  const result = await handleDemonstrationUseCase(input);

  // Проверяем, что результат является правильным DTO
  expect(result).toBeDefined();
  expect((result as DemonstrationGalleryDto).title).toBe('Возможности ботов');
  expect((result as DemonstrationGalleryDto).demonstrations.length).toBe(4);
});

test('should handle lead capture and return capture form', async () => {
  const input = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'direct_contact',
    timestamp: new Date(),
  };

  const result = await handleLeadCaptureUseCase(input);

  // Проверяем, что результат является правильным DTO
  expect(result).toBeDefined();
  expect((result as LeadCaptureDto).title).toBe('Отлично!');
  expect((result as LeadCaptureDto).placeholder).toBeDefined();
});

test('should validate input data for all use cases', async () => {
  const invalidInput = {
    userId: 'test-user-1',
    platform: '', // Пустая платформа
    actionType: 'invalid-type', // Невалидный тип действия
    payload: '/start',
    timestamp: new Date(),
  };

  await expect(handleSegmentationUseCase(invalidInput)).rejects.toThrow();
});

test('should handle qualification flow step by step', async () => {
  // Шаг 1: Pain point
  const painPointInput = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'leads', // Выбираем "Лидогенерация и продажи"
    timestamp: new Date(),
  };

  const painPointResult = await handleQualificationUseCase(painPointInput);
  expect(painPointResult.step).toBe('niche');

  // Шаг 2: Niche
  const nicheInput = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'education', // Выбираем "Онлайн-образование"
    timestamp: new Date(),
  };

  const nicheResult = await handleQualificationUseCase(nicheInput);
  expect(nicheResult.step).toBe('scale');

  // Шаг 3: Scale
  const scaleInput = {
    userId: 'test-user-1',
    platform: 'telegram',
    actionType: 'choice',
    payload: 'traffic', // Выбираем "Есть стабильный трафик/клиенты"
    timestamp: new Date(),
  };

  const scaleResult = await handleQualificationUseCase(scaleInput);
  expect(scaleResult.step).toBe('value_proposition');
});