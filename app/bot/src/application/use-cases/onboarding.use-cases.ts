import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { QualificationProfile } from '../../domain/entities/qualification-profile.entity';
import { SelectRoleCommandSchema, StartCommandSchema } from '../dtos/onboarding.dtos';
import {
  businessOwnerPathSelectedOutPort,
  explorerPathSelectedOutPort,
  findQualificationProfileByTelegramIdPort,
  saveQualificationProfilePort,
  specialistPathSelectedOutPort,
  userWelcomedOutPort
} from '../ports/onboarding.ports';
import { randomUUID } from 'crypto';

/**
 * Use Case для старта взаимодействия с ботом.
 */
export async function startOnboardingUseCase(command: unknown): Promise<void> {
  // 1. Валидация и типизация входных данных. Это единственная точка входа для данных.
  const validInput = StartCommandSchema.parse(command);

  // 2. Получение зависимостей через usePort
  const findProfile = usePort(findQualificationProfileByTelegramIdPort);
  const saveProfile = usePort(saveQualificationProfilePort);
  const welcomeUser = usePort(userWelcomedOutPort);

  let profile = await findProfile(validInput.telegramId);

  if (!profile) {
    profile = QualificationProfile.create({
      id: randomUUID(),
      telegramId: validInput.telegramId,
      role: null,
      niche: null,
      painPoint: null,
    });
    await saveProfile(profile);
  }

  // 3. Вызов порта вывода с валидными данными
  await welcomeUser({ telegramId: validInput.telegramId });
}

/**
 * Use Case для выбора роли пользователем.
 */
export async function selectRoleUseCase(command: unknown): Promise<void> {
  // 1. Валидация и типизация
  const validInput = SelectRoleCommandSchema.parse(command);

  // 2. Получение зависимостей
  const findProfile = usePort(findQualificationProfileByTelegramIdPort);
  const saveProfile = usePort(saveQualificationProfilePort);

  const profile = await findProfile(validInput.telegramId);
  if (!profile) {
    throw new Error(`Profile not found for telegramId: ${validInput.telegramId}`);
  }

  // 3. Выполнение бизнес-логики
  profile.actions.assignRole(validInput.role);
  await saveProfile(profile);

  const pathPorts = {
    business_owner: usePort(businessOwnerPathSelectedOutPort),
    specialist: usePort(specialistPathSelectedOutPort),
    explorer: usePort(explorerPathSelectedOutPort),
  };

  // 4. Вызов порта вывода
  const selectedPathPort = pathPorts[validInput.role];
  await selectedPathPort({ telegramId: validInput.telegramId, role: validInput.role });
}