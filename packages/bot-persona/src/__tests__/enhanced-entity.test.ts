import { describe, it, expect } from "bun:test";
import { createRuntimeEntity } from "../domain/runtime-entity.factory";

describe("Runtime Entity Factory", () => {
	it("should create an entity and apply defaults", () => {
		const descriptor = {
			properties: {
				id: { type: String },
				status: { type: String, default: "open" },
				title: { type: String },
			},
		} as const;

		const EnhancedEntity = createRuntimeEntity(descriptor);

		const entity = EnhancedEntity.create({
			id: "test-1",
			title: "Test Item",
		});

		expect(entity.id).toBe("test-1");
		expect(entity.status).toBe("open");
		expect(entity.title).toBe("Test Item");
	});

	it("should validate property updates using guards", () => {
		const descriptor = {
			properties: {
				status: { type: String, default: "active" },
			},
			guards: {
				status: (newValue: any, oldValue: any) => {
					if (oldValue === "archived") {
						return "Cannot modify archived items";
					}
					return true;
				},
			},
		} as const;

		const EnhancedEntity = createRuntimeEntity(descriptor);

		const entity = EnhancedEntity.create({});

		entity.status = "pending";
		expect(entity.status).toBe("pending");

		entity.status = "archived";
		expect(entity.status).toBe("archived");

		expect(() => {
			entity.status = "active";
		}).toThrow("Cannot modify archived items");
	});
});