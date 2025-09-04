import { test, expect, beforeEach, describe } from 'bun:test';
import { resetDI, setPortAdapter, usePort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleDemonstrationUseCase,
  handleLeadCaptureUseCase,
  handleWarmupSubscriptionUseCase,
  transferLeadUseCase
} from './extended.use-cases';
import { 
  findUserByIdPort, 
  saveUserPort, 
  findActiveDialogSessionByUserIdPort, 
  createDialogSessionPort, 
  updateDialogSessionPort, 
  saveMessagePort,
  loggerPort
} from '../../domain/ports/bot.ports';
import { 
  showSegmentationPort,
  showQualificationQuestionPort,
  showDemonstrationGalleryPort,
  showDemonstrationDetailPort,
  captureLeadPort,
  showWarmupSubscriptionPort,
  transferLeadPort
} from '../../domain/ports/extended.ports';
import { User, DialogSession } from '../../domain/entities/extended.entities';
import { UserId, DialogSessionId } from '../../domain/shared/ids';

// Mock данные для тестирования
const mockUserId = 'test-user-123';
const mockChatId = 123456789;
const mockUsername = 'testuser';

// Mock адаптеры
const mockLoggerAdapter = (message: string, context?: object) => {
  console.log(`[MOCK LOGGER] ${message}`, context);
};

const mockShowSegmentationAdapter = async (dto: any) => {
  console.log('[MOCK] Showing segmentation:', dto);
  return { success: true };
};

const mockShowQualificationQuestionAdapter = async (dto: any) => {
  console.log('[MOCK] Showing qualification question:', dto);
  return { success: true };
};

const mockShowDemonstrationGalleryAdapter = async (dto: any) => {
  console.log('[MOCK] Showing demonstration gallery:', dto);
  return { success: true };
};

const mockShowDemonstrationDetailAdapter = async (dto: any) => {
  console.log('[MOCK] Showing demonstration detail:', dto);
  return { success: true };
};

const mockCaptureLeadAdapter = async (dto: any) => {
  console.log('[MOCK] Capturing lead:', dto);
  return { success: true };
};

const mockShowWarmupSubscriptionAdapter = async (dto: any) => {
  console.log('[MOCK] Showing warmup subscription:', dto);
  return { success: true };
};

const mockTransferLeadAdapter = async (dto: any) => {
  console.log('[MOCK] Transferring lead:', dto);
  return { success: true };
};

describe('Интеграционные тесты слоя приложения - Happy Path', () => {
  beforeEach(() => {
    resetDI();
    
    // Устанавливаем mock адаптеры
    setPortAdapter(loggerPort, mockLoggerAdapter);
    setPortAdapter(showSegmentationPort, mockShowSegmentationAdapter);
    setPortAdapter(showQualificationQuestionPort, mockShowQualificationQuestionAdapter);
    setPortAdapter(showDemonstrationGalleryPort, mockShowDemonstrationGalleryAdapter);
    setPortAdapter(showDemonstrationDetailPort, mockShowDemonstrationDetailAdapter);
    setPortAdapter(captureLeadPort, mockCaptureLeadAdapter);
    setPortAdapter(showWarmupSubscriptionPort, mockShowWarmupSubscriptionAdapter);
    setPortAdapter(transferLeadPort, mockTransferLeadAdapter);
    
    // Устанавливаем mock репозиторные адаптеры
    setPortAdapter(findUserByIdPort, async (id: string) => {
      if (id === mockUserId) {
        return User.create({
          id: UserId.create(id).value,
          platform: 'telegram',
          username: mockUsername,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        });
      }
      return null;
    });
    
    setPortAdapter(saveUserPort, async (user: any) => {
      console.log('[MOCK] Saving user:', user.state);
    });
    
    setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
      if (userId === mockUserId) {
        return DialogSession.create({
          id: DialogSessionId.create('test-session-id').value,
          userId: UserId.create(userId).value,
          currentPath: 'segmentation',
          currentStep: 'welcome',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return null;
    });
    
    setPortAdapter(createDialogSessionPort, async (session: any) => {
      console.log('[MOCK] Creating dialog session:', session.state);
      return session;
    });
    
    setPortAdapter(updateDialogSessionPort, async (session: any) => {
      console.log('[MOCK] Updating dialog session:', session.state);
      return session;
    });
    
    setPortAdapter(saveMessagePort, async (message: any) => {
      console.log('[MOCK] Saving message:', message.state);
    });
  });

  test('Happy Path: Полный сценарий квалификации лида', async () => {
    // Шаг 1: Пользователь начинает диалог (/start)
    const segmentationInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    const segmentationResult = await handleSegmentationUseCase(segmentationInput);
    
    // Проверяем результат сегментации
    expect(segmentationResult).toBeDefined();
    expect(segmentationResult.greeting).toContain('Добро пожаловать');
    expect(segmentationResult.options.length).toBe(3);
    
    // Шаг 2: Пользователь выбирает путь квалификации
    const qualificationPathInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    };

    const qualificationStep1 = await handleQualificationUseCase(qualificationPathInput);
    
    // Проверяем первый шаг квалификации
    expect(qualificationStep1.step).toBe('pain_point');
    expect(qualificationStep1.question).toContain('Какую основную задачу должен решить бот');
    expect(qualificationStep1.options.length).toBe(4);
    
    // Шаг 3: Пользователь выбирает задачу (Лидогенерация)
    const painPointInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'leads',
      timestamp: new Date(),
    };

    const qualificationStep2 = await handleQualificationUseCase(painPointInput);
    
    // Проверяем второй шаг квалификации
    expect(qualificationStep2.step).toBe('niche');
    expect(qualificationStep2.question).toContain('В какой нише вы работаете');
    expect(qualificationStep2.options.length).toBe(5);
    
    // Шаг 4: Пользователь выбирает нишу (Онлайн-образование)
    const nicheInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'education',
      timestamp: new Date(),
    };

    const qualificationStep3 = await handleQualificationUseCase(nicheInput);
    
    // Проверяем третий шаг квалификации
    expect(qualificationStep3.step).toBe('scale');
    expect(qualificationStep3.question).toContain('На каком этапе сейчас ваш проект');
    expect(qualificationStep3.options.length).toBe(3);
    
    // Шаг 5: Пользователь указывает масштаб (Есть стабильный трафик)
    const scaleInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'traffic',
      timestamp: new Date(),
    };

    const qualificationStep4 = await handleQualificationUseCase(scaleInput);
    
    // Проверяем четвертый шаг квалификации
    expect(qualificationStep4.step).toBe('value_proposition');
    expect(qualificationStep4.question).toContain('Отлично! На основе ваших ответов');
    
    // Шаг 6: Пользователь соглашается обсудить
    const valuePropositionInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'discuss',
      timestamp: new Date(),
    };

    // Здесь должен быть переход к захвату лида
    const leadCaptureForm = await handleLeadCaptureUseCase(valuePropositionInput);
    
    // Проверяем форму захвата лида
    expect(leadCaptureForm.title).toBe('Отлично!');
    expect(leadCaptureForm.placeholder).toBeDefined();
    
    // Шаг 7: Пользователь отправляет сообщение
    const leadMessageInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: 'Хочу сделать воронку для вебинара по продаже курса',
      timestamp: new Date(),
    };

    const leadConfirmation = await handleLeadCaptureUseCase(leadMessageInput);
    
    // Проверяем подтверждение
    expect(leadConfirmation.title).toBe('Спасибо!');
    expect(leadConfirmation.description).toContain('Ваша заявка отправлена');
    
    // Шаг 8: Передача лида
    const transferInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'system',
      payload: 'transfer',
      timestamp: new Date(),
    };

    const leadCard = await transferLeadUseCase(transferInput);
    
    // Проверяем карточку лида
    expect(leadCard.userId).toBe(mockUserId);
    expect(leadCard.path).toBe('lead_capture');
    expect(leadCard.painPoint).toBe('leads');
    expect(leadCard.niche).toBe('education');
    expect(leadCard.scale).toBe('traffic');
    expect(leadCard.userMessage).toBe('Хочу сделать воронку для вебинара по продаже курса');
  });

  test('Happy Path: Сценарий демонстрации', async () => {
    // Шаг 1: Пользователь начинает диалог (/start)
    const segmentationInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    await handleSegmentationUseCase(segmentationInput);
    
    // Шаг 2: Пользователь выбирает путь демонстрации
    const demonstrationPathInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'demonstration',
      timestamp: new Date(),
    };

    const galleryResult = await handleDemonstrationUseCase(demonstrationPathInput);
    
    // Проверяем галерею демонстраций
    expect(galleryResult.title).toBe('Возможности ботов');
    expect(galleryResult.demonstrations.length).toBe(4);
    
    // Шаг 3: Пользователь выбирает демонстрацию
    const demonstrationChoiceInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'crm',
      timestamp: new Date(),
    };

    const detailResult = await handleDemonstrationUseCase(demonstrationChoiceInput);
    
    // Проверяем детали демонстрации
    expect(detailResult.title).toBe('Детали демонстрации');
    expect(detailResult.benefits.length).toBe(3);
    
    // Шаг 4: Пользователь соглашается обсудить
    const discussInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'discuss',
      timestamp: new Date(),
    };

    // Должен быть переход к квалификации
    const qualificationQuestion = await handleQualificationUseCase(discussInput);
    
    // Проверяем, что перешли к квалификации
    expect(qualificationQuestion.step).toBe('pain_point');
  });

  test('Happy Path: Прямой контакт', async () => {
    // Шаг 1: Пользователь начинает диалог (/start)
    const segmentationInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    await handleSegmentationUseCase(segmentationInput);
    
    // Шаг 2: Пользователь выбирает прямой контакт
    const directContactInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'direct_contact',
      timestamp: new Date(),
    };

    const leadCaptureForm = await handleLeadCaptureUseCase(directContactInput);
    
    // Проверяем форму захвата лида
    expect(leadCaptureForm.title).toBe('Отлично!');
    expect(leadCaptureForm.placeholder).toBeDefined();
    
    // Шаг 3: Пользователь отправляет сообщение
    const leadMessageInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: 'Хочу обсудить проект бота для моего бизнеса',
      timestamp: new Date(),
    };

    const leadConfirmation = await handleLeadCaptureUseCase(leadMessageInput);
    
    // Проверяем подтверждение
    expect(leadConfirmation.title).toBe('Спасибо!');
    expect(leadConfirmation.description).toContain('Ваша заявка отправлена');
  });

  test('Happy Path: Подписка на прогрев', async () => {
    // Шаг 1: Пользователь начинает диалог (/start)
    const segmentationInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    await handleSegmentationUseCase(segmentationInput);
    
    // Шаг 2: Пользователь выбирает путь квалификации
    const qualificationPathInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    };

    await handleQualificationUseCase(qualificationPathInput);
    
    // Шаг 3: Пользователь выбирает задачу
    const painPointInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'leads',
      timestamp: new Date(),
    };

    await handleQualificationUseCase(painPointInput);
    
    // Шаг 4: Пользователь выбирает "подумаю"
    const thinkInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'think',
      timestamp: new Date(),
    };

    const warmupOffer = await handleQualificationUseCase(thinkInput);
    
    // Проверяем предложение подписки на прогрев
    // (В текущей реализации это может быть частью ответа)
    
    // Шаг 5: Пользователь соглашается на подписку
    const subscribeInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'yes',
      timestamp: new Date(),
    };

    const subscriptionResult = await handleWarmupSubscriptionUseCase(subscribeInput);
    
    // Проверяем результат подписки
    expect(subscriptionResult.title).toBe('Подписка оформлена!');
    expect(subscriptionResult.benefits.length).toBe(3);
  });
});