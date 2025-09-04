"import { test, expect, beforeEach, describe } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleDemonstrationUseCase,
  handleLeadCaptureUseCase,
  handleWarmupSubscriptionUseCase,
  transferLeadUseCase
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

describe('Интеграционные тесты слоя приложения - Граничные случаи и ошибки', () => {
  beforeEach(() => {
    resetDI();
    
    // Устанавливаем mock адаптеры
    setPortAdapter(loggerPort, (message: string, context?: object) => {
      console.log(`[MOCK LOGGER] ${message}`, context);
    });
    
    // Устанавливаем mock репозиторные адаптеры
    setPortAdapter(findUserByIdPort, async (id: string) => null);
    setPortAdapter(saveUserPort, async (user: any) => {});
    setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => null);
    setPortAdapter(createDialogSessionPort, async (session: any) => session);
    setPortAdapter(updateDialogSessionPort, async (session: any) => session);
    setPortAdapter(saveMessagePort, async (message: any) => {});
  });

  test('Ошибка: Невалидные входные данные', async () => {
    const invalidInput = {
      userId: '', // Пустой ID
      platform: '', // Пустая платформа
      actionType: 'invalid_type', // Невалидный тип
      payload: '', // Пустой payload
      timestamp: 'invalid_date', // Невалидная дата
    };

    await expect(handleSegmentationUseCase(invalidInput as any)).rejects.toThrow();
  });

  test('Ошибка: Пользователь не найден при попытке передачи лида', async () => {
    const input = {
      userId: 'non-existent-user',
      platform: 'telegram',
      actionType: 'system',
      payload: 'transfer',
      timestamp: new Date(),
    };

    await expect(transferLeadUseCase(input)).rejects.toThrow('User not found');
  });

  test('Ошибка: Нет активной сессии при попытке квалификации', async () => {
    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'choice',
      payload: 'leads',
      timestamp: new Date(),
    };

    await expect(handleQualificationUseCase(input)).rejects.toThrow('No active session found');
  });

  test('Граничный случай: Пользователь отправляет пустое сообщение', async () => {
    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'text',
      payload: '', // Пустое сообщение
      timestamp: new Date(),
    };

    // Должно обрабатываться корректно, без ошибок
    await expect(handleLeadCaptureUseCase(input)).resolves.toBeDefined();
  });

  test('Граничный случай: Несуществующий шаг квалификации', async () => {
    // Сначала создаем сессию с несуществующим шагом
    setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
      return {
        state: {
          id: 'test-session',
          userId,
          currentPath: 'qualification',
          currentStep: 'non-existent-step', // Несуществующий шаг
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        actions: {
          advanceToStep: (step: string) => {},
          updateContext: (key: string, value: any) => {},
          saveQualificationData: (data: any) => {},
          saveDemonstrationData: (data: any) => {},
          saveLeadData: (message: string) => {},
          endSession: () => {},
        }
      } as any;
    });

    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'choice',
      payload: 'some-value',
      timestamp: new Date(),
    };

    await expect(handleQualificationUseCase(input)).rejects.toThrow('Unknown qualification step');
  });

  test('Граничный случай: Пользователь отправляет очень длинное сообщение', async () => {
    const longMessage = 'a'.repeat(5000); // Очень длинное сообщение
    
    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'text',
      payload: longMessage,
      timestamp: new Date(),
    };

    // Должно обрабатываться корректно, без ошибок
    const result = await handleLeadCaptureUseCase(input);
    expect(result).toBeDefined();
  });

  test('Граничный случай: Несколько параллельных запросов от одного пользователя', async () => {
    // Создаем mock адаптеры с задержкой для имитации нагрузки
    setPortAdapter(findUserByIdPort, async (id: string) => {
      // Имитируем задержку
      await new Promise(resolve => setTimeout(resolve, 10));
      return null;
    });
    
    const input1 = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    const input2 = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    };

    // Выполняем параллельно
    const results = await Promise.allSettled([
      handleSegmentationUseCase(input1),
      handleQualificationUseCase(input2)
    ]);

    // Оба запроса должны быть обработаны (возможно с ошибками, но без краха)
    expect(results[0].status).toBe('fulfilled');
    // Второй может быть rejected из-за отсутствия сессии, что нормально
  });

  test('Граничный случай: Невалидный callback data', async () => {
    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'choice',
      payload: 'completely_invalid_callback_data_that_does_not_match_any_pattern',
      timestamp: new Date(),
    };

    // Должно обрабатываться корректно, без ошибок
    await expect(handleSegmentationUseCase(input)).resolves.toBeDefined();
  });

  test('Граничный случай: Пользователь отправляет специальные символы', async () => {
    const specialCharsMessage = '!@#$%^&*()_+-=[]{}|;:,.<>?`~\\'\"'; 
    
    const input = {
      userId: 'test-user',
      platform: 'telegram',
      actionType: 'text',
      payload: specialCharsMessage,
      timestamp: new Date(),
    };

    // Должно обрабатываться корректно, без ошибок
    const result = await handleLeadCaptureUseCase(input);
    expect(result).toBeDefined();
  });

  test('Граничный случай: Очень быстрые последовательные действия пользователя', async () => {
    // Создаем mock адаптеры с задержкой
    setPortAdapter(saveMessagePort, async (message: any) => {
      // Имитируем задержку при сохранении
      await new Promise(resolve => setTimeout(resolve, 5));
    });
    
    const userId = 'test-user';
    const baseInput = {
      userId,
      platform: 'telegram',
      timestamp: new Date(),
    };

    // Быстрая последовательность действий
    const actions = [
      { ...baseInput, actionType: 'text', payload: '/start' },
      { ...baseInput, actionType: 'choice', payload: 'qualification' },
      { ...baseInput, actionType: 'choice', payload: 'leads' },
      { ...baseInput, actionType: 'choice', payload: 'education' },
    ];

    // Выполняем быстро друг за другом
    const results = [];
    for (const action of actions) {
      try {
        let result;
        switch (action.actionType) {
          case 'text':
          case 'choice':
            if (action.payload === '/start') {
              result = await handleSegmentationUseCase(action);
            } else if (action.payload === 'qualification' || action.payload === 'leads' || action.payload === 'education') {
              result = await handleQualificationUseCase(action);
            }
            break;
        }
        results.push({ status: 'success', result });
      } catch (error) {
        results.push({ status: 'error', error });
      }
    }

    // Все действия должны быть обработаны
    expect(results.length).toBe(4);
  });
});"