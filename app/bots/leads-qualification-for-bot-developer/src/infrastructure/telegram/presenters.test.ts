import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { findQualificationProfileByTelegramIdPort } from '../../application/ports/onboarding.ports';
import { welcomeUserAdapter } from './onboarding.presenters';
import { askNicheQuestionPresenter, askPainPointQuestionPresenter, onRelevantCasePresenter } from './business-owner.presenters';
import { telegramApi } from './telegramApi';

// Mock Telegram API
const mockSendMessage = jest.fn();

// Mock Profile Finder (для презентеров, которым нужен профиль)
const mockFindProfile = jest.fn();

describe('Telegram Presenters Integration Tests', () => {
  beforeEach(() => {
    resetDI();
    mockSendMessage.mockClear();
    mockFindProfile.mockClear();

    // Связываем мок Telegram API
    telegramApi.sendMessage = mockSendMessage;

    // Связываем мок findProfile, если презентер его использует
    setPortAdapter(findQualificationProfileByTelegramIdPort, mockFindProfile);
  });

  it('welcomeUserAdapter should send the correct welcome message and role selection keyboard', async () => {
    const USER_ID = 123;
    await welcomeUserAdapter({ telegramId: USER_ID });

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(
      USER_ID,
      expect.stringContaining('Здравствуйте! Увидел ваш интерес на Kwork.'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.arrayContaining([
            expect.arrayContaining([expect.objectContaining({ callback_data: 'business_owner' })]),
            expect.arrayContaining([expect.objectContaining({ callback_data: 'specialist' })]),
            expect.arrayContaining([expect.objectContaining({ callback_data: 'explorer' })]),
          ]),
        }),
      }),
    );
  });

  it('askNicheQuestionPresenter should send the correct niche selection keyboard', async () => {
    const USER_ID = 123;
    await askNicheQuestionPresenter({ telegramId: USER_ID });

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(
      USER_ID,
      expect.stringContaining('Отлично! Чтобы я мог дать точные рекомендации, подскажите, в какой сфере ваш бизнес?'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.arrayContaining([
            expect.arrayContaining([expect.objectContaining({ callback_data: 'niche:ecommerce' })]),
            expect.arrayContaining([expect.objectContaining({ callback_data: 'niche:infobiz' })]),
          ]),
        }),
      }),
    );
  });

  it('askPainPointQuestionPresenter should send the correct pain point selection keyboard based on niche', async () => {
    const USER_ID = 123;
    // Мокируем профиль, чтобы презентер мог получить нишу
    mockFindProfile.mockResolvedValue({
      state: { telegramId: USER_ID, niche: 'infobiz' }
    });

    await askPainPointQuestionPresenter({ telegramId: USER_ID });

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(
      USER_ID,
      expect.stringContaining('Понял. А какая задача для вас сейчас самая острая?'),
      expect.objectContaining({
        reply_markup: expect.objectContaining({
          inline_keyboard: expect.arrayContaining([
            expect.arrayContaining([expect.objectContaining({ callback_data: 'pain:sales_automation' })]),
            expect.arrayContaining([expect.objectContaining({ callback_data: 'pain:support_automation' })]),
            expect.arrayContaining([expect.objectContaining({ callback_data: 'pain:community' })]),
          ]),
        }),
      }),
    );
  });

  it('onRelevantCasePresenter should send the correct case study based on niche and pain point', async () => {
    const USER_ID = 123;
    // Мокируем профиль с нишей и болью
    mockFindProfile.mockResolvedValue({
      state: { telegramId: USER_ID, niche: 'infobiz', painPoint: 'sales_automation' }
    });

    await onRelevantCasePresenter({ telegramId: USER_ID });

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSendMessage).toHaveBeenCalledWith(
      USER_ID,
      expect.stringContaining('Кейс: Инфобизнес + Продажи.'),
      expect.objectContaining({ parse_mode: 'Markdown' }),
    );
  });
});
