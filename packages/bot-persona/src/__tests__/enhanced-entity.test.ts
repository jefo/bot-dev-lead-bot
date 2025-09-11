import { describe, it, expect, beforeEach } from "bun:test";
import { composeApp } from "../composition";
import { defineConversationModelUseCase } from "../application/use-cases/define-conversation-model.use-case";
import { createRuntimeEntity } from "../domain/runtime-entity.factory";
import type { PredicateOperator } from "../domain/conversation/entity.descriptor";

describe("Enhanced Entity Factory", () => {
	beforeEach(() => {
		composeApp();
	});

	it("should create an enhanced entity from a conversation model DTO", async () => {
		// Define a conversation model
		const conversationModel = {
			name: "TestModel",
			schema: {
				type: "object",
				properties: {
					id: { type: "string" },
					status: { type: "string", enum: ["open", "closed"] },
					title: { type: "string" },
				},
				required: ["id", "status", "title"],
				additionalProperties: false,
			},
			guards: [
				{
					propertyName: "status",
					condition: {
						operator: "neq" as const,
						value: "closed",
					},
					errorMessage: "Cannot modify closed items",
				},
			],
			defaults: {
				status: "open",
			},
		};

		// Create enhanced entity
		const EnhancedEntity = createRuntimeEntity(conversationModel);

		// Create an instance
		const entity = EnhancedEntity.create({
			id: "test-1",
			title: "Test Item",
		});

		expect(entity.state.id).toBe("test-1");
		expect(entity.state.status).toBe("open");
		expect(entity.state.title).toBe("Test Item");

		// Update property
		entity.status = "closed";
		expect(entity.state.status).toBe("closed");

		// Try to violate guard
		expect(() => {
			entity.status = "open";
		}).toThrow("Cannot modify closed items");
	});

	it("should validate with AJV schema", async () => {
		// Define a conversation model with strict validation
		const conversationModel = {
			name: "ValidatedModel",
			schema: {
				type: "object",
				properties: {
					id: { type: "string" },
					count: { type: "integer", minimum: 0, maximum: 100 },
				},
				required: ["id", "count"],
				additionalProperties: false,
			},
			guards: [],
			defaults: {},
		};

		// Create enhanced entity
		const EnhancedEntity = createRuntimeEntity(conversationModel);

		// Valid creation
		const entity = EnhancedEntity.create({
			id: "test-2",
			count: 50,
		});

		expect(entity.state.count).toBe(50);

		// Invalid update should throw
		expect(() => {
			entity.count = 150; // exceeds maximum
		}).toThrow("Validation failed");
	});
});
