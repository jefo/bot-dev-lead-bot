import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { findQualificationProfileByTelegramIdPort } from '../../application/ports/onboarding.ports';
import { PainPointSelectionKeyboard } from './components/business-owner/PainPointSelectionKeyboard';
import { NicheSelectionKeyboard } from './components/business-owner/NicheSelectionKeyboard';
import { telegramApi } from './telegramApi';
import { RelevantCaseDisplay } from './components/business-owner/RelevantCaseDisplay';

/**
 * Презентер, который задает вопрос о нише бизнеса.
 */
export async function askNicheQuestionPresenter(output: { telegramId: number }): Promise<void> {
  const text = 'Отлично! Чтобы я мог дать точные рекомендации, подскажите, в какой сфере ваш бизнес?';
  const keyboard = NicheSelectionKeyboard();
  await telegramApi.sendMessage(output.telegramId, text, { reply_markup: keyboard });
}

/**
 * Презентер, который задает вопрос о "боли" клиента.
 * Теперь он использует usePort напрямую.
 */
export async function askPainPointQuestionPresenter(
  output: { telegramId: number }
): Promise<void> {
  const findProfile = usePort(findQualificationProfileByTelegramIdPort);
  const profile = await findProfile(output.telegramId);
  const niche = profile?.state.niche;

  const text = 'Понял. А какая задача для вас сейчас самая острая?';
  const keyboard = PainPointSelectionKeyboard({ niche });
  await telegramApi.sendMessage(output.telegramId, text, { reply_markup: keyboard });
}

/**
 * Презентер, который показывает релевантный кейс на основе ниши и боли клиента.
 */
export async function onRelevantCasePresenter(output: { telegramId: number }): Promise<void> {
  const findProfile = usePort(findQualificationProfileByTelegramIdPort);
  const profile = await findProfile(output.telegramId);

  if (!profile || !profile.state.niche || !profile.state.painPoint) {
    // Если профиль неполный, отправляем общее сообщение
    await telegramApi.sendMessage(output.telegramId, 'Извините, не удалось подобрать релевантный кейс. Расскажите о вашей задаче подробнее!');
    return;
  }

  // Используем компонент для генерации сообщения с кейсом
  const messagePayload = RelevantCaseDisplay({
    niche: profile.state.niche,
    painPoint: profile.state.painPoint,
  });

  await telegramApi.sendMessage(output.telegramId, messagePayload.text, { parse_mode: messagePayload.parse_mode });
}
