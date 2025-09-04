import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  SegmentationChoiceDto,
  QualificationQuestionDto,
  DemonstrationGalleryDto,
  DemonstrationDetailDto,
  LeadCaptureDto,
  WarmupSubscriptionDto,
  LeadCardDto,
  LeadTransferDto
} from '../dtos/extended.dtos';
import {
  showSegmentationPort,
  showQualificationQuestionPort,
  showDemonstrationGalleryPort,
  showDemonstrationDetailPort,
  captureLeadPort,
  showWarmupSubscriptionPort,
  transferLeadPort,
  loggerPort
} from '../../domain/ports/extended.ports';
import {
  findUserByIdPort,
  saveUserPort,
  findDialogSessionByIdPort,
  findActiveDialogSessionByUserIdPort,
  createDialogSessionPort,
  updateDialogSessionPort,
  saveMessagePort
} from '../../domain/ports/bot.ports';
import { 
  User, 
  DialogSession, 
  Message, 
  LeadProfile 
} from '../../domain/entities/extended.entities';
import { UserId, DialogSessionId, MessageId } from '../../domain/shared/ids';

// DTO для входящих действий пользователя
const UserActionDtoSchema = z.object({
  userId: z.string(),
  platform: z.string(),
  actionType: z.enum(['text', 'choice', 'button']),
  payload: z.string().optional(),
  timestamp: z.date(),
});

type UserActionDto = z.infer<typeof UserActionDtoSchema>;

// Use Case 1: Обработка сегментации пользователя (БЛОК 1)
export const handleSegmentationUseCase = async (input: unknown): Promise<SegmentationChoiceDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  // Получение зависимостей
  const findUserById = usePort(findUserByIdPort);
  const saveUser = usePort(saveUserPort);
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const createDialogSession = usePort(createDialogSessionPort);
  const updateDialogSession = usePort(updateDialogSessionPort);
  const saveMessage = usePort(saveMessagePort);
  const log = usePort(loggerPort);
  
  // Логирование действия
  log(`Handling segmentation for user ${validInput.userId}`, { input: validInput });
  
  // Получение или создание пользователя
  let user = await findUserById(validInput.userId);
  if (!user) {
    user = User.create({
      id: UserId.create(validInput.userId).value,
      platform: validInput.platform as any,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    });
    await saveUser(user);
  } else {
    // Обновляем время последней активности
    user.actions.updateLastActive();
    await saveUser(user);
  }
  
  // Получение активной сессии диалога
  let session = await findActiveDialogSession(validInput.userId);
  
  // Если нет активной сессии, создаем новую
  if (!session) {
    session = DialogSession.create({
      id: DialogSessionId.create(crypto.randomUUID()).value,
      userId: UserId.create(validInput.userId).value,
      currentPath: 'segmentation',
      currentStep: 'welcome',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    session = await createDialogSession(session);
  }
  
  // Сохраняем сообщение пользователя
  const message = Message.create({
    id: MessageId.create(crypto.randomUUID()).value,
    sessionId: session.state.id,
    userId: session.state.userId,
    text: validInput.payload,
    direction: 'incoming',
    timestamp: validInput.timestamp,
  });
  await saveMessage(message);
  
  // Обрабатываем выбор пользователя
  switch (validInput.payload) {
    case 'qualification':
      session.actions.switchToPath('qualification');
      session.actions.advanceToStep('pain_point');
      await updateDialogSession(session);
      break;
      
    case 'demonstration':
      session.actions.switchToPath('demonstration');
      session.actions.advanceToStep('gallery');
      await updateDialogSession(session);
      break;
      
    case 'direct_contact':
      session.actions.switchToPath('lead_capture');
      session.actions.advanceToStep('capture');
      await updateDialogSession(session);
      break;
  }
  
  // Возвращаем DTO для отображения вариантов сегментации
  const segmentationDto: SegmentationChoiceDto = {
    greeting: "Добро пожаловать!",
    description: "Я — бот-ассистент, созданный разработчиком. Моя задача — показать, как чат-боты могут помочь вашему бизнесу привлекать клиентов, автоматизировать рутину и увеличивать продажи.\n\nЧто вас интересует?",
    options: [
      { id: "qualification", text: "🚀 У меня есть задача для бота", value: "qualification" },
      { id: "demonstration", text: "🤔 Хочу посмотреть примеры/возможности", value: "demonstration" },
      { id: "direct_contact", text: "💬 Связаться с разработчиком", value: "direct_contact" }
    ]
  };
  
  return segmentationDto;
};

// Use Case 2: Обработка ветки квалификации (БЛОК 2)
export const handleQualificationUseCase = async (input: unknown): Promise<QualificationQuestionDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const updateDialogSession = usePort(updateDialogSessionPort);
  const saveMessage = usePort(saveMessagePort);
  const log = usePort(loggerPort);
  
  log(`Handling qualification for user ${validInput.userId}`, { input: validInput });
  
  // Получение активной сессии
  const session = await findActiveDialogSession(validInput.userId);
  if (!session) {
    throw new Error('No active session found');
  }
  
  // Сохраняем сообщение пользователя
  const message = Message.create({
    id: MessageId.create(crypto.randomUUID()).value,
    sessionId: session.state.id,
    userId: session.state.userId,
    text: validInput.payload,
    direction: 'incoming',
    timestamp: validInput.timestamp,
  });
  await saveMessage(message);
  
  // Обрабатываем текущий шаг квалификации
  switch (session.state.currentStep) {
    case 'pain_point':
      // Сохраняем ответ
      session.actions.saveQualificationData({ painPoint: validInput.payload });
      await updateDialogSession(session);
      
      // Переходим к следующему шагу
      session.actions.advanceToStep('niche');
      await updateDialogSession(session);
      
      const nicheQuestion: QualificationQuestionDto = {
        step: 'niche',
        question: "В какой нише вы работаете?",
        options: [
          { id: "ecommerce", text: "E-commerce", value: "ecommerce" },
          { id: "education", text: "Онлайн-образование", value: "education" },
          { id: "services", text: "Услуги (B2C)", value: "services" },
          { id: "b2b", text: "B2B", value: "b2b" },
          { id: "personal", text: "Личный бренд/Эксперт", value: "personal" }
        ]
      };
      
      return nicheQuestion;
      
    case 'niche':
      // Сохраняем ответ
      session.actions.saveQualificationData({ niche: validInput.payload });
      await updateDialogSession(session);
      
      // Переходим к следующему шагу
      session.actions.advanceToStep('scale');
      await updateDialogSession(session);
      
      const scaleQuestion: QualificationQuestionDto = {
        step: 'scale',
        question: "На каком этапе сейчас ваш проект?",
        options: [
          { id: "idea", text: "Только идея", value: "idea" },
          { id: "product", text: "Есть продукт, но нет трафика", value: "product" },
          { id: "traffic", text: "Есть стабильный трафик/клиенты", value: "traffic" }
        ]
      };
      
      return scaleQuestion;
      
    case 'scale':
      // Сохраняем ответ
      session.actions.saveQualificationData({ scale: validInput.payload });
      await updateDialogSession(session);
      
      // Переходим к выдаче ценности
      session.actions.advanceToStep('value_proposition');
      await updateDialogSession(session);
      
      // Здесь должна быть логика формирования персонализированного предложения
      // В упрощенном виде просто возвращаем следующий шаг
      const valueProposition: QualificationQuestionDto = {
        step: 'value_proposition',
        question: "Отлично! На основе ваших ответов могу предложить следующее решение...",
        description: "Для вашего бизнеса идеально подойдет...",
        options: [
          { id: "discuss", text: "Да, интересно обсудить", value: "discuss" },
          { id: "calculate", text: "Рассчитать примерную стоимость", value: "calculate" },
          { id: "think", text: "Спасибо, я подумаю", value: "think" }
        ]
      };
      
      return valueProposition;
      
    default:
      throw new Error(`Unknown qualification step: ${session.state.currentStep}`);
  }
};

// Use Case 3: Обработка ветки демонстрации (БЛОК 3)
export const handleDemonstrationUseCase = async (input: unknown): Promise<DemonstrationGalleryDto | DemonstrationDetailDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const updateDialogSession = usePort(updateDialogSessionPort);
  const saveMessage = usePort(saveMessagePort);
  const log = usePort(loggerPort);
  
  log(`Handling demonstration for user ${validInput.userId}`, { input: validInput });
  
  // Получение активной сессии
  const session = await findActiveDialogSession(validInput.userId);
  if (!session) {
    throw new Error('No active session found');
  }
  
  // Сохраняем сообщение пользователя
  const message = Message.create({
    id: MessageId.create(crypto.randomUUID()).value,
    sessionId: session.state.id,
    userId: session.state.userId,
    text: validInput.payload,
    direction: 'incoming',
    timestamp: validInput.timestamp,
  });
  await saveMessage(message);
  
  // Обрабатываем текущий шаг демонстрации
  switch (session.state.currentStep) {
    case 'gallery':
      // Показываем галерею демонстраций
      const galleryDto: DemonstrationGalleryDto = {
        title: "Возможности ботов",
        description: "Посмотрите, что могут делать чат-боты:",
        demonstrations: [
          {
            id: "crm",
            title: "Интеграция с CRM",
            description: "Автоматизация обработки заявок и поддержки клиентов",
            category: "crm"
          },
          {
            id: "payments",
            title: "Прием платежей",
            description: "Встроенные платежи без перехода на сайт",
            category: "payments"
          },
          {
            id: "marketing",
            title: "Рассылки и сегментация",
            description: "Персонализированные рассылки по сегментам",
            category: "marketing"
          },
          {
            id: "gamification",
            title: "Геймификация",
            description: "Повышение вовлеченности через игры и конкурсы",
            category: "gamification"
          }
        ]
      };
      
      return galleryDto;
      
    default:
      // Показываем детали выбранной демонстрации
      const detailDto: DemonstrationDetailDto = {
        id: validInput.payload || 'default',
        title: "Детали демонстрации",
        description: "Здесь будет подробное описание выбранной функции",
        benefits: [
          "Экономия времени на рутинных задачах",
          "Повышение конверсии",
          "Улучшение пользовательского опыта"
        ],
        cta: "Заинтересовала такая функция? Давайте посмотрим, как она может решить вашу задачу"
      };
      
      return detailDto;
  }
};

// Use Case 4: Обработка захвата лида (БЛОК 4)
export const handleLeadCaptureUseCase = async (input: unknown): Promise<LeadCaptureDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const updateDialogSession = usePort(updateDialogSessionPort);
  const saveMessage = usePort(saveMessagePort);
  const log = usePort(loggerPort);
  
  log(`Handling lead capture for user ${validInput.userId}`, { input: validInput });
  
  // Получение активной сессии
  const session = await findActiveDialogSession(validInput.userId);
  if (!session) {
    throw new Error('No active session found');
  }
  
  // Если это текстовое сообщение, значит пользователь отправил свой запрос
  if (validInput.actionType === 'text' && validInput.payload) {
    // Сохраняем сообщение пользователя
    const message = Message.create({
      id: MessageId.create(crypto.randomUUID()).value,
      sessionId: session.state.id,
      userId: session.state.userId,
      text: validInput.payload,
      direction: 'incoming',
      timestamp: validInput.timestamp,
    });
    await saveMessage(message);
    
    // Сохраняем данные лида
    session.actions.saveLeadData(validInput.payload);
    await updateDialogSession(session);
    
    // Здесь должна быть логика передачи лида
    // Пока возвращаем подтверждение
    const confirmationDto: LeadCaptureDto = {
      title: "Спасибо!",
      description: "Ваша заявка отправлена. Разработчик свяжется с вами в течение 24 часов.",
      placeholder: ""
    };
    
    return confirmationDto;
  }
  
  // Иначе показываем форму захвата лида
  const captureDto: LeadCaptureDto = {
    title: "Отлично!",
    description: "Опишите вашу задачу своими словами в одном сообщении, и я отправлю всю информацию разработчику для подготовки.",
    placeholder: "Например: Хочу сделать воронку для вебинара по продаже курса...",
    maxLength: 1000
  };
  
  return captureDto;
};

// Use Case 5: Обработка подписки на прогрев (БЛОК 5)
export const handleWarmupSubscriptionUseCase = async (input: unknown): Promise<WarmupSubscriptionDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  const findUserById = usePort(findUserByIdPort);
  const saveUser = usePort(saveUserPort);
  const log = usePort(loggerPort);
  
  log(`Handling warmup subscription for user ${validInput.userId}`, { input: validInput });
  
  // Получение пользователя
  let user = await findUserById(validInput.userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Если пользователь согласился на подписку
  if (validInput.payload === 'yes') {
    user.actions.subscribeToWarmup();
    await saveUser(user);
  }
  
  // Возвращаем сообщение о результате
  const subscriptionDto: WarmupSubscriptionDto = {
    title: user.state.isSubscribedToWarmup ? "Подписка оформлена!" : "Понимаю",
    description: user.state.isSubscribedToWarmup 
      ? "Вы успешно подписались на полезные материалы. Будем на связи!"
      : "Если передумаете, всегда можно вернуться и начать диалог заново.",
    benefits: [
      "1 полезный кейс по автоматизации в неделю",
      "Без спама и рекламы",
      "Только проверенные практики"
    ],
    confirmation: "Спасибо за внимание!"
  };
  
  return subscriptionDto;
};

// Use Case 6: Передача лида (БЛОК 6)
export const transferLeadUseCase = async (input: unknown): Promise<LeadCardDto> => {
  const validInput = UserActionDtoSchema.parse(input);
  
  const findUserById = usePort(findUserByIdPort);
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const log = usePort(loggerPort);
  
  log(`Transferring lead for user ${validInput.userId}`, { input: validInput });
  
  // Получение пользователя и сессии
  const user = await findUserById(validInput.userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  const session = await findActiveDialogSession(validInput.userId);
  if (!session) {
    throw new Error('No active session found');
  }
  
  // Создаем карточку лида
  const leadCard: LeadCardDto = {
    userId: user.state.id,
    username: user.state.username,
    path: session.state.currentPath as any,
    painPoint: session.state.qualificationData?.painPoint,
    niche: session.state.qualificationData?.niche,
    scale: session.state.qualificationData?.scale,
    userMessage: session.state.leadData?.message,
    temperature: 'warm', // В реальной реализации должна быть логика определения температуры
    timestamp: new Date()
  };
  
  // Здесь должна быть логика передачи лида через transferLeadPort
  // Пока просто возвращаем карточку лида
  
  return leadCard;
};