import { describe, it, expect, beforeEach } from "bun:test";
import { composeApp } from "../../composition";
import { defineBotPersonaUseCase } from "../../application/use-cases/define-bot-persona.use-case";
import { startConversationUseCase } from "../../application/use-cases/start-conversation.use-case";
import { processUserInputUseCase } from "../../application/use-cases/process-user-input.use-case";
import { inMemoryFindAllBotPersonasAdapter } from "../../composition";

describe("Restaurant Bot Integration Test", () => {
  beforeEach(() => {
    // Собираем приложение перед каждым тестом
    composeApp();
  });

  it("should create restaurant bot and handle menu browsing flow", async () => {
    // 1. Определяем бота для ресторана
    const restaurantBotDefinition = {
      name: "Restaurant Bot",
      fsm: {
        initialState: "welcome",
        states: [
          {
            id: "welcome",
            on: [
              { event: "VIEW_MENU", target: "menu" },
              { event: "MAKE_RESERVATION", target: "reservation" },
              { event: "ORDER_FOOD", target: "order" }
            ]
          },
          {
            id: "menu",
            on: [
              { event: "SELECT_CATEGORY", target: "menuCategory", assign: { category: "payload.category" } },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          },
          {
            id: "menuCategory",
            on: [
              { event: "SELECT_DISH", target: "dishDetails", assign: { dish: "payload.dish" } },
              { event: "BACK_TO_MENU", target: "menu" }
            ]
          },
          {
            id: "dishDetails",
            on: [
              { event: "ADD_TO_CART", target: "cart", assign: { quantity: "payload.quantity" } },
              { event: "BACK_TO_CATEGORY", target: "menuCategory" }
            ]
          },
          {
            id: "cart",
            on: [
              { event: "VIEW_CART", target: "cartView" },
              { event: "CONTINUE_SHOPPING", target: "menu" },
              { event: "PROCEED_TO_CHECKOUT", target: "checkout" }
            ]
          },
          {
            id: "cartView",
            on: [
              { event: "BACK_TO_SHOPPING", target: "menu" },
              { event: "PROCEED_TO_CHECKOUT", target: "checkout" }
            ]
          },
          {
            id: "checkout",
            on: [
              { event: "PROVIDE_DELIVERY_INFO", target: "deliveryInfo", assign: { delivery: "payload.delivery" } },
              { event: "PICKUP_ORDER", target: "pickupInfo" }
            ]
          },
          {
            id: "deliveryInfo",
            on: [
              { event: "CONFIRM_DELIVERY", target: "payment", assign: { address: "payload.address" } }
            ]
          },
          {
            id: "pickupInfo",
            on: [
              { event: "CONFIRM_PICKUP", target: "payment", assign: { pickupTime: "payload.time" } }
            ]
          },
          {
            id: "payment",
            on: [
              { event: "PAY_BY_CARD", target: "cardPayment", assign: { paymentMethod: "card" } },
              { event: "PAY_BY_CASH", target: "cashPayment", assign: { paymentMethod: "cash" } }
            ]
          },
          {
            id: "cardPayment",
            on: [
              { event: "PROCESS_PAYMENT", target: "orderConfirmation", assign: { cardNumber: "payload.card" } }
            ]
          },
          {
            id: "cashPayment",
            on: [
              { event: "CONFIRM_CASH_PAYMENT", target: "orderConfirmation" }
            ]
          },
          {
            id: "orderConfirmation",
            on: []
          },
          {
            id: "reservation",
            on: [
              { event: "SELECT_DATE", target: "reservationDate", assign: { resDate: "payload.date" } },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          },
          {
            id: "reservationDate",
            on: [
              { event: "SELECT_TIME", target: "reservationTime", assign: { resTime: "payload.time" } },
              { event: "BACK_TO_RESERVATION", target: "reservation" }
            ]
          },
          {
            id: "reservationTime",
            on: [
              { event: "CONFIRM_RESERVATION", target: "reservationConfirmation", assign: { guests: "payload.guests" } }
            ]
          },
          {
            id: "reservationConfirmation",
            on: []
          },
          {
            id: "order",
            on: [
              { event: "START_ORDER", target: "menu" },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          }
        ]
      },
      viewMap: {
        nodes: [
          {
            id: "welcome",
            component: "WelcomeMessage",
            props: { 
              text: "Добро пожаловать в ресторан 'У Марины'!",
              options: ["Посмотреть меню", "Забронировать столик", "Заказать еду"]
            }
          },
          {
            id: "menu",
            component: "MenuCategories",
            props: { 
              text: "Выберите категорию меню:",
              categories: ["Закуски", "Основные блюда", "Десерты", "Напитки"]
            }
          },
          {
            id: "menuCategory",
            component: "MenuItems",
            props: { 
              text: "Выберите блюдо из категории:"
            }
          },
          {
            id: "dishDetails",
            component: "DishDetails",
            props: { 
              text: "Информация о блюде:"
            }
          },
          {
            id: "cart",
            component: "CartActions",
            props: { 
              text: "Блюдо добавлено в корзину!",
              options: ["Посмотреть корзину", "Продолжить покупки", "Оформить заказ"]
            }
          },
          {
            id: "cartView",
            component: "CartView",
            props: { 
              text: "Ваша корзина:",
              options: ["Продолжить покупки", "Оформить заказ"]
            }
          },
          {
            id: "checkout",
            component: "CheckoutOptions",
            props: { 
              text: "Выберите способ получения заказа:",
              options: ["Доставка", "Самовывоз"]
            }
          },
          {
            id: "deliveryInfo",
            component: "DeliveryForm",
            props: { 
              text: "Введите адрес доставки:"
            }
          },
          {
            id: "pickupInfo",
            component: "PickupForm",
            props: { 
              text: "Выберите время самовывоза:"
            }
          },
          {
            id: "payment",
            component: "PaymentOptions",
            props: { 
              text: "Выберите способ оплаты:",
              options: ["Картой", "Наличными"]
            }
          },
          {
            id: "cardPayment",
            component: "CardPaymentForm",
            props: { 
              text: "Введите данные карты:"
            }
          },
          {
            id: "cashPayment",
            component: "CashPaymentConfirmation",
            props: { 
              text: "Подтвердите оплату наличными при получении:"
            }
          },
          {
            id: "orderConfirmation",
            component: "OrderConfirmation",
            props: { 
              text: "Ваш заказ успешно оформлен! Спасибо за покупку."
            }
          },
          {
            id: "reservation",
            component: "ReservationDate",
            props: { 
              text: "Выберите дату бронирования:"
            }
          },
          {
            id: "reservationDate",
            component: "ReservationTime",
            props: { 
              text: "Выберите время бронирования:"
            }
          },
          {
            id: "reservationTime",
            component: "ReservationDetails",
            props: { 
              text: "Введите количество гостей:"
            }
          },
          {
            id: "reservationConfirmation",
            component: "ReservationConfirmation",
            props: { 
              text: "Ваш столик успешно забронирован!"
            }
          },
          {
            id: "order",
            component: "OrderStart",
            props: { 
              text: "Начните заказ:",
              options: ["Начать заказ", "Назад"]
            }
          }
        ]
      }
    };

    // Определяем бота
    await defineBotPersonaUseCase(restaurantBotDefinition);
    
    // Получаем ID созданного бота
    const botPersonas = await inMemoryFindAllBotPersonasAdapter();
    let botPersonaId = "";
    for (const [id, persona] of botPersonas) {
      if (persona.state.name === "Restaurant Bot") {
        botPersonaId = id;
        break;
      }
    }
    
    expect(botPersonaId).not.toBe("");

    // 2. Запускаем диалог
    const chatId = "restaurant-test-chat";
    await startConversationUseCase({
      botPersonaId,
      chatId
    });

    // 3. Просматриваем меню
    await processUserInputUseCase({
      chatId,
      event: "VIEW_MENU",
      payload: {}
    });

    // 4. Выбираем категорию
    await processUserInputUseCase({
      chatId,
      event: "SELECT_CATEGORY",
      payload: { category: "Закуски" }
    });

    // 5. Выбираем блюдо
    await processUserInputUseCase({
      chatId,
      event: "SELECT_DISH",
      payload: { dish: "Салат Цезарь" }
    });

    // 6. Добавляем в корзину
    await processUserInputUseCase({
      chatId,
      event: "ADD_TO_CART",
      payload: { quantity: 1 }
    });

    // 7. Переходим к оформлению заказа
    await processUserInputUseCase({
      chatId,
      event: "PROCEED_TO_CHECKOUT",
      payload: {}
    });

    // 8. Выбираем самовывоз
    await processUserInputUseCase({
      chatId,
      event: "PICKUP_ORDER",
      payload: {}
    });

    // 9. Подтверждаем время самовывоза
    await processUserInputUseCase({
      chatId,
      event: "CONFIRM_PICKUP",
      payload: { time: "19:00" }
    });

    // 10. Выбираем оплату наличными
    await processUserInputUseCase({
      chatId,
      event: "PAY_BY_CASH",
      payload: {}
    });

    // 11. Подтверждаем оплату
    await processUserInputUseCase({
      chatId,
      event: "CONFIRM_CASH_PAYMENT",
      payload: {}
    });

    // Проверяем, что заказ оформлен успешно
    // TODO: Добавить проверки для компонентов и контекста
  });

  it("should handle restaurant reservation flow", async () => {
    // Создаем бота (повторяем часть предыдущего теста)
    const restaurantBotDefinition = {
      name: "Restaurant Bot 2",
      fsm: {
        initialState: "welcome",
        states: [
          {
            id: "welcome",
            on: [
              { event: "VIEW_MENU", target: "menu" },
              { event: "MAKE_RESERVATION", target: "reservation" },
              { event: "ORDER_FOOD", target: "order" }
            ]
          },
          {
            id: "menu",
            on: [
              { event: "SELECT_CATEGORY", target: "menuCategory", assign: { category: "payload.category" } },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          },
          {
            id: "menuCategory",
            on: [
              { event: "SELECT_DISH", target: "dishDetails", assign: { dish: "payload.dish" } },
              { event: "BACK_TO_MENU", target: "menu" }
            ]
          },
          {
            id: "dishDetails",
            on: [
              { event: "ADD_TO_CART", target: "cart", assign: { quantity: "payload.quantity" } },
              { event: "BACK_TO_CATEGORY", target: "menuCategory" }
            ]
          },
          {
            id: "cart",
            on: [
              { event: "VIEW_CART", target: "cartView" },
              { event: "CONTINUE_SHOPPING", target: "menu" },
              { event: "PROCEED_TO_CHECKOUT", target: "checkout" }
            ]
          },
          {
            id: "cartView",
            on: [
              { event: "BACK_TO_SHOPPING", target: "menu" },
              { event: "PROCEED_TO_CHECKOUT", target: "checkout" }
            ]
          },
          {
            id: "checkout",
            on: [
              { event: "PROVIDE_DELIVERY_INFO", target: "deliveryInfo", assign: { delivery: "payload.delivery" } },
              { event: "PICKUP_ORDER", target: "pickupInfo" }
            ]
          },
          {
            id: "deliveryInfo",
            on: [
              { event: "CONFIRM_DELIVERY", target: "payment", assign: { address: "payload.address" } }
            ]
          },
          {
            id: "pickupInfo",
            on: [
              { event: "CONFIRM_PICKUP", target: "payment", assign: { pickupTime: "payload.time" } }
            ]
          },
          {
            id: "payment",
            on: [
              { event: "PAY_BY_CARD", target: "cardPayment", assign: { paymentMethod: "card" } },
              { event: "PAY_BY_CASH", target: "cashPayment", assign: { paymentMethod: "cash" } }
            ]
          },
          {
            id: "cardPayment",
            on: [
              { event: "PROCESS_PAYMENT", target: "orderConfirmation", assign: { cardNumber: "payload.card" } }
            ]
          },
          {
            id: "cashPayment",
            on: [
              { event: "CONFIRM_CASH_PAYMENT", target: "orderConfirmation" }
            ]
          },
          {
            id: "orderConfirmation",
            on: []
          },
          {
            id: "reservation",
            on: [
              { event: "SELECT_DATE", target: "reservationDate", assign: { resDate: "payload.date" } },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          },
          {
            id: "reservationDate",
            on: [
              { event: "SELECT_TIME", target: "reservationTime", assign: { resTime: "payload.time" } },
              { event: "BACK_TO_RESERVATION", target: "reservation" }
            ]
          },
          {
            id: "reservationTime",
            on: [
              { event: "CONFIRM_RESERVATION", target: "reservationConfirmation", assign: { guests: "payload.guests" } }
            ]
          },
          {
            id: "reservationConfirmation",
            on: []
          },
          {
            id: "order",
            on: [
              { event: "START_ORDER", target: "menu" },
              { event: "BACK_TO_MAIN", target: "welcome" }
            ]
          }
        ]
      },
      viewMap: {
        nodes: [
          {
            id: "welcome",
            component: "WelcomeMessage",
            props: { 
              text: "Добро пожаловать в ресторан 'У Марины'!",
              options: ["Посмотреть меню", "Забронировать столик", "Заказать еду"]
            }
          },
          {
            id: "menu",
            component: "MenuCategories",
            props: { 
              text: "Выберите категорию меню:",
              categories: ["Закуски", "Основные блюда", "Десерты", "Напитки"]
            }
          },
          {
            id: "menuCategory",
            component: "MenuItems",
            props: { 
              text: "Выберите блюдо из категории:"
            }
          },
          {
            id: "dishDetails",
            component: "DishDetails",
            props: { 
              text: "Информация о блюде:"
            }
          },
          {
            id: "cart",
            component: "CartActions",
            props: { 
              text: "Блюдо добавлено в корзину!",
              options: ["Посмотреть корзину", "Продолжить покупки", "Оформить заказ"]
            }
          },
          {
            id: "cartView",
            component: "CartView",
            props: { 
              text: "Ваша корзина:",
              options: ["Продолжить покупки", "Оформить заказ"]
            }
          },
          {
            id: "checkout",
            component: "CheckoutOptions",
            props: { 
              text: "Выберите способ получения заказа:",
              options: ["Доставка", "Самовывоз"]
            }
          },
          {
            id: "deliveryInfo",
            component: "DeliveryForm",
            props: { 
              text: "Введите адрес доставки:"
            }
          },
          {
            id: "pickupInfo",
            component: "PickupForm",
            props: { 
              text: "Выберите время самовывоза:"
            }
          },
          {
            id: "payment",
            component: "PaymentOptions",
            props: { 
              text: "Выберите способ оплаты:",
              options: ["Картой", "Наличными"]
            }
          },
          {
            id: "cardPayment",
            component: "CardPaymentForm",
            props: { 
              text: "Введите данные карты:"
            }
          },
          {
            id: "cashPayment",
            component: "CashPaymentConfirmation",
            props: { 
              text: "Подтвердите оплату наличными при получении:"
            }
          },
          {
            id: "orderConfirmation",
            component: "OrderConfirmation",
            props: { 
              text: "Ваш заказ успешно оформлен!"
            }
          },
          {
            id: "reservation",
            component: "ReservationDate",
            props: { 
              text: "Выберите дату бронирования:"
            }
          },
          {
            id: "reservationDate",
            component: "ReservationTime",
            props: { 
              text: "Выберите время бронирования:"
            }
          },
          {
            id: "reservationTime",
            component: "ReservationDetails",
            props: { 
              text: "Введите количество гостей:"
            }
          },
          {
            id: "reservationConfirmation",
            component: "ReservationConfirmation",
            props: { 
              text: "Ваш столик успешно забронирован!"
            }
          },
          {
            id: "order",
            component: "OrderStart",
            props: { 
              text: "Начните заказ:",
              options: ["Начать заказ", "Назад"]
            }
          }
        ]
      }
    };

    await defineBotPersonaUseCase(restaurantBotDefinition);
    
    // Получаем ID созданного бота
    const botPersonas = await inMemoryFindAllBotPersonasAdapter();
    let botPersonaId = "";
    for (const [id, persona] of botPersonas) {
      if (persona.state.name === "Restaurant Bot 2") {
        botPersonaId = id;
        break;
      }
    }
    
    expect(botPersonaId).not.toBe("");

    // Запускаем диалог
    const chatId = "restaurant-reservation-test-chat";
    await startConversationUseCase({
      botPersonaId,
      chatId
    });

    // Выбираем бронирование столика
    await processUserInputUseCase({
      chatId,
      event: "MAKE_RESERVATION",
      payload: {}
    });

    // Выбираем дату
    await processUserInputUseCase({
      chatId,
      event: "SELECT_DATE",
      payload: { date: "2025-09-20" }
    });

    // Выбираем время
    await processUserInputUseCase({
      chatId,
      event: "SELECT_TIME",
      payload: { time: "19:30" }
    });

    // Подтверждаем бронирование
    await processUserInputUseCase({
      chatId,
      event: "CONFIRM_RESERVATION",
      payload: { guests: 4 }
    });

    // Проверяем, что бронирование подтверждено
    // TODO: Добавить проверки для компонентов
  });
});