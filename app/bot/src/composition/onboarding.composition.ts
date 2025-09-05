import { setPortAdapter, resetDI, setPortAdapterWithDependencies, usePort } from '@maxdev1/sotajs/lib/di.v2';
import {
  businessOwnerPathSelectedOutPort,
  explorerPathSelectedOutPort,
  findQualificationProfileByTelegramIdPort,
  saveQualificationProfilePort,
  specialistPathSelectedOutPort,
  userWelcomedOutPort
} from '../application/ports/onboarding.ports';
import { painPointQuestionOutPort } from '../application/ports/business-owner.ports';
import { pathSelectedAdapter, welcomeUserAdapter } from '../infrastructure/telegram/onboarding.presenters';
import { QualificationProfile } from '../domain/entities/qualification-profile.entity';
import { askNicheQuestionPresenter, askPainPointQuestionPresenter } from '../infrastructure/telegram/business-owner.presenters';

// --- Mock-реализации для портов репозитория (для тестирования) ---

const memoryDB = new Map<number, InstanceType<typeof QualificationProfile>>();

const mockFindProfileAdapter = async (telegramId: number) => {
  return memoryDB.get(telegramId) || null;
};

const mockSaveProfileAdapter = async (profile: InstanceType<typeof QualificationProfile>) => {
  memoryDB.set(profile.state.telegramId, profile);
};


/**
 * Функция композиции зависимостей для модуля онбординга.
 */
export function composeOnboarding() {
  resetDI();

  // Связываем порты репозитория
  setPortAdapter(findQualificationProfileByTelegramIdPort, mockFindProfileAdapter);
  setPortAdapter(saveQualificationProfilePort, mockSaveProfileAdapter);

  // Связываем порты онбординга
  setPortAdapter(userWelcomedOutPort, welcomeUserAdapter);
  setPortAdapter(businessOwnerPathSelectedOutPort, askNicheQuestionPresenter);
  setPortAdapter(specialistPathSelectedOutPort, pathSelectedAdapter);
  setPortAdapter(explorerPathSelectedOutPort, pathSelectedAdapter);

  // Связываем порты бизнес-пути
  setPortAdapter(painPointQuestionOutPort, askPainPointQuestionPresenter);

  console.log('[Composition]: Onboarding & Business Path modules composed successfully.');
}ByTelegramIdPort);
    return (output: { telegramId: number; }) => askPainPointQuestionPresenter(output, { findProfile });
  };
  setPortAdapterWithDependencies(painPointQuestionOutPort, askPainPointQuestionPresenterFactory);

  console.log('[Composition]: Onboarding & Business Path modules composed successfully.');
}