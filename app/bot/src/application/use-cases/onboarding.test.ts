import { beforeEach, describe, expect, it, jest } from "bun:test";
import { QualificationProfile } from "../../domain/entities/qualification-profile.entity";
import { handleTelegramUpdate } from "../../infrastructure/telegram/onboarding.controllers";
import {
	businessOwnerPathSelectedOutPort,
	explorerPathSelectedOutPort,
	findQualificationProfileByTelegramIdPort,
	saveQualificationProfilePort,
	specialistPathSelectedOutPort,
	userWelcomedOutPort,
} from "../ports/onboarding.ports";
import { resetDI, setPortAdapter } from "@maxdev1/sotajs/lib/di.v2";

// --- Mocks & Spies ---

// In-memory DB для этого теста
const memoryDB = new Map<
	number,
	ReturnType<typeof QualificationProfile.create>
>();

// Mock-адаптеры для репозитория
const mockFindProfileAdapter = async (telegramId: number) => {
	return memoryDB.get(telegramId) || null;
};
const mockSaveProfileAdapter = async (
	profile: ReturnType<typeof QualificationProfile.create>,
) => {
	memoryDB.set(profile.state.telegramId, profile);
};

// Шпионы (spies) для адаптеров вывода, чтобы отслеживать их вызовы
const mockWelcomeUserAdapter = jest.fn();
const mockPathSelectedAdapter = jest.fn();

describe("Onboarding Module Integration Test", () => {
	// Перед каждым тестом очищаем DI контейнер и нашу in-memory DB
	beforeEach(() => {
		resetDI();
		memoryDB.clear();
		mockWelcomeUserAdapter.mockClear();
		mockPathSelectedAdapter.mockClear();

		// --- Composition Root (локальный для теста) ---
		// Связываем порты с нашими тестовыми адаптерами и шпионами
		setPortAdapter(
			findQualificationProfileByTelegramIdPort,
			mockFindProfileAdapter,
		);
		setPortAdapter(saveQualificationProfilePort, mockSaveProfileAdapter);
		setPortAdapter(userWelcomedOutPort, mockWelcomeUserAdapter);
		setPortAdapter(businessOwnerPathSelectedOutPort, mockPathSelectedAdapter);
		setPortAdapter(specialistPathSelectedOutPort, mockPathSelectedAdapter);
		setPortAdapter(explorerPathSelectedOutPort, mockPathSelectedAdapter);
	});

	it("should correctly handle the full user journey: /start -> select role", async () => {
		// --- Этап 1: Пользователь отправляет /start ---

		const telegramStartUpdate = {
			update_id: 1,
			message: {
				message_id: 100,
				from: { id: 12345, is_bot: false, first_name: "John" },
				chat: { id: 12345, first_name: "John", type: "private" },
				date: Date.now(),
				text: "/start",
			},
		};

		await handleTelegramUpdate(telegramStartUpdate);

		// --- Проверка 1: Пользователя поприветствовали ---

		// Ожидаем, что адаптер приветствия был вызван 1 раз
		expect(mockWelcomeUserAdapter).toHaveBeenCalledTimes(1);
		// Ожидаем, что он был вызван с правильным telegramId
		expect(mockWelcomeUserAdapter).toHaveBeenCalledWith({ telegramId: 12345 });

		// Проверяем состояние в "базе данных"
		const profileInDb = memoryDB.get(12345);
		expect(profileInDb).toBeDefined();
		expect(profileInDb?.state.role).toBeNull(); // Роль еще не выбрана

		// --- Этап 2: Пользователь выбирает роль "Владелец бизнеса" ---

		const telegramCallbackUpdate = {
			update_id: 2,
			callback_query: {
				id: "query1",
				from: { id: 12345, is_bot: false, first_name: "John" },
				message: { ...telegramStartUpdate.message },
				chat_instance: "chat1",
				data: "business_owner", // <-- Выбор пользователя
			},
		};

		await handleTelegramUpdate(telegramCallbackUpdate);

		// --- Проверка 2: Правильный путь выбран ---

		// Ожидаем, что адаптер выбора пути был вызван 1 раз
		expect(mockPathSelectedAdapter).toHaveBeenCalledTimes(1);
		// Ожидаем, что он был вызван с правильными данными
		expect(mockPathSelectedAdapter).toHaveBeenCalledWith({
			telegramId: 12345,
			role: "business_owner",
		});

		// Финальная проверка состояния в "базе данных"
		const updatedProfileInDb = memoryDB.get(12345);
		expect(updatedProfileInDb).toBeDefined();
		expect(updatedProfileInDb?.state.role).toBe("business_owner"); // Роль обновлена
	});
});
