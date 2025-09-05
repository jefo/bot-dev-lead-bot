import { setPortAdapter, resetDI } from '@maxdev1/sotajs/lib/di.v2';
import {
  businessOwnerPathSelectedOutPort,
  explorerPathSelectedOutPort,
  findQualificationProfileByTelegramIdPort,
  saveQualificationProfilePort,
  specialistPathSelectedOutPort,
  userWelcomedOutPort
} from '../application/ports/onboarding.ports';
import { pathSelectedAdapter, welcomeUserAdapter } from '../infrastructure/telegram/onboarding.presenters';
import { QualificationProfile } from '../domain/entities/qualification-profile.entity';

// --- Mock-реализации для портов репозитория (для тестирования) ---

// Используем in-memory хранилище для простоты
const memoryDB = new Map<number, InstanceType<typeof QualificationProfile>>();

const mockFindProfileAdapter = async (telegramId: number) => {
  return memoryDB.get(telegramId) || null;
};

const mockSaveProfileAdapter = async (profile: InstanceType<typeof QualificationProfile>) => {
  memoryDB.set(profile.state.telegramId, profile);
};


/**
 * Функция композиции зависимостей для модуля онбординга.
 * Связывает абстрактные порты с их конкретными реализациями (адаптерами).
 */
export function composeOnboarding() {
  // Очищаем контейнер перед каждой композицией (важно для тестов)
  resetDI();

  // Связываем порты репозитория с mock-адаптерами
  setPortAdapter(findQualificationProfileByTelegramIdPort, mockFindProfileAdapter);
  setPortAdapter(saveQualificationProfilePort, mockSaveProfileAdapter);

  // Связываем семантические порты вывода с адаптерами-презентерами
  setPortAdapter(userWelcomedOutPort, welcomeUserAdapter);
  setPortAdapter(businessOwnerPathSelectedOutPort, pathSelectedAdapter);
  setPortAdapter(specialistPathSelectedOutPort, pathSelectedAdapter);
  setPortAdapter(explorerPathSelectedOutPort, pathSelectedAdapter);

  console.log('[Composition]: Onboarding module composed successfully.');
}
