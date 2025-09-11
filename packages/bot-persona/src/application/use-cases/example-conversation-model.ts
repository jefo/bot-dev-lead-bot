import { defineConversationModelUseCase } from "./define-conversation-model.use-case";

// Example conversation model definition
const exampleConversationModel = {
	name: "SupportTicket",
	schema: {
		type: "object",
		properties: {
			id: { type: "string" },
			status: { type: "string", enum: ["open", "in_progress", "resolved", "closed"] },
			title: { type: "string", minLength: 1, maxLength: 200 },
			description: { type: "string" },
			priority: { type: "string", enum: ["low", "medium", "high"] },
			assignee: { type: "string" },
			customerId: { type: "string" },
			createdAt: { type: "string", format: "date-time" },
			updatedAt: { type: "string", format: "date-time" }
		},
		required: ["id", "status", "title", "customerId", "createdAt", "updatedAt"],
		additionalProperties: false
	},
	guards: [
		// Cannot change assignee of closed tickets
		{
			propertyName: "assignee",
			condition: {
				operator: "neq",
				value: "closed"
			},
			errorMessage: "Cannot change assignee of closed tickets"
		},
		// Priority must be valid
		{
			propertyName: "priority",
			condition: {
				operator: "in",
				value: ["low", "medium", "high"]
			},
			errorMessage: "Priority must be low, medium, or high"
		}
	],
	defaults: {
		status: "open",
		priority: "medium"
	}
};

// This would be called from a controller or CLI command
// await defineConversationModelUseCase(exampleConversationModel);