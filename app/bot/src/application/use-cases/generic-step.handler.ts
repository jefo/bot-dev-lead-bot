import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { Port } from '@maxdev1/sotajs/lib/di.v2';
import { QualificationProfile } from '../../domain/entities/qualification-profile.entity';
import { findQualificationProfileByTelegramIdPort, saveQualificationProfilePort } from '../ports/onboarding.ports';
import { GenericSingleChoiceCommand, GenericSingleChoiceCommandSchema } from '../dtos/generic.dtos';

// Описываем конфигурацию для шага с одним выбором
export interface SingleChoiceStepConfig<TValue> {
  updateAction: (profile: InstanceType<typeof QualificationProfile>, value: TValue) => void;
  nextStepOutPort: Port<(output: { telegramId: number }) => Promise<void>>;
}

/**
 * Фабрика, создающая use case для шага диалога с одним выбором.
 */
export function createSingleChoiceStepHandler<TValue>(config: SingleChoiceStepConfig<TValue>) {
  return async function handleSingleChoice(command: unknown): Promise<void> {
    // 1. Валидация общей структуры команды
    const genericCommand = GenericSingleChoiceCommandSchema.parse(command);

    // 2. Получение зависимостей
    const findProfile = usePort(findQualificationProfileByTelegramIdPort);
    const saveProfile = usePort(saveQualificationProfilePort);
    const nextStep = usePort(config.nextStepOutPort);

    // 3. Выполнение бизнес-логики
    const profile = await findProfile(genericCommand.telegramId);
    if (!profile) {
      throw new Error(`Profile not found for telegramId: ${genericCommand.telegramId}`);
    }

    // 4. Вызов функции-апдейтера, которая передает "сырое" значение в сущность
    config.updateAction(profile, genericCommand.value as TValue);

    await saveProfile(profile);

    // 5. Вызов порта следующего шага
    await nextStep({ telegramId: genericCommand.telegramId });
  };
}
