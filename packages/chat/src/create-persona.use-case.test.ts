import { describe, test, expect } from "bun:test";
import { createPersonaUseCase } from "./create-persona.use-case";
import { PersonaEntity } from "./persona.entity";

describe("createPersonaUseCase", () => {
	test("should validate input correctly", async () => {
		const invalidInput = {
			id: "invalid-uuid",
			name: "",
		};

		expect(createPersonaUseCase(invalidInput)).rejects.toThrow();
	});

	test("should create persona entity correctly", () => {
		const persona = PersonaEntity.create({
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test User",
		});

		expect(persona.id).toBe("123e4567-e89b-12d3-a456-426614174000");
		expect(persona.state.name).toBe("Test User");
	});
});
