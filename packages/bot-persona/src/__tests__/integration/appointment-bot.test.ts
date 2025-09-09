import { describe, it, expect, beforeEach } from "bun:test";
import { composeApp } from "../../composition";
import { defineBotPersonaUseCase } from "../../application/use-cases/define-bot-persona.use-case";
import { startConversationUseCase } from "../../application/use-cases/start-conversation.use-case";
import { processUserInputUseCase } from "../../application/use-cases/process-user-input.use-case";
import { inMemoryFindAllBotPersonasAdapter } from "../../composition";

describe("Appointment Booking Bot Integration Test", () => {
  beforeEach(() => {
    // Собираем приложение перед каждым тестом
    composeApp();
  });

  it("should create appointment booking bot and handle full conversation flow", async () => {
    // 1. Определяем бота для записи на прием
    const appointmentBotDefinition = {
      name: "Appointment Booking Bot",
      fsm: {
        initialState: "welcome",
        states: [
          {
            id: "welcome",
            on: [
              { event: "BOOK_APPOINTMENT", target: "selectService" }
            ]
          },
          {
            id: "selectService",
            on: [
              { event: "SERVICE_SELECTED", target: "provideName", assign: { service: "payload.service" } }
            ]
          },
          {
            id: "provideName",
            on: [
              { event: "NAME_PROVIDED", target: "provideContact", assign: { clientName: "payload.name" } }
            ]
          },
          {
            id: "provideContact",
            on: [
              { event: "CONTACT_PROVIDED", target: "selectDateTime", assign: { contact: "payload.contact" } }
            ]
          },
          {
            id: "selectDateTime",
            on: [
              { event: "DATETIME_SELECTED", target: "confirm", assign: { appointmentDateTime: "payload.datetime" } }
            ]
          },
          {
            id: "confirm",
            on: [
              { event: "CONFIRM", target: "success" },
              { event: "CANCEL", target: "cancelled" }
            ]
          },
          {
            id: "success",
            on: []
          },
          {
            id: "cancelled",
            on: []
          }
        ]
      },
      viewMap: {
        nodes: [
          {
            id: "welcome",
            component: "WelcomeMessage",
            props: { 
              text: "Добро пожаловать в сервис записи на прием!",
              options: ["Забронировать прием"]
            }
          },
          {
            id: "selectService",
            component: "ServiceSelector",
            props: { 
              text: "Выберите услугу:",
              services: ["Консультация", "Диагностика", "Лечение"]
            }
          },
          {
            id: "provideName",
            component: "NameInput",
            props: { 
              text: "Пожалуйста, введите ваше имя:"
            }
          },
          {
            id: "provideContact",
            component: "ContactInput",
            props: { 
              text: "Пожалуйста, введите ваш контактный телефон:"
            }
          },
          {
            id: "selectDateTime",
            component: "DateTimeSelector",
            props: { 
              text: "Выберите дату и время приема:"
            }
          },
          {
            id: "confirm",
            component: "AppointmentConfirmation",
            props: { 
              text: "Пожалуйста, подтвердите запись:"
            }
          },
          {
            id: "success",
            component: "SuccessMessage",
            props: { 
              text: "Ваша запись успешно подтверждена! Мы свяжемся с вами для подтверждения."
            }
          },
          {
            id: "cancelled",
            component: "CancelledMessage",
            props: { 
              text: "Запись была отменена. Вы можете попробовать записаться позже."
            }
          }
        ]
      }
    };

    // Определяем бота
    await defineBotPersonaUseCase(appointmentBotDefinition);
    
    // Получаем ID созданного бота
    const botPersonas = await inMemoryFindAllBotPersonasAdapter();
    let botPersonaId = "";
    for (const [id, persona] of botPersonas) {
      if (persona.state.name === "Appointment Booking Bot") {
        botPersonaId = id;
        break;
      }
    }
    
    expect(botPersonaId).not.toBe("");

    // 2. Запускаем диалог
    const chatId = "appointment-test-chat";
    await startConversationUseCase({
      botPersonaId,
      chatId
    });

    // 3. Начинаем процесс записи на прием
    await processUserInputUseCase({
      chatId,
      event: "BOOK_APPOINTMENT",
      payload: {}
    });

    // 4. Выбираем услугу
    await processUserInputUseCase({
      chatId,
      event: "SERVICE_SELECTED",
      payload: { service: "Консультация" }
    });

    // 5. Вводим имя
    await processUserInputUseCase({
      chatId,
      event: "NAME_PROVIDED",
      payload: { name: "Иван Иванов" }
    });

    // 6. Вводим контактные данные
    await processUserInputUseCase({
      chatId,
      event: "CONTACT_PROVIDED",
      payload: { contact: "+7(999)123-45-67" }
    });

    // 7. Выбираем дату и время
    await processUserInputUseCase({
      chatId,
      event: "DATETIME_SELECTED",
      payload: { datetime: "2025-09-15T14:00:00" }
    });

    // 8. Подтверждаем запись
    await processUserInputUseCase({
      chatId,
      event: "CONFIRM",
      payload: {}
    });

    // Проверяем, что диалог завершен успешно
    // TODO: Добавить проверки для компонентов и контекста
  });

  it("should handle cancellation during appointment booking", async () => {
    // Создаем бота (повторяем часть предыдущего теста)
    const appointmentBotDefinition = {
      name: "Appointment Booking Bot 2",
      fsm: {
        initialState: "welcome",
        states: [
          {
            id: "welcome",
            on: [
              { event: "BOOK_APPOINTMENT", target: "selectService" }
            ]
          },
          {
            id: "selectService",
            on: [
              { event: "SERVICE_SELECTED", target: "provideName", assign: { service: "payload.service" } }
            ]
          },
          {
            id: "provideName",
            on: [
              { event: "NAME_PROVIDED", target: "provideContact", assign: { clientName: "payload.name" } }
            ]
          },
          {
            id: "provideContact",
            on: [
              { event: "CONTACT_PROVIDED", target: "selectDateTime", assign: { contact: "payload.contact" } }
            ]
          },
          {
            id: "selectDateTime",
            on: [
              { event: "DATETIME_SELECTED", target: "confirm", assign: { appointmentDateTime: "payload.datetime" } }
            ]
          },
          {
            id: "confirm",
            on: [
              { event: "CONFIRM", target: "success" },
              { event: "CANCEL", target: "cancelled" }
            ]
          },
          {
            id: "success",
            on: []
          },
          {
            id: "cancelled",
            on: []
          }
        ]
      },
      viewMap: {
        nodes: [
          {
            id: "welcome",
            component: "WelcomeMessage",
            props: { 
              text: "Добро пожаловать в сервис записи на прием!",
              options: ["Забронировать прием"]
            }
          },
          {
            id: "selectService",
            component: "ServiceSelector",
            props: { 
              text: "Выберите услугу:",
              services: ["Консультация", "Диагностика", "Лечение"]
            }
          },
          {
            id: "provideName",
            component: "NameInput",
            props: { 
              text: "Пожалуйста, введите ваше имя:"
            }
          },
          {
            id: "provideContact",
            component: "ContactInput",
            props: { 
              text: "Пожалуйста, введите ваш контактный телефон:"
            }
          },
          {
            id: "selectDateTime",
            component: "DateTimeSelector",
            props: { 
              text: "Выберите дату и время приема:"
            }
          },
          {
            id: "confirm",
            component: "AppointmentConfirmation",
            props: { 
              text: "Пожалуйста, подтвердите запись:"
            }
          },
          {
            id: "success",
            component: "SuccessMessage",
            props: { 
              text: "Ваша запись успешно подтверждена!"
            }
          },
          {
            id: "cancelled",
            component: "CancelledMessage",
            props: { 
              text: "Запись была отменена."
            }
          }
        ]
      }
    };

    await defineBotPersonaUseCase(appointmentBotDefinition);
    
    // Получаем ID созданного бота
    const botPersonas = await inMemoryFindAllBotPersonasAdapter();
    let botPersonaId = "";
    for (const [id, persona] of botPersonas) {
      if (persona.state.name === "Appointment Booking Bot 2") {
        botPersonaId = id;
        break;
      }
    }
    
    expect(botPersonaId).not.toBe("");

    // Запускаем диалог
    const chatId = "appointment-cancel-test-chat";
    await startConversationUseCase({
      botPersonaId,
      chatId
    });

    // Начинаем процесс записи на прием
    await processUserInputUseCase({
      chatId,
      event: "BOOK_APPOINTMENT",
      payload: {}
    });

    // Выбираем услугу
    await processUserInputUseCase({
      chatId,
      event: "SERVICE_SELECTED",
      payload: { service: "Диагностика" }
    });

    // Вводим имя
    await processUserInputUseCase({
      chatId,
      event: "NAME_PROVIDED",
      payload: { name: "Мария Петрова" }
    });

    // Вводим контактные данные
    await processUserInputUseCase({
      chatId,
      event: "CONTACT_PROVIDED",
      payload: { contact: "+7(999)987-65-43" }
    });

    // Выбираем дату и время
    await processUserInputUseCase({
      chatId,
      event: "DATETIME_SELECTED",
      payload: { datetime: "2025-09-16T10:00:00" }
    });

    // Отменяем запись
    await processUserInputUseCase({
      chatId,
      event: "CANCEL",
      payload: {}
    });

    // Проверяем, что диалог завершен с отменой
    // TODO: Добавить проверки для компонентов
  });
});