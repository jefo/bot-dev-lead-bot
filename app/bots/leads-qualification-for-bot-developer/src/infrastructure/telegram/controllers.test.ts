import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { handleTelegramUpdate } from './onboarding.controllers';
import { startOnboardingUseCase, selectRoleUseCase } from '../../application/use-cases/onboarding.use-cases';
import { selectNicheUseCase, selectPainPointUseCase } from '../../application/use-cases/business-owner-path.use-cases';

// Мокируем use case'ы, чтобы проверять, что контроллер их правильно вызывает
const mockStartOnboardingUseCase = jest.fn();
const mockSelectRoleUseCase = jest.fn();
const mockSelectNicheUseCase = jest.fn();
const mockSelectPainPointUseCase = jest.fn();

describe('Telegram Controller Integration Test', () => {
  beforeEach(() => {
    resetDI();
    // Очищаем моки перед каждым тестом
    mockStartOnboardingUseCase.mockClear();
    mockSelectRoleUseCase.mockClear();
    mockSelectNicheUseCase.mockClear();
    mockSelectPainPointUseCase.mockClear();

    // Временно подменяем функции use case'ов для тестирования контроллера
    // @ts-ignore
    globalThis.startOnboardingUseCase = mockStartOnboardingUseCase;
    // @ts-ignore
    globalThis.selectRoleUseCase = mockSelectRoleUseCase;
    // @ts-ignore
    globalThis.selectNicheUseCase = mockSelectNicheUseCase;
    // @ts-ignore
    globalThis.selectPainPointUseCase = mockSelectPainPointUseCase;
  });

  it('should call startOnboardingUseCase for /start command', async () => {
    const USER_ID = 123;
    const update = {
      message: {
        from: { id: USER_ID, username: 'testuser' },
        text: '/start',
      },
    };

    await handleTelegramUpdate(update);

    expect(mockStartOnboardingUseCase).toHaveBeenCalledTimes(1);
    expect(mockStartOnboardingUseCase).toHaveBeenCalledWith({
      telegramId: USER_ID,
      username: 'testuser',
    });
  });

  it('should call selectRoleUseCase for role selection callback', async () => {
    const USER_ID = 123;
    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'business_owner',
      },
    };

    await handleTelegramUpdate(update);

    expect(mockSelectRoleUseCase).toHaveBeenCalledTimes(1);
    expect(mockSelectRoleUseCase).toHaveBeenCalledWith({
      telegramId: USER_ID,
      role: 'business_owner',
    });
  });

  it('should call selectNicheUseCase for niche selection callback', async () => {
    const USER_ID = 123;
    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'niche:infobiz',
      },
    };

    await handleTelegramUpdate(update);

    expect(mockSelectNicheUseCase).toHaveBeenCalledTimes(1);
    expect(mockSelectNicheUseCase).toHaveBeenCalledWith({
      telegramId: USER_ID,
      value: 'infobiz',
    });
  });

  it('should call selectPainPointUseCase for pain point selection callback', async () => {
    const USER_ID = 123;
    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'pain:sales_automation',
      },
    };

    await handleTelegramUpdate(update);

    expect(mockSelectPainPointUseCase).toHaveBeenCalledTimes(1);
    expect(mockSelectPainPointUseCase).toHaveBeenCalledWith({
      telegramId: USER_ID,
      value: 'sales_automation',
    });
  });
});