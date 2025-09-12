import { describe, it, expect } from "bun:test";
import { createConversation } from "../conversaton.aggregate.v2";
import { FSM } from "../../bot-persona/fsm.vo";

// 1. Обновленный дескриптор, соответствующий IEntityDescriptor
const formDescriptor = {
	properties: {
		id: { type: String },
		name: { type: String },
		age: { type: Number, default: 18 },
	},
	guards: {
		age: (newValue: any) => {
			if (newValue < 18) return "Age must be 18 or older.";
			return true;
		},
	},
} as const;

describe("Conversation Aggregate V2", () => {
	it("should create a conversation with a dynamic, typesafe form", () => {
		const Conversation = createConversation(formDescriptor);

		const conversation = Conversation.create({
			id: "conv-001",
			botPersonaId: "bot-001",
			chatId: "chat-001",
			currentStateId: "initial",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: {
				id: "form-001",
				name: "John Doe",
			},
		});

		expect(conversation.id).toBe("conv-001");
		expect(conversation.status).toBe("active");
		expect(conversation.form).toBeDefined();
		expect(conversation.form.name).toBe("John Doe");
		expect(conversation.form.age).toBe(18); // Проверяем значение по умолчанию
	});

	it("should enforce guards on the form entity", () => {
		const Conversation = createConversation(formDescriptor);
		const conversation = Conversation.create({
			id: "conv-002",
			botPersonaId: "bot-002",
			chatId: "chat-002",
			currentStateId: "initial",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: { id: "form-002", name: "Jane Doe" },
		});

		// Эта операция должна пройти успешно
		conversation.form.age = 25;
		expect(conversation.form.age).toBe(25);

		// Эта операция должна выбросить ошибку из-за guard'а
		expect(() => {
			conversation.form.age = 17;
		}).toThrow("Age must be 18 or older.");
	});

	it("should handle processInput and update the form", () => {
		const fsm = new FSM({
			initialState: "ask_name",
			states: [
				{
					id: "ask_name",
					on: [
						{
							event: "SUBMIT_NAME",
							target: "done",
							assign: { name: "payload.userName" },
						},
					],
				},
				{ id: "done", on: [] },
			],
		});

		const Conversation = createConversation(formDescriptor);
		const conversation = Conversation.create({
			id: "conv-003",
			botPersonaId: "bot-003",
			chatId: "chat-003",
			currentStateId: "ask_name",
			createdAt: new Date(),
			updatedAt: new Date(),
			form: { id: "form-003", name: "" },
		});

		conversation.processInput(fsm, "SUBMIT_NAME", { userName: "Peter" });

		expect(conversation.currentStateId).toBe("done");
		expect(conversation.form.name).toBe("Peter");
	});
});
