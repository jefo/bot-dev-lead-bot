import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import {
  businessOwnerPathSelectedOutPort,
  explorerPathSelectedOutPort,
  findQualificationProfileByTelegramIdPort,
  saveQualificationProfilePort,
  specialistPathSelectedOutPort,
  userWelcomedOutPort
} from './ports/onboarding.ports';
import { painPointQuestionOutPort, relevantCaseOutPort } from './ports/business-owner.ports';
import { startOnboardingUseCase, selectRoleUseCase } from './use-cases/onboarding.use-cases';
import { selectNicheUseCase, selectPainPointUseCase } from './use-cases/business-owner-path.use-cases';
import type { QualificationProfile } from '../domain/entities/qualification-profile.entity';

// --- Mocks & Spies for Application Layer Test ---

const memoryDB = new Map<number, InstanceType<typeof QualificationProfile>>();

const mockFindProfileAdapter = async (telegramId: number) => memoryDB.get(telegramId) || null;
const mockSaveProfileAdapter = async (profile: InstanceType<typeof QualificationProfile>) => {
  memoryDB.set(profile.state.telegramId, profile);
};

// Эти шпионы теперь просто проверяют вызов портов, а не реальных презентеров
const userWelcomedOutPortSpy = jest.fn();
const businessOwnerPathSelectedOutPortSpy = jest.fn();
const specialistPathSelectedOutPortSpy = jest.fn();
const explorerPathSelectedOutPortSpy = jest.fn();
const painPointQuestionOutPortSpy = jest.fn();
const relevantCaseOutPortSpy = jest.fn();


describe('Application Layer Integration Test: Business Owner Path', () => {

  beforeEach(() => {
    resetDI();
    memoryDB.clear();
    // Очищаем все шпионы перед каждым тестом
    userWelcomedOutPortSpy.mockClear();
    businessOwnerPathSelectedOutPortSpy.mockClear();
    specialistPathSelectedOutPortSpy.mockClear();
    explorerPathSelectedOutPortSpy.mockClear();
    painPointQuestionOutPortSpy.mockClear();
    relevantCaseOutPortSpy.mockClear();

    // --- Composition Root (локальный для теста) ---
    // Связываем порты репозитория с mock-адаптерами
    setPortAdapter(findQualificationProfileByTelegramIdPort, mockFindProfileAdapter);
    setPortAdapter(saveQualificationProfilePort, mockSaveProfileAdapter);

    // Связываем порты вывода с нашими шпионами
    setPortAdapter(userWelcomedOutPort, userWelcomedOutPortSpy);
    setPortAdapter(businessOwnerPathSelectedOutPort, businessOwnerPathSelectedOutPortSpy);
    setPortAdapter(specialistPathSelectedOutPort, specialistPathSelectedOutPortSpy);
    setPortAdapter(explorerPathSelectedOutPort, explorerPathSelectedOutPortSpy);
    setPortAdapter(painPointQuestionOutPort, painPointQuestionOutPortSpy);
    setPortAdapter(relevantCaseOutPort, relevantCaseOutPortSpy);
  });

  it('should correctly handle the full user journey: /start -> select role -> select niche -> select pain point', async () => {
    const USER_ID = 12345;

    // --- Этап 1: Пользователь отправляет /start ---
    await startOnboardingUseCase({ telegramId: USER_ID, username: 'testuser' });

    // Проверка 1: Порт приветствия был вызван
    expect(userWelcomedOutPortSpy).toHaveBeenCalledTimes(1);
    expect(userWelcomedOutPortSpy).toHaveBeenCalledWith({ telegramId: USER_ID });
    expect(memoryDB.get(USER_ID)?.state.role).toBeNull();

    // --- Этап 2: Пользователь выбирает роль "Владелец бизнеса" ---
    await selectRoleUseCase({ telegramId: USER_ID, role: 'business_owner' });

    // Проверка 2: Порт выбора пути владельца бизнеса был вызван
    expect(businessOwnerPathSelectedOutPortSpy).toHaveBeenCalledTimes(1);
    expect(businessOwnerPathSelectedOutPortSpy).toHaveBeenCalledWith({ telegramId: USER_ID, role: 'business_owner' });
    expect(memoryDB.get(USER_ID)?.state.role).toBe('business_owner');
    expect(specialistPathSelectedOutPortSpy).not.toHaveBeenCalled(); // Убедимся, что другие пути не вызваны

    // --- Этап 3: Пользователь выбирает нишу "Инфобизнес" ---
    await selectNicheUseCase({ telegramId: USER_ID, value: 'infobiz' });

    // Проверка 3: Порт вопроса о боли был вызван
    expect(painPointQuestionOutPortSpy).toHaveBeenCalledTimes(1);
    expect(painPointQuestionOutPortSpy).toHaveBeenCalledWith({ telegramId: USER_ID });
    expect(memoryDB.get(USER_ID)?.state.niche).toBe('infobiz');

    // --- Этап 4: Пользователь выбирает "боль" "Автоматизация продаж" ---
    await selectPainPointUseCase({ telegramId: USER_ID, value: 'sales_automation' });

    // Проверка 4: Порт показа релевантного кейса был вызван
    expect(relevantCaseOutPortSpy).toHaveBeenCalledTimes(1);
    expect(relevantCaseOutPortSpy).toHaveBeenCalledWith({ telegramId: USER_ID });

    // Финальная проверка состояния профиля в "базе данных"
    const finalProfile = memoryDB.get(USER_ID);
    expect(finalProfile?.state.role).toBe('business_owner');
    expect(finalProfile?.state.niche).toBe('infobiz');
    expect(finalProfile?.state.painPoint).toBe('sales_automation');
  });
});
