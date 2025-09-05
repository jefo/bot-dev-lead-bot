import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { handleTelegramUpdate } from './onboarding.controllers';
import {
  businessOwnerPathSelectedOutPort,
  explorerPathSelectedOutPort,
  findQualificationProfileByTelegramIdPort,
  saveQualificationProfilePort,
  specialistPathSelectedOutPort,
  userWelcomedOutPort
} from '../../application/ports/onboarding.ports';
import { painPointQuestionOutPort, relevantCaseOutPort } from '../../application/ports/business-owner.ports';
import { QualificationProfile } from '../../domain/entities/qualification-profile.entity';

// --- Mocks & Spies for Application Layer Test ---

const memoryDB = new Map<number, InstanceType<typeof QualificationProfile>>();

// Мокируем порты, которые use case'ы используют
const mockFindProfileAdapter = jest.fn();
const mockSaveProfileAdapter = jest.fn();
const mockUserWelcomedOutPort = jest.fn();
const mockBusinessOwnerPathSelectedOutPort = jest.fn();
const mockSpecialistPathSelectedOutPort = jest.fn();
const mockExplorerPathSelectedOutPort = jest.fn();
const mockPainPointQuestionOutPort = jest.fn();
const mockRelevantCaseOutPort = jest.fn();

describe('Telegram Controller Integration Test', () => {
  beforeEach(() => {
    resetDI();
    memoryDB.clear(); // Очищаем DB перед каждым тестом
    // Очищаем моки перед каждым тестом
    mockFindProfileAdapter.mockClear();
    mockSaveProfileAdapter.mockClear();
    mockUserWelcomedOutPort.mockClear();
    mockBusinessOwnerPathSelectedOutPort.mockClear();
    mockSpecialistPathSelectedOutPort.mockClear();
    mockExplorerPathSelectedOutPort.mockClear();
    mockPainPointQuestionOutPort.mockClear();
    mockRelevantCaseOutPort.mockClear();

    // Мокируем findProfileAdapter, чтобы он возвращал профиль из memoryDB
    mockFindProfileAdapter.mockImplementation(async (telegramId: number) => {
      return memoryDB.get(telegramId) || null;
    });

    // Мокируем saveProfileAdapter, чтобы он сохранял профиль в memoryDB
    mockSaveProfileAdapter.mockImplementation(async (profile: InstanceType<typeof QualificationProfile>) => {
      memoryDB.set(profile.state.telegramId, profile);
    });

    // Связываем моки с DI-контейнером
    setPortAdapter(findQualificationProfileByTelegramIdPort, mockFindProfileAdapter);
    setPortAdapter(saveQualificationProfilePort, mockSaveProfileAdapter);
    setPortAdapter(userWelcomedOutPort, mockUserWelcomedOutPort);
    setPortAdapter(businessOwnerPathSelectedOutPort, mockBusinessOwnerPathSelectedOutPort);
    setPortAdapter(specialistPathSelectedOutPort, mockSpecialistPathSelectedOutPort);
    setPortAdapter(explorerPathSelectedOutPort, mockExplorerPathSelectedOutPort);
    setPortAdapter(painPointQuestionOutPort, mockPainPointQuestionOutPort);
    setPortAdapter(relevantCaseOutPort, mockRelevantCaseOutPort);
  });

  it('should call startOnboardingUseCase and userWelcomedOutPort for /start command', async () => {
    const USER_ID = 123;
    const update = {
      message: {
        from: { id: USER_ID, username: 'testuser' },
        text: '/start',
      },
    };

    await handleTelegramUpdate(update);

    // Проверяем, что порты, используемые startOnboardingUseCase, были вызваны
    expect(mockFindProfileAdapter).toHaveBeenCalledWith(USER_ID);
    expect(mockSaveProfileAdapter).toHaveBeenCalledTimes(1);
    expect(mockUserWelcomedOutPort).toHaveBeenCalledWith({ telegramId: USER_ID });
  });

  it('should call selectRoleUseCase and businessOwnerPathSelectedOutPort for role selection callback', async () => {
    const USER_ID = 123;
    // Предварительно создаем профиль, чтобы selectRoleUseCase мог его найти
    await handleTelegramUpdate({
      message: { from: { id: USER_ID, username: 'testuser' }, text: '/start' }
    });
    // Очищаем моки после предварительного вызова, чтобы проверять только текущий тест
    mockFindProfileAdapter.mockClear();
    mockSaveProfileAdapter.mockClear();
    mockUserWelcomedOutPort.mockClear();

    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'business_owner',
      },
    };

    await handleTelegramUpdate(update);

    // Проверяем, что порты, используемые selectRoleUseCase, были вызваны
    expect(mockFindProfileAdapter).toHaveBeenCalledWith(USER_ID);
    expect(mockSaveProfileAdapter).toHaveBeenCalledTimes(1);
    expect(mockBusinessOwnerPathSelectedOutPort).toHaveBeenCalledWith({ telegramId: USER_ID, role: 'business_owner' });
  });

  it('should call selectNicheUseCase and painPointQuestionOutPort for niche selection callback', async () => {
    const USER_ID = 123;
    // Предварительно создаем профиль и выбираем роль
    await handleTelegramUpdate({
      message: { from: { id: USER_ID, username: 'testuser' }, text: '/start' }
    });
    await handleTelegramUpdate({
      callback_query: { from: { id: USER_ID }, data: 'business_owner' }
    });
    // Очищаем моки после предварительных вызовов
    mockFindProfileAdapter.mockClear();
    mockSaveProfileAdapter.mockClear();
    mockBusinessOwnerPathSelectedOutPort.mockClear();

    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'niche:infobiz',
      },
    };

    await handleTelegramUpdate(update);

    // Проверяем, что порты, используемые selectNicheUseCase, были вызваны
    expect(mockFindProfileAdapter).toHaveBeenCalledWith(USER_ID);
    expect(mockSaveProfileAdapter).toHaveBeenCalledTimes(1);
    expect(mockPainPointQuestionOutPort).toHaveBeenCalledWith({ telegramId: USER_ID });
  });

  it('should call selectPainPointUseCase and relevantCaseOutPort for pain point selection callback', async () => {
    const USER_ID = 123;
    // Предварительно создаем профиль, выбираем роль и нишу
    await handleTelegramUpdate({
      message: { from: { id: USER_ID, username: 'testuser' }, text: '/start' }
    });
    await handleTelegramUpdate({
      callback_query: { from: { id: USER_ID }, data: 'business_owner' }
    });
    await handleTelegramUpdate({
      callback_query: { from: { id: USER_ID }, data: 'niche:infobiz' }
    });
    // Очищаем моки после предварительных вызовов
    mockFindProfileAdapter.mockClear();
    mockSaveProfileAdapter.mockClear();
    mockPainPointQuestionOutPort.mockClear();

    const update = {
      callback_query: {
        from: { id: USER_ID },
        data: 'pain:sales_automation',
      },
    };

    await handleTelegramUpdate(update);

    // Проверяем, что порты, используемые selectPainPointUseCase, были вызваны
    expect(mockFindProfileAdapter).toHaveBeenCalledWith(USER_ID);
    expect(mockSaveProfileAdapter).toHaveBeenCalledTimes(1);
    expect(mockRelevantCaseOutPort).toHaveBeenCalledWith({ telegramId: USER_ID });
  });
});
