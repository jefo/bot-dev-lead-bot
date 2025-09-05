import { selectNicheUseCase, selectPainPointUseCase } from '../../application/use-cases/business-owner-path.use-cases';
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

  // Если это нажатие на кнопку
  if (update.callback_query) {
    const telegramId = update.callback_query.from.id;
    const data = update.callback_query.data as string;

    // --- РОУТИНГ НАЖАТИЙ НА КНОПКИ ---

    // 1. Выбор роли
    try {
      const role = UserRoleSchema.parse(data);
      console.log(`[Controller]: Received role selection callback: ${role} from ${telegramId}.`);
      await selectRoleUseCase({ telegramId, role });
      return;
    } catch (e) {
      // Это не ошибка, просто callback_data не является ролью
    }

    // 2. Выбор ниши
    if (data.startsWith('niche:')) {
      const niche = data.substring(6);
      console.log(`[Controller]: Received niche selection callback: ${niche} from ${telegramId}.`);
      await selectNicheUseCase({ telegramId, value: niche });
      return;
    }

    // 3. Выбор "боли"
    if (data.startsWith('pain:')) {
      const painPoint = data.substring(5);
      console.log(`[Controller]: Received pain point selection callback: ${painPoint} from ${telegramId}.`);
      await selectPainPointUseCase({ telegramId, value: painPoint });
      return;
    }

    console.warn(`[Controller]: Received unhandled callback_query data: ${data}`);
  }
}