import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { 
  SingleChoiceDto,
  MultiChoiceDto,
  FreeTextDto,
  InfoMessageDto,
  DialogEndDto,
  TransferToOperatorDto
} from '../dtos/platform-agnostic.dtos';
import {
  findUserByIdPort,
  saveUserPort,
  findDialogSessionByIdPort,
  findActiveDialogSessionByUserIdPort,
  createDialogSessionPort,
  updateDialogSessionPort,
  saveMessagePort,
  loggerPort
} from '../../domain/ports/bot.ports';
import { User, DialogSession, Message } from '../../domain/entities/bot.entities';
import { UserId, DialogSessionId, MessageId } from '../../domain/shared/ids';

// DTO для входящих данных (platform-agnostic)
const IncomingUserActionDtoSchema = z.object({
  userId: z.string(),
  platform: z.string(),
  actionType: z.enum(['text', 'choice', 'button']),
  payload: z.string().optional(),
  timestamp: z.date(),
});

type IncomingUserActionDto = z.infer<typeof IncomingUserActionDtoSchema>;

// Use Case 1: Обработка входящего действия пользователя
// Возвращает platform-agnostic DTO для отображения
export const handleUserActionUseCase = async (input: unknown): Promise<
  SingleChoiceDto | InfoMessageDto | DialogEndDto | null
> => {
  const validInput = IncomingUserActionDtoSchema.parse(input);
  
  // Получение зависимостей
  const findUserById = usePort(findUserByIdPort);
  const saveUser = usePort(saveUserPort);
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const createDialogSession = usePort(createDialogSessionPort);
  const updateDialogSession = usePort(updateDialogSessionPort);
  const saveMessage = usePort(saveMessagePort);
  const log = usePort(loggerPort);
  
  // Логирование действия
  log(`Handling user action from ${validInput.userId}`, { input: validInput });
  
  // Получение или создание пользователя
  let user = await findUserById(validInput.userId);
  if (!user) {
    user = User.create({
      id: UserId.create(validInput.userId).value,
      platform: validInput.platform as any, // В реальной реализации нужна валидация
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
      currentState: 'started',
      currentStep: 'welcome',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    session = await createDialogSession(session);
    
    // Возвращаем приветственное сообщение
    const welcomeMessage: InfoMessageDto = {
      title: "Добро пожаловать!",
      content: "Привет! 👋 Я — бот-ассистент, созданный разработчиком.\n\nМоя задача — показать, как чат-боты могут помочь вашему бизнесу привлекать клиентов, автоматизировать рутину и увеличивать продажи.\n\nГотовы за 2 минуты узнать, как бот может помочь именно вам?",
    };
    
    // Предлагаем выбор
    const choice: SingleChoiceDto = {
      question: "Что вас интересует?",
      options: [
        { id: "audit", text: "🚀 Да, провести аудит моего бизнеса", value: "audit" },
        { id: "demo", text: "🤔 Просто посмотреть, что умеют боты", value: "demo" },
        { id: "contact", text: "💬 Связаться с разработчиком", value: "contact" }
      ]
    };
    
    // В реальной реализации мы бы вернули объект, который driving adapter преобразует
    // Но для демонстрации архитектуры просто возвращаем choice
    return choice;
  }
  
  // Если сессия существует, обрабатываем действие в контексте текущего шага
  switch (session.state.currentStep) {
    case 'welcome':
      return await handleWelcomeStep(session, validInput, { 
        updateDialogSession, 
        saveMessage
      });
      
    case 'business_type':
      return await handleBusinessTypeStep(session, validInput, { 
        updateDialogSession, 
        saveMessage
      });
      
    default:
      // Дефолтная обработка
      const defaultMessage: InfoMessageDto = {
        content: "Извините, я не понял ваш запрос. Можете повторить или выбрать один из вариантов?",
      };
      return defaultMessage;
  }
};

// Вспомогательные функции для обработки шагов
async function handleWelcomeStep(
  session: typeof DialogSession,
  input: IncomingUserActionDto,
  ports: {
    updateDialogSession: (session: typeof DialogSession) => Promise<typeof DialogSession>,
    saveMessage: (message: typeof Message) => Promise<void>
  }
): Promise<SingleChoiceDto | InfoMessageDto | null> {
  // Сохраняем сообщение пользователя
  const message = Message.create({
    id: MessageId.create(crypto.randomUUID()).value,
    sessionId: session.state.id,
    userId: session.state.userId,
    text: input.payload,
    direction: 'incoming',
    timestamp: input.timestamp,
  });
  await ports.saveMessage(message);
  
  // Обрабатываем выбор пользователя
  switch (input.payload) {
    case 'audit':
      // Переходим к следующему шагу
      session.actions.advanceToStep('business_type');
      await ports.updateDialogSession(session);
      
      const businessTypeChoice: SingleChoiceDto = {
        question: "Отлично! Чтобы дать точные рекомендации, ответьте на 3 вопроса.\n\nДля начала, в какой сфере ваш бизнес?",
        options: [
          { id: "online_school", text: "Онлайн-школа/Курсы", value: "online_school" },
          { id: "ecommerce", text: "Интернет-магазин", value: "ecommerce" },
          { id: "services", text: "Услуги (салон, фитнес)", value: "services" },
          { id: "b2b", text: "B2B", value: "b2b" },
          { id: "other", text: "Другое", value: "other" }
        ]
      };
      
      return businessTypeChoice;
      
    case 'demo':
      session.actions.advanceToStep('demo_mode');
      await ports.updateDialogSession(session);
      
      const demoMessage: InfoMessageDto = {
        content: "Хорошо! Вот несколько примеров того, что я могу делать:\n\n1. Автоматизировать ответы на часто задаваемые вопросы\n2. Собирать контактные данные и предпочтения клиентов\n3. Проводить опросы и квизы\n4. Принимать и обрабатывать заказы\n\nХотите попробовать какой-то из этих сценариев?",
      };
      
      return demoMessage;
      
    case 'contact':
      // В реальной реализации здесь бы был transfer DTO
      const contactMessage: InfoMessageDto = {
        content: "Отлично! Я передам ваш запрос разработчику.\n\nЧтобы ему было проще подготовиться к разговору, напишите кратко о вашем проекте или задайте вопрос прямо здесь.\n\nКак только вы отправите сообщение, я перешлю его разработчику, и он свяжется с вами в Telegram в ближайшее время.",
      };
      return contactMessage;
      
    default:
      return null;
  }
}

async function handleBusinessTypeStep(
  session: typeof DialogSession,
  input: IncomingUserActionDto,
  ports: {
    updateDialogSession: (session: typeof DialogSession) => Promise<typeof DialogSession>,
    saveMessage: (message: typeof Message) => Promise<void>
  }
): Promise<SingleChoiceDto | InfoMessageDto | null> {
  // Сохраняем сообщение пользователя
  const message = Message.create({
    id: MessageId.create(crypto.randomUUID()).value,
    sessionId: session.state.id,
    userId: session.state.userId,
    text: input.payload,
    direction: 'incoming',
    timestamp: input.timestamp,
  });
  await ports.saveMessage(message);
  
  // Сохраняем выбор в контексте
  session.actions.updateContext('business_type', input.payload);
  await ports.updateDialogSession(session);
  
  // Переходим к следующему шагу
  session.actions.advanceToStep('pain_point');
  await ports.updateDialogSession(session);
  
  const painPointChoice: SingleChoiceDto = {
    question: "Понял. А какая задача для вас сейчас самая острая?",
    options: [
      { id: "leads", text: "Нужно больше заявок/лидов", value: "leads" },
      { id: "managers", text: "Менеджеры не справляются с потоком сообщений", value: "managers" },
      { id: "sales", text: "Хочу автоматизировать продажи/оплаты", value: "sales" },
      { id: "engagement", text: "Нужно вовлечь и 'прогреть' аудиторию", value: "engagement" }
    ]
  };
  
  return painPointChoice;
}