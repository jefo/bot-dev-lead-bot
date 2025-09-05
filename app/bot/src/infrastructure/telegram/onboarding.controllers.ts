import { selectRoleUseCase, startOnboardingUseCase } from '../../application/use-cases/onboarding.use-cases';
import { UserRoleSchema } from '../../domain/entities/qualification-profile.entity';

/**
 * Контроллер (Driving Adapter), который обрабатывает входящие
 * обновления от Telegram.
 */
export async function handleTelegramUpdate(update: any): Promise<void> {
  // Если это команда /start
  if (update.message && update.message.text === '/start') {
    const telegramId = update.message.from.id;
    const username = update.message.from.username;

    console.log(`[Controller]: Received /start command from ${username} (${telegramId}).`);
    await startOnboardingUseCase({ telegramId, username });
    return;
  }

  // Если это нажатие на кнопку выбора роли
  if (update.callback_query) {
    const telegramId = update.callback_query.from.id;
    const role = UserRoleSchema.parse(update.callback_query.data);

    console.log(`[Controller]: Received role selection callback: ${role} from ${telegramId}.`);
    await selectRoleUseCase({ telegramId, role });
    return;
  }
}