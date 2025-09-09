import { describe, it, expect, beforeEach } from "bun:test";
import {
	composeApp,
	inMemoryFindAllBotPersonasAdapter,
} from "../../composition";
import { defineBotPersonaUseCase } from "../../application/use-cases/define-bot-persona.use-case";
import { startConversationUseCase } from "../../application/use-cases/start-conversation.use-case";

describe("FAQ Bot Integration Test", () => {
	beforeEach(() => {
		// Собираем приложение перед каждым тестом
		composeApp();
	});

	it("should create FAQ bot persona and handle conversation flow", async () => {
		// 1. Определяем FAQ-бота
		const faqBotDefinition = {
			name: "FAQ Bot",
			fsm: {
				initialState: "welcome",
				states: [
					{
						id: "welcome",
						on: [
							{ event: "FAQ1", target: "faq1" },
							{ event: "FAQ2", target: "faq2" },
							{ event: "FAQ3", target: "faq3" },
							{ event: "END", target: "end" },
						],
					},
					{
						id: "faq1",
						on: [{ event: "BACK", target: "welcome" }],
					},
					{
						id: "faq2",
						on: [{ event: "BACK", target: "welcome" }],
					},
					{
						id: "faq3",
						on: [{ event: "BACK", target: "welcome" }],
					},
					{
						id: "end",
						on: [],
					},
				],
			},
			viewMap: {
				nodes: [
					{
						id: "welcome",
						component: "WelcomeMessage",
						props: {
							text: "Добро пожаловать! Выберите интересующий вас вопрос:",
							options: [
								"FAQ1 - Как работает этот бот?",
								"FAQ2 - Где найти документацию?",
								"FAQ3 - Как получить помощь?",
								"END - Завершить",
							],
						},
					},
					{
						id: "faq1",
						component: "FaqAnswer",
						props: {
							question: "Как работает этот бот?",
							answer:
								"Этот бот использует конечный автомат для управления диалогом. Каждое состояние соответствует определенному этапу взаимодействия.",
						},
					},
					{
						id: "faq2",
						component: "FaqAnswer",
						props: {
							question: "Где найти документацию?",
							answer: "Документация доступна в репозитории проекта на GitHub.",
						},
					},
					{
						id: "faq3",
						component: "FaqAnswer",
						props: {
							question: "Как получить помощь?",
							answer:
								"Вы можете получить помощь, создав issue в репозитории проекта или обратившись в службу поддержки.",
						},
					},
					{
						id: "end",
						component: "GoodbyeMessage",
						props: {
							text: "Спасибо за использование нашего бота! До свидания!",
						},
					},
				],
			},
		};

		// Определяем бота
		await defineBotPersonaUseCase(faqBotDefinition);

		// Получаем ID созданного бота
		const { inMemoryFindAllBotPersonasAdapter } = await import(
			"../../../src/composition"
		);
		const botPersonas = await inMemoryFindAllBotPersonasAdapter();
		console.log("BotPersonas count:", botPersonas.size);
		let botPersonaId = "";
		for (const [id, persona] of botPersonas) {
			console.log("Found persona:", persona.state.name, "with id:", id);
			if (persona.state.name === "FAQ Bot") {
				botPersonaId = id;
				break;
			}
		}

		console.log("BotPersonaId found:", botPersonaId);
		expect(botPersonaId).not.toBe("");

		// 2. Запускаем диалог
		const chatId = "faq-test-chat";
		await startConversationUseCase({
			botPersonaId,
			chatId,
		});

		// TODO: Добавить проверки для компонентов
	});

	it("should handle invalid input gracefully", async () => {
		// Создаем бота (повторяем часть предыдущего теста)
		const faqBotDefinition = {
			name: "FAQ Bot 2",
			fsm: {
				initialState: "welcome",
				states: [
					{
						id: "welcome",
						on: [
							{ event: "FAQ1", target: "faq1" },
							{ event: "END", target: "end" },
						],
					},
					{
						id: "faq1",
						on: [{ event: "BACK", target: "welcome" }],
					},
					{
						id: "end",
						on: [],
					},
				],
			},
			viewMap: {
				nodes: [
					{
						id: "welcome",
						component: "WelcomeMessage",
						props: {
							text: "Добро пожаловать!",
							options: ["FAQ1 - Как работает этот бот?", "END - Завершить"],
						},
					},
					{
						id: "faq1",
						component: "FaqAnswer",
						props: {
							question: "Как работает этот бот?",
							answer: "Этот бот использует конечный автомат.",
						},
					},
					{
						id: "end",
						component: "GoodbyeMessage",
						props: { text: "До свидания!" },
					},
				],
			},
		};

		await defineBotPersonaUseCase(faqBotDefinition);

		const botPersonas = await inMemoryFindAllBotPersonasAdapter();
		let botPersonaId = "";
		console.log("BotPersonas count (test 2):", botPersonas.size);
		for (const [id, persona] of botPersonas) {
			console.log(
				"Found persona (test 2):",
				persona.state.name,
				"with id:",
				id,
			);
			if (persona.state.name === "FAQ Bot 2") {
				botPersonaId = id;
				break;
			}
		}

		console.log("BotPersonaId found (test 2):", botPersonaId);
		expect(botPersonaId).not.toBe("");

		// Запускаем диалог
		const chatId = "faq-invalid-test-chat";
		await startConversationUseCase({
			botPersonaId,
			chatId,
		});

		// TODO: Добавить проверки для обработки ошибок
	});
});
