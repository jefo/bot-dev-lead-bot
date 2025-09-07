import { beforeEach, describe, expect, it, jest } from "bun:test";
import { resetDI, setPortAdapter } from "@maxdev1/sotajs/lib/di.v2";
import { randomUUID } from "crypto";
import {
	BotAggregate,
	type BotAggregateType,
} from "../../domain/aggregates/bot.aggregate";
import { ConversationSession } from "../../domain/entities/conversation-session.entity";
import {
	findActiveSessionByPersonaIdPort,
	findBotByIdPort,
	findConversationByIdPort,
	renderComponentOutPort,
	saveSessionPort,
} from "../ports/runtime.ports";
import {
	processUserInputUseCase,
	startConversationUseCase,
} from "./runtime.use-cases";
import {
	ConversationAggregate,
	type ConversationAggregateType,
} from "../../domain/aggregates/conversation.aggregate";

// --- Mock-объекты и шпионы ---

const memoryBots = new Map<string, BotAggregateType>();
const memoryConversations = new Map<string, ConversationAggregateType>();
const memorySessions = new Map<string, any>();

const mockSaveSessionPort = jest.fn(async (s) => {
	memorySessions.set(s.state.id, s);
});
const mockRenderComponentOutPort = jest.fn();

// --- Тестовые данные ---

const mockConversationDefinition = {
	id: randomUUID(),
	fsm: {
		initialState: "start",
		states: {
			start: { on: { GREETING: "question_1" } },
			question_1: { on: { ANSWER_A: "end", ANSWER_B: "question_2" } },
			question_2: { on: { ANSWER_C: "end" } },
			end: { on: {} },
		},
	},
	graph: {
		nodes: {
			start: { component: "WelcomeMessage" },
			question_1: { component: "Question1Keyboard" },
			question_2: { component: "Question2Keyboard" },
			end: { component: "ThankYouMessage" },
		},
	},
};

describe("BotPersona SDK Runtime Use Cases", () => {
	let mockBot: BotAggregateType;
	let mockConversation: ConversationAggregateType;

	beforeEach(() => {
		resetDI();
		memoryBots.clear();
		memoryConversations.clear();
		memorySessions.clear();
		mockSaveSessionPort.mockClear();
		mockRenderComponentOutPort.mockClear();

		// --- Предварительная настройка (Arrange) ---
		mockConversation = ConversationAggregate.create(mockConversationDefinition);
		mockBot = BotAggregate.create({
			id: randomUUID(),
			name: "Test Bot",
			conversationId: mockConversation.state.id,
		});
		memoryBots.set(mockBot.state.id, mockBot);
		memoryConversations.set(mockConversation.state.id, mockConversation);

		// --- Composition Root (локальный для теста) ---
		setPortAdapter(findBotByIdPort, async (id) => memoryBots.get(id) || null);
		setPortAdapter(
			findConversationByIdPort,
			async (id) => memoryConversations.get(id) || null,
		);
		setPortAdapter(findActiveSessionByPersonaIdPort, async (pId) => {
			for (const session of memorySessions.values()) {
				if (
					session.state.personaId === pId &&
					session.state.status === "active"
				) {
					return session;
				}
			}
			return null;
		});
		setPortAdapter(saveSessionPort, mockSaveSessionPort);
		setPortAdapter(renderComponentOutPort, mockRenderComponentOutPort);
	});

	describe("startConversationUseCase", () => {
		it("should create a new session and render the initial component", async () => {
			// Arrange
			const command = {
				botId: mockBot.state.id,
				personaId: "user:1",
				chatId: "chat:1",
			};

			// Act
			await startConversationUseCase(command);

			// Assert
			expect(mockSaveSessionPort).toHaveBeenCalledTimes(1);
			const session = Array.from(memorySessions.values())[0];
			expect(session.state.currentStateId).toBe("start");
			expect(session.state.botId).toBe(mockBot.state.id);

			expect(mockRenderComponentOutPort).toHaveBeenCalledTimes(1);
			expect(mockRenderComponentOutPort).toHaveBeenCalledWith({
				chatId: "chat:1",
				component: "WelcomeMessage",
				props: undefined,
			});
		});
	});

	describe("processUserInputUseCase", () => {
		it("should transition to the next state on valid input", async () => {
			// Arrange: Сначала создаем активную сессию
			const startCommand = {
				botId: mockBot.state.id,
				personaId: "user:1",
				chatId: "chat:1",
			};
			await startConversationUseCase(startCommand);
			mockRenderComponentOutPort.mockClear(); // Очищаем мок после первого шага

			const processCommand = {
				personaId: "user:1",
				userInput: { type: "callback", value: { data: "GREETING" } }, // Это событие должно перевести нас из 'start' в 'question_1'
			};

			// Act
			await processUserInputUseCase(processCommand);

			// Assert
			const session = Array.from(memorySessions.values())[0];
			expect(session.state.currentStateId).toBe("question_1"); // Проверяем, что состояние изменилось

			expect(mockRenderComponentOutPort).toHaveBeenCalledTimes(1);
			expect(mockRenderComponentOutPort).toHaveBeenCalledWith({
				chatId: "chat:1",
				component: "Question1Keyboard", // Проверяем, что рендерится компонент нового состояния
				props: undefined,
			});
		});

		it("should not transition on invalid input", async () => {
			// Arrange: Создаем активную сессию в состоянии 'start'
			const startCommand = {
				botId: mockBot.state.id,
				personaId: "user:1",
				chatId: "chat:1",
			};
			await startConversationUseCase(startCommand);
			mockRenderComponentOutPort.mockClear();
			mockSaveSessionPort.mockClear();

			const processCommand = {
				personaId: "user:1",
				userInput: { type: "callback", value: { data: "INVALID_EVENT" } }, // Несуществующее событие
			};

			// Act
			await processUserInputUseCase(processCommand);

			// Assert
			const session = Array.from(memorySessions.values())[0];
			expect(session.state.currentStateId).toBe("start"); // Состояние не должно было измениться

			expect(mockRenderComponentOutPort).not.toHaveBeenCalled(); // Рендер нового компонента не должен был быть вызван
			expect(mockSaveSessionPort).not.toHaveBeenCalled(); // Сессия не должна была пересохраняться
		});
	});
});
