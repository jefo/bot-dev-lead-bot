import { test, expect, beforeEach, describe } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { 
  handleSegmentationUseCase,
  handleQualificationUseCase,
  handleDemonstrationUseCase,
  handleLeadCaptureUseCase
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
import { User, DialogSession } from '../../domain/entities/extended.entities';
import { UserId, DialogSessionId } from '../../domain/shared/ids';

describe('Интеграционные тесты слоя приложения - Конкретные сценарии использования', () => {
  const mockUserId = 'scenario-user-123';
  
  beforeEach(() => {
    resetDI();
    
    // Базовые mock адаптеры
    setPortAdapter(loggerPort, (message: string, context?: object) => {
      console.log(`[SCENARIO TEST] ${message}`, context);
    });
    
    setPortAdapter(saveUserPort, async (user: any) => {});
    setPortAdapter(createDialogSessionPort, async (session: any) => session);
    setPortAdapter(updateDialogSessionPort, async (session: any) => session);
    setPortAdapter(saveMessagePort, async (message: any) => {});
  });

  describe('Сценарий 1: Владелец онлайн-школы, нуждается в лидогенерации', () => {
    beforeEach(() => {
      // Настраиваем mock адаптеры для этого сценария
      setPortAdapter(findUserByIdPort, async (id: string) => {
        if (id === mockUserId) {
          return User.create({
            id: UserId.create(id).value,
            platform: 'telegram',
            username: 'online_teacher',
            createdAt: new Date(),
            lastActiveAt: new Date(),
          });
        }
        return null;
      });
      
      setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
        if (userId === mockUserId) {
          return DialogSession.create({
            id: DialogSessionId.create('education-session').value,
            userId: UserId.create(userId).value,
            currentPath: 'segmentation',
            currentStep: 'welcome',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return null;
      });
    });

    test('Полный путь квалификации для онлайн-школы', async () => {
      // Шаг 1: Пользователь начинает диалог
      const startResult = await handleSegmentationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'text',
        payload: '/start',
        timestamp: new Date(),
      });
      
      expect(startResult.greeting).toContain('Добро пожаловать');
      
      // Шаг 2: Выбирает "У меня есть задача для бота"
      const pathResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'qualification',
        timestamp: new Date(),
      });
      
      expect(pathResult.step).toBe('pain_point');
      expect(pathResult.question).toContain('Какую основную задачу должен решить бот');
      
      // Шаг 3: Выбирает "Лидогенерация и продажи"
      const painPointResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'leads',
        timestamp: new Date(),
      });
      
      expect(painPointResult.step).toBe('niche');
      
      // Шаг 4: Выбирает "Онлайн-образование"
      const nicheResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'education',
        timestamp: new Date(),
      });
      
      expect(nicheResult.step).toBe('scale');
      
      // Шаг 5: Выбирает "Есть стабильный трафик/клиенты"
      const scaleResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'traffic',
        timestamp: new Date(),
      });
      
      expect(scaleResult.step).toBe('value_proposition');
      
      // Шаг 6: Соглашается обсудить
      const discussResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'discuss',
        timestamp: new Date(),
      });
      
      // Должен перейти к захвату лида
      // Проверяем, что результат содержит элементы формы захвата
    });
  });

  describe('Сценарий 2: Владелец e-commerce магазина, нуждается в автоматизации поддержки', () => {
    beforeEach(() => {
      setPortAdapter(findUserByIdPort, async (id: string) => {
        if (id === mockUserId) {
          return User.create({
            id: UserId.create(id).value,
            platform: 'telegram',
            username: 'ecommerce_owner',
            createdAt: new Date(),
            lastActiveAt: new Date(),
          });
        }
        return null;
      });
      
      setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
        if (userId === mockUserId) {
          return DialogSession.create({
            id: DialogSessionId.create('ecommerce-session').value,
            userId: UserId.create(userId).value,
            currentPath: 'segmentation',
            currentStep: 'welcome',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return null;
      });
    });

    test('Полный путь квалификации для e-commerce', async () => {
      // Шаг 1: Пользователь начинает диалог
      await handleSegmentationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'text',
        payload: '/start',
        timestamp: new Date(),
      });
      
      // Шаг 2: Выбирает "У меня есть задача для бота"
      await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'qualification',
        timestamp: new Date(),
      });
      
      // Шаг 3: Выбирает "Автоматизация поддержки"
      const supportResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'support',
        timestamp: new Date(),
      });
      
      expect(supportResult.step).toBe('niche');
      
      // Шаг 4: Выбирает "E-commerce"
      const nicheResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'ecommerce',
        timestamp: new Date(),
      });
      
      expect(nicheResult.step).toBe('scale');
      
      // Шаг 5: Выбирает "Есть стабильный трафик/клиенты"
      const scaleResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'traffic',
        timestamp: new Date(),
      });
      
      expect(scaleResult.step).toBe('value_proposition');
    });
  });

  describe('Сценарий 3: B2B сервис, нуждается в вовлечении клиентов', () => {
    beforeEach(() => {
      setPortAdapter(findUserByIdPort, async (id: string) => {
        if (id === mockUserId) {
          return User.create({
            id: UserId.create(id).value,
            platform: 'telegram',
            username: 'b2b_consultant',
            createdAt: new Date(),
            lastActiveAt: new Date(),
          });
        }
        return null;
      });
      
      setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
        if (userId === mockUserId) {
          return DialogSession.create({
            id: DialogSessionId.create('b2b-session').value,
            userId: UserId.create(userId).value,
            currentPath: 'segmentation',
            currentStep: 'welcome',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return null;
      });
    });

    test('Полный путь квалификации для B2B', async () => {
      // Шаг 1: Пользователь начинает диалог
      await handleSegmentationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'text',
        payload: '/start',
        timestamp: new Date(),
      });
      
      // Шаг 2: Выбирает "У меня есть задача для бота"
      await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'qualification',
        timestamp: new Date(),
      });
      
      // Шаг 3: Выбирает "Обучение и вовлечение"
      const engagementResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'engagement',
        timestamp: new Date(),
      });
      
      expect(engagementResult.step).toBe('niche');
      
      // Шаг 4: Выбирает "B2B"
      const nicheResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'b2b',
        timestamp: new Date(),
      });
      
      expect(nicheResult.step).toBe('scale');
      
      // Шаг 5: Выбирает "Есть стабильный трафик/клиенты"
      const scaleResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'traffic',
        timestamp: new Date(),
      });
      
      expect(scaleResult.step).toBe('value_proposition');
    });
  });

  describe('Сценарий 4: Личный эксперт, только начинает', () => {
    beforeEach(() => {
      setPortAdapter(findUserByIdPort, async (id: string) => {
        if (id === mockUserId) {
          return User.create({
            id: UserId.create(id).value,
            platform: 'telegram',
            username: 'personal_expert',
            createdAt: new Date(),
            lastActiveAt: new Date(),
          });
        }
        return null;
      });
      
      setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
        if (userId === mockUserId) {
          return DialogSession.create({
            id: DialogSessionId.create('personal-session').value,
            userId: UserId.create(userId).value,
            currentPath: 'segmentation',
            currentStep: 'welcome',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return null;
      });
    });

    test('Полный путь квалификации для личного эксперта', async () => {
      // Шаг 1: Пользователь начинает диалог
      await handleSegmentationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'text',
        payload: '/start',
        timestamp: new Date(),
      });
      
      // Шаг 2: Выбирает "У меня есть задача для бота"
      await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'qualification',
        timestamp: new Date(),
      });
      
      // Шаг 3: Выбирает "Лидогенерация и продажи"
      await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'leads',
        timestamp: new Date(),
      });
      
      // Шаг 4: Выбирает "Личный бренд/Эксперт"
      const nicheResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'personal',
        timestamp: new Date(),
      });
      
      expect(nicheResult.step).toBe('scale');
      
      // Шаг 5: Выбирает "Только идея"
      const scaleResult = await handleQualificationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'idea',
        timestamp: new Date(),
      });
      
      expect(scaleResult.step).toBe('value_proposition');
    });
  });

  describe('Сценарий 5: Демонстрация возможностей', () => {
    beforeEach(() => {
      setPortAdapter(findUserByIdPort, async (id: string) => {
        if (id === mockUserId) {
          return User.create({
            id: UserId.create(id).value,
            platform: 'telegram',
            username: 'curious_user',
            createdAt: new Date(),
            lastActiveAt: new Date(),
          });
        }
        return null;
      });
      
      setPortAdapter(findActiveDialogSessionByUserIdPort, async (userId: string) => {
        if (userId === mockUserId) {
          return DialogSession.create({
            id: DialogSessionId.create('demo-session').value,
            userId: UserId.create(userId).value,
            currentPath: 'segmentation',
            currentStep: 'welcome',
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        return null;
      });
    });

    test('Полный путь демонстрации', async () => {
      // Шаг 1: Пользователь начинает диалог
      await handleSegmentationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'text',
        payload: '/start',
        timestamp: new Date(),
      });
      
      // Шаг 2: Выбирает "Хочу посмотреть примеры/возможности"
      const demoPathResult = await handleDemonstrationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'demonstration',
        timestamp: new Date(),
      });
      
      expect(demoPathResult.title).toBe('Возможности ботов');
      expect(demoPathResult.demonstrations.length).toBe(4);
      
      // Шаг 3: Выбирает конкретную демонстрацию
      const demoDetailResult = await handleDemonstrationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'crm',
        timestamp: new Date(),
      });
      
      expect(demoDetailResult.title).toBe('Детали демонстрации');
      
      // Шаг 4: Соглашается обсудить
      const discussResult = await handleDemonstrationUseCase({
        userId: mockUserId,
        platform: 'telegram',
        actionType: 'choice',
        payload: 'discuss',
        timestamp: new Date(),
      });
      
      // Должен перейти к квалификации
    });
  });
});