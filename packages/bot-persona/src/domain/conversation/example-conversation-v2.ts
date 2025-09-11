import { createConversation } from "./conversaton.aggregate.v2";
import type { EntityDescriptor } from "./entity.descriptor";

// Пример дескриптора формы для формы поддержки
const supportFormDescriptor: EntityDescriptor = {
	name: "SupportForm",
	schema: {
		type: "object",
		properties: {
			id: { type: "string" },
			ticketId: { type: "string" },
			category: { type: "string", enum: ["technical", "billing", "general"] },
			subject: { type: "string", minLength: 1, maxLength: 200 },
			description: { type: "string" },
			priority: { type: "string", enum: ["low", "medium", "high"] },
			status: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] }
		},
		required: ["id", "ticketId", "category", "subject", "status"],
		additionalProperties: false
	},
	guards: [
		{
			propertyName: "status",
			condition: {
				operator: "neq",
				value: "closed"
			},
			errorMessage: "Cannot modify closed tickets"
		}
	],
	defaults: {
		status: "open",
		priority: "medium"
	}
};

// Создаем фабрику агрегата Conversation для этой формы
const Conversation = createConversation(supportFormDescriptor);

// Пример использования
try {
	// Создаем беседу с формой
	const conversation = Conversation.create({
		id: "conv-001",
		botPersonaId: "bot-001",
		chatId: "chat-001",
		currentStateId: "initial",
		createdAt: new Date(),
		updatedAt: new Date(),
		form: {
			id: "form-001",
			ticketId: "ticket-001",
			category: "technical",
			subject: "Cannot login to application",
			description: "User reports they cannot login to the application"
		}
	});

	console.log("Conversation created:", conversation.state);
	console.log("Form state:", conversation.form.state);

	// Попробуем обновить форму напрямую
	conversation.form.priority = "high";
	console.log("After priority update:", conversation.form.state);

	// Попробуем нарушить guard
	try {
		// Сначала установим статус в "closed"
		conversation.form.status = "closed";
		console.log("After closing ticket:", conversation.form.state);
		
		// Попробуем изменить статус закрытого тикета (должно вызвать ошибку)
		conversation.form.status = "open";
	} catch (error) {
		console.log("Guard prevented action:", error.message);
	}

} catch (error) {
	console.error("Error:", error.message);
}