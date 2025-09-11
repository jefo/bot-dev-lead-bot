import { describe, it, expect } from "bun:test";
import { createConversation } from "../conversaton.aggregate.v2";

describe("Conversation Aggregate V2", () => {
	it("should create a conversation with a dynamic form entity", () => {
		// Определяем дескриптор формы
		const formDescriptor = {
			name: "TestForm",
			schema: {
				type: "object",
				properties: {
					id: { type: "string" },
					name: { type: "string" },
					age: { type: "integer", minimum: 0, maximum: 150 }
				},
				required: ["id", "name"],
				additionalProperties: false
			},
			guards: [
				{
					propertyName: "age",
					condition: {
						operator: "lt",
						value: 100
					},
					errorMessage: "Age must be less than 100"
				}
			],
			defaults: {
				age: 0
			}
		};

		// Создаем фабрику агрегата
		const Conversation = createConversation(formDescriptor);

		// Создаем беседу
		const conversation = Conversation.create({
			id: "conv-001",
			botPersonaId: "bot-001",
			chatId: "chat-001",
			currentStateId: "initial",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: {
				id: "form-001",
				name: "John Doe"
			}
		});

		// Проверяем свойства беседы
		expect(conversation.id).toBe("conv-001");
		expect(conversation.botPersonaId).toBe("bot-001");
		expect(conversation.chatId).toBe("chat-001");
		expect(conversation.status).toBe("active");

		// Проверяем свойства формы
		expect(conversation.form.state.id).toBe("form-001");
		expect(conversation.form.state.name).toBe("John Doe");
		expect(conversation.form.state.age).toBe(0); // значение по умолчанию
	});

	it("should update form properties and handle guards", () => {
		// Определяем дескриптор формы
		const formDescriptor = {
			name: "GuardedForm",
			schema: {
				type: "object",
				properties: {
					id: { type: "string" },
					status: { type: "string", enum: ["active", "inactive", "deleted"] }
				},
				required: ["id", "status"],
				additionalProperties: false
			},
			guards: [
				{
					propertyName: "status",
					condition: {
						operator: "neq",
						value: "deleted"
					},
					errorMessage: "Cannot modify deleted items"
				}
			],
			defaults: {
				status: "active"
			}
		};

		// Создаем фабрику агрегата
		const Conversation = createConversation(formDescriptor);

		// Создаем беседу
		const conversation = Conversation.create({
			id: "conv-002",
			botPersonaId: "bot-002",
			chatId: "chat-002",
			currentStateId: "initial",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: {
				id: "form-002"
			}
		});

		// Обновляем свойство формы
		conversation.form.status = "inactive";
		expect(conversation.form.state.status).toBe("inactive");

		// Устанавливаем статус в "deleted"
		conversation.form.status = "deleted";
		expect(conversation.form.state.status).toBe("deleted");

		// Попытка изменить свойство удаленного элемента должна вызвать ошибку
		expect(() => {
			conversation.form.status = "active";
		}).toThrow("Cannot modify deleted items");
	});

	it("should handle processInput method", () => {
		// Для этого теста нам нужно создать мок FSM
		// Пока что просто проверим, что метод существует
		const formDescriptor = {
			name: "ProcessForm",
			schema: {
				type: "object",
				properties: {
					id: { type: "string" },
					name: { type: "string" }
				},
				required: ["id", "name"],
				additionalProperties: false
			},
			guards: [],
			defaults: {}
		};

		const Conversation = createConversation(formDescriptor);
		
		const conversation = Conversation.create({
			id: "conv-003",
			botPersonaId: "bot-003",
			chatId: "chat-003",
			currentStateId: "initial",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: {
				id: "form-003",
				name: "Test"
			}
		});

		// Проверяем, что метод существует
		expect(typeof conversation.processInput).toBe("function");
		expect(typeof conversation.finish).toBe("function");
		expect(typeof conversation.cancel).toBe("function");
	});
});