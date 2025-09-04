import { test, expect, beforeEach, describe } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleLeadCaptureUseCase,
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
  captureLeadPort,
  transferLeadPort
} from '../../domain/ports/extended.ports';
import { User, DialogSession } from '../../domain/entities/extended.entities';
import { UserId, DialogSessionId } from '../../domain/shared/ids';

describe('Интеграционные тесты слоя приложения - Проверка передачи данных', () => {
  const mockUserId = 'data-transfer-user';
  const mockUsername = 'test_user';
  
  // Для проверки передачи данных будем собирать вызовы адаптеров
  let adapterCalls: any[] = [];
  
  beforeEach(() => {
    resetDI();
    adapterCalls = [];
    
    // Mock адаптеры с логированием вызовов
    setPortAdapter(loggerPort, (message: string, context?: object) => {
      adapterCalls.push({ adapter: 'logger', message, context });
    });
    
    setPortAdapter(showSegmentationPort, async (dto: any) => {
      adapterCalls.push({ adapter: 'showSegmentation', dto });
      return { success: true };
    });
    
    setPortAdapter(showQualificationQuestionPort, async (dto: any) => {
      adapterCalls.push({ adapter: 'showQualificationQuestion', dto });
      return { success: true };
    });
    
    setPortAdapter(captureLeadPort, async (dto: any) => {
      adapterCalls.push({ adapter: 'captureLead', dto });
      return { success: true };
    });
    
    setPortAdapter(transferLeadPort, async (dto: any) => {
      adapterCalls.push({ adapter: 'transferLead', dto });
      return { success: true };
    });
    
    // Репозиторные адаптеры
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
      adapterCalls.push({ adapter: 'saveUser', user: user.state });
    });
    
    setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
      if (userId === mockUserId) {
        return DialogSession.create({
          id: DialogSessionId.create('data-session').value,
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
      adapterCalls.push({ adapter: 'createDialogSession', session: session.state });
      return session;
    });
    
    setPortAdapter(updateDialogSessionPort, async (session: any) => {
      adapterCalls.push({ adapter: 'updateDialogSession', session: session.state });
      return session;
    });
    
    setPortAdapter(saveMessagePort, async (message: any) => {
      adapterCalls.push({ adapter: 'saveMessage', message: message.state });
    });
  });

  test('Проверка передачи данных в segmentation use case', async () => {
    const input = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    };

    const result = await handleSegmentationUseCase(input);
    
    // Проверяем, что результат содержит правильные данные
    expect(result.greeting).toContain('Добро пожаловать');
    expect(result.options.length).toBe(3);
    
    // Проверяем, что были вызваны нужные адаптеры
    const saveUserCall = adapterCalls.find(call => call.adapter === 'saveUser');
    expect(saveUserCall).toBeDefined();
    expect(saveUserCall.user.id).toBe(mockUserId);
    
    const createSessionCall = adapterCalls.find(call => call.adapter === 'createDialogSession');
    expect(createSessionCall).toBeDefined();
    expect(createSessionCall.session.userId).toBe(mockUserId);
    
    const saveMessageCall = adapterCalls.find(call => call.adapter === 'saveMessage');
    expect(saveMessageCall).toBeDefined();
    expect(saveMessageCall.message.text).toBe('/start');
  });

  test('Проверка передачи данных в qualification use case', async () => {
    // Сначала создаем сессию
    await handleSegmentationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    });
    
    // Затем выполняем квалификацию
    const qualificationInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    };

    const result = await handleQualificationUseCase(qualificationInput);
    
    // Проверяем результат
    expect(result.step).toBe('pain_point');
    
    // Проверяем вызовы адаптеров
    const updateSessionCalls = adapterCalls.filter(call => call.adapter === 'updateDialogSession');
    expect(updateSessionCalls.length).toBeGreaterThanOrEqual(2); // switchToPath + advanceToStep
    
    const saveMessageCall = adapterCalls.find(call => call.adapter === 'saveMessage');
    expect(saveMessageCall).toBeDefined();
    expect(saveMessageCall.message.payload).toBe('qualification');
  });

  test('Проверка передачи данных в lead capture use case', async () => {
    // Сначала создаем сессию
    await handleSegmentationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    });
    
    // Затем переходим к захвату лида
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'direct_contact',
      timestamp: new Date(),
    });
    
    // Отправляем сообщение
    const messageInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: 'Хочу обсудить проект бота',
      timestamp: new Date(),
    };

    const result = await handleLeadCaptureUseCase(messageInput);
    
    // Проверяем результат
    expect(result.title).toBe('Спасибо!');
    
    // Проверяем вызовы адаптеров
    const saveMessageCall = adapterCalls.find(call => call.adapter === 'saveMessage');
    expect(saveMessageCall).toBeDefined();
    expect(saveMessageCall.message.text).toBe('Хочу обсудить проект бота');
    
    const updateSessionCalls = adapterCalls.filter(call => call.adapter === 'updateDialogSession');
    expect(updateSessionCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('Проверка передачи данных в lead transfer use case', async () => {
    // Сначала создаем сессию и заполняем данные
    await handleSegmentationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    });
    
    // Проходим квалификацию
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    });
    
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'leads',
      timestamp: new Date(),
    });
    
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'education',
      timestamp: new Date(),
    });
    
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'traffic',
      timestamp: new Date(),
    });
    
    // Отправляем сообщение
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'discuss',
      timestamp: new Date(),
    });
    
    await handleLeadCaptureUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: 'Хочу сделать воронку для вебинара',
      timestamp: new Date(),
    });
    
    // Передаем лид
    const transferInput = {
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'system',
      payload: 'transfer',
      timestamp: new Date(),
    };

    const result = await transferLeadUseCase(transferInput);
    
    // Проверяем результат
    expect(result.userId).toBe(mockUserId);
    expect(result.username).toBe(mockUsername);
    expect(result.painPoint).toBe('leads');
    expect(result.niche).toBe('education');
    expect(result.scale).toBe('traffic');
    expect(result.userMessage).toBe('Хочу сделать воронку для вебинара');
    
    // Проверяем вызовы адаптеров
    const transferLeadCall = adapterCalls.find(call => call.adapter === 'transferLead');
    expect(transferLeadCall).toBeDefined();
    expect(transferLeadCall.dto.leadCard.userId).toBe(mockUserId);
    expect(transferLeadCall.dto.leadCard.userMessage).toBe('Хочу сделать воронку для вебинара');
  });

  test('Проверка сохранения промежуточных данных в сессии', async () => {
    // Сначала создаем сессию
    await handleSegmentationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: new Date(),
    });
    
    // Проходим несколько шагов квалификации
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'qualification',
      timestamp: new Date(),
    });
    
    await handleQualificationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'choice',
      payload: 'leads',
      timestamp: new Date(),
    });
    
    // Проверяем, что данные сохранились в сессии
    const updateSessionCalls = adapterCalls.filter(call => call.adapter === 'updateDialogSession');
    
    // Ищем вызовы с сохранением qualificationData
    const qualificationDataCalls = updateSessionCalls.filter(call => 
      call.session.qualificationData && call.session.qualificationData.painPoint === 'leads'
    );
    
    expect(qualificationDataCalls.length).toBeGreaterThanOrEqual(1);
  });

  test('Проверка корректности timestamp в сообщениях', async () => {
    const testTimestamp = new Date('2023-01-01T12:00:00Z');
    
    // Отправляем сообщение с определенным timestamp
    await handleSegmentationUseCase({
      userId: mockUserId,
      platform: 'telegram',
      actionType: 'text',
      payload: '/start',
      timestamp: testTimestamp,
    });
    
    // Проверяем, что timestamp сохранился корректно
    const saveMessageCall = adapterCalls.find(call => call.adapter === 'saveMessage');
    expect(saveMessageCall).toBeDefined();
    
    // Проверяем, что timestamp близок к ожидаемому (с точностью до секунды)
    const savedTimestamp = new Date(saveMessageCall.message.timestamp);
    const timeDiff = Math.abs(savedTimestamp.getTime() - testTimestamp.getTime());
    expect(timeDiff).toBeLessThan(1000); // Разница менее секунды
  });
});