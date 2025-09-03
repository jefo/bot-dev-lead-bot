import { z } from 'zod';
import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import {
  IncomingMessageDtoSchema,
  OutgoingMessageDto,
  StartDialogDtoSchema,
  HandleUserChoiceDtoSchema,
  EndDialogDtoSchema,
  TransferToOperatorDtoSchema
} from '../dtos/message.dtos';
import {
  findUserByIdPort,
  saveUserPort,
  findDialogSessionByIdPort,
  findActiveDialogSessionByUserIdPort,
  saveDialogSessionPort,
  loggerPort
} from '../../domain/ports/repository.ports';
import { User, DialogSession } from '../../domain/entities/bot.entities';
import { UserId, DialogSessionId } from '../../domain/shared/ids';

// Use Case 1: Обработка входящего сообщения
export const processMessageUseCase = async (input: unknown): Promise<OutgoingMessageDto> => {
  // Валидация входных данных
  const validInput = IncomingMessageDtoSchema.parse(input);
  
  // Получение зависимостей через хуки
  const findUserById = usePort(findUserByIdPort);
  const findActiveDialogSession = usePort(findActiveDialogSessionByUserIdPort);
  const saveUser = usePort(saveUserPort);
  const saveDialogSession = usePort(saveDialogSessionPort);
  const log = usePort(loggerPort);
  
  // Логика обработки сообщения
  log(`Processing message from user ${validInput.userId}`, { input: validInput });
  
  // Проверка существования пользователя
  let user = await findUserById(validInput.userId);
  if (!user) {
    // Создание нового пользователя если не существует
    user = User.create({
      id: UserId.create(validInput.userId).value,
      platform: validInput.platform,
      createdAt: new Date(),
    });
    await saveUser(user);
  }
  
  // Поиск активной сессии диалога
  let session = await findActiveDialogSession(validInput.userId);
  
  // Если нет активной сессии, начинаем новый диалог
  if (!session) {
    const newSession = DialogSession.create({
      id: DialogSessionId.create(crypto.randomUUID()).value,
      userId: UserId.create(validInput.userId).value,
      currentState: 'initial',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await saveDialogSession(newSession);
    
    return {
      userId: validInput.userId,
      platform: validInput.platform,
      text: "Привет! 👋 Я — бот-ассистент, созданный разработчиком.

Моя задача — показать, как чат-боты могут помочь вашему бизнесу привлекать клиентов, автоматизировать рутину и увеличивать продажи.

Готовы за 2 минуты узнать, как бот может помочь именно вам?",
      buttons: [
        { text: "🚀 Да, провести аудит моего бизнеса" },
        { text: "🤔 Просто посмотреть, что умеют боты" },
        { text: "💬 Связаться с разработчиком" }
      ],
      timestamp: new Date(),
    };
  }
  
  // Обработка сообщения в контексте текущей сессии
  switch (session.state.currentState) {
    case 'initial':
      if (validInput.text === "🚀 Да, провести аудит моего бизнеса") {
        // Обновление состояния сессии
        session.actions.updateState('audit_started');
        await saveDialogSession(session);
        
        return {
          userId: validInput.userId,
          platform: validInput.platform,
          text: "Отлично! Чтобы дать точные рекомендации, ответьте на 3 вопроса.

Для начала, в какой сфере ваш бизнес?",
          buttons: [
            { text: "Онлайн-школа/Курсы" },
            { text: "Интернет-магазин" },
            { text: "Услуги (салон, фитнес)" },
            { text: "B2B" },
            { text: "Другое" }
          ],
          timestamp: new Date(),
        };
      } else if (validInput.text === "🤔 Просто посмотреть, что умеют боты") {
        // Обновление состояния сессии
        session.actions.updateState('demo_mode');
        await saveDialogSession(session);
        
        return {
          userId: validInput.userId,
          platform: validInput.platform,
          text: "Хорошо! Вот несколько примеров того, что я могу делать:

1. Автоматизировать ответы на часто задаваемые вопросы
2. Собирать контактные данные и предпочтения клиентов
3. Проводить опросы и квизы
4. Принимать и обрабатывать заказы

Хотите попробовать какой-то из этих сценариев?",
          buttons: [
            { text: " FAQ-бот" },
            { text: " Опросник" },
            { text: " Прием заказов" },
            { text: " Назад" }
          ],
          timestamp: new Date(),
        };
      } else if (validInput.text === "💬 Связаться с разработчиком") {
        return {
          userId: validInput.userId,
          platform: validInput.platform,
          text: "Отлично! Я передам ваш запрос разработчику.

Чтобы ему было проще подготовиться к разговору, напишите кратко о вашем проекте или задайте вопрос прямо здесь.

Как только вы отправите сообщение, я перешлю его разработчику, и он свяжется с вами в Telegram в ближайшее время.",
          timestamp: new Date(),
        };
      }
      break;
      
    // Другие состояния диалога...
    default:
      return {
        userId: validInput.userId,
        platform: validInput.platform,
        text: "Извините, я не понял ваш запрос. Можете повторить или выбрать один из вариантов?",
        buttons: [
          { text: "🔄 Начать сначала" },
          { text: "💬 Связаться с разработчиком" }
        ],
        timestamp: new Date(),
      };
  }
  
  // Дефолтный ответ если не сработал ни один кейс
  return {
    userId: validInput.userId,
    platform: validInput.platform,
    text: "Спасибо за ваше сообщение! Я обрабатываю его и скоро вернусь с ответом.",
    timestamp: new Date(),
  };
};

// Use Case 2: Начало нового диалога
export const startDialogUseCase = async (input: unknown): Promise<OutgoingMessageDto> => {
  const validInput = StartDialogDtoSchema.parse(input);
  
  const saveDialogSession = usePort(saveDialogSessionPort);
  const log = usePort(loggerPort);
  
  log(`Starting new dialog for user ${validInput.userId}`, { input: validInput });
  
  // Создание новой сессии диалога
  const newSession = DialogSession.create({
    id: DialogSessionId.create(crypto.randomUUID()).value,
    userId: UserId.create(validInput.userId).value,
    currentState: 'initial',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  await saveDialogSession(newSession);
  
  // Возврат приветственного сообщения
  return {
    userId: validInput.userId,
    platform: validInput.platform,
    text: "Привет! 👋 Я — бот-ассистент, созданный разработчиком.

Моя задача — показать, как чат-боты могут помочь вашему бизнесу привлекать клиентов, автоматизировать рутину и увеличивать продажи.

Готовы за 2 минуты узнать, как бот может помочь именно вам?",
    buttons: [
      { text: "🚀 Да, провести аудит моего бизнеса" },
      { text: "🤔 Просто посмотреть, что умеют боты" },
      { text: "💬 Связаться с разработчиком" }
    ],
    timestamp: new Date(),
  };
};

// Use Case 3: Обработка выбора пользователя
export const handleUserChoiceUseCase = async (input: unknown): Promise<OutgoingMessageDto> => {
  const validInput = HandleUserChoiceDtoSchema.parse(input);
  
  const findDialogSessionById = usePort(findDialogSessionByIdPort);
  const saveDialogSession = usePort(saveDialogSessionPort);
  const log = usePort(loggerPort);
  
  log(`Handling user choice for session ${validInput.sessionId}`, { input: validInput });
  
  const session = await findDialogSessionById(validInput.sessionId);
  if (!session) {
    return {
      userId: validInput.userId,
      platform: 'telegram', // дефолтное значение
      text: "Извините, сессия не найдена. Давайте начнем сначала.",
      buttons: [
        { text: "🔄 Начать сначала" }
      ],
      timestamp: new Date(),
    };
  }
  
  // Обработка выбора в зависимости от текущего состояния
  // Это упрощенная реализация
  
  return {
    userId: validInput.userId,
    platform: 'telegram', // получать из сессии в реальной реализации
    text: `Вы выбрали: ${validInput.choice}. Спасибо за ваш выбор!`,
    timestamp: new Date(),
  };
};

// Use Case 4: Завершение диалога
export const endDialogUseCase = async (input: unknown): Promise<OutgoingMessageDto> => {
  const validInput = EndDialogDtoSchema.parse(input);
  
  const findDialogSessionById = usePort(findDialogSessionByIdPort);
  const saveDialogSession = usePort(saveDialogSessionPort);
  const log = usePort(loggerPort);
  
  log(`Ending dialog for session ${validInput.sessionId}`, { input: validInput });
  
  const session = await findDialogSessionById(validInput.sessionId);
  if (session) {
    session.actions.endSession();
    await saveDialogSession(session);
  }
  
  return {
    userId: validInput.userId,
    platform: 'telegram', // получать из сессии в реальной реализации
    text: "Спасибо за ваше время! Диалог завершен. Если у вас возникнут еще вопросы, вы всегда можете начать новый диалог.",
    timestamp: new Date(),
  };
};

// Use Case 5: Передача оператору
export const transferToOperatorUseCase = async (input: unknown): Promise<OutgoingMessageDto> => {
  const validInput = TransferToOperatorDtoSchema.parse(input);
  
  const log = usePort(loggerPort);
  
  log(`Transferring session ${validInput.sessionId} to operator`, { input: validInput });
  
  // Здесь будет логика передачи диалога оператору
  
  return {
    userId: validInput.userId,
    platform: 'telegram', // получать из сессии в реальной реализации
    text: "Секунду, я передаю вас на общение с нашим специалистом. Он свяжется с вами в ближайшее время!",
    timestamp: new Date(),
  };
};