import { z } from "zod";

// Схемы Zod для валидации и сериализации
export const TransitionSchema = z.object({
	event: z.string(),
	target: z.string(),
	assign: z.record(z.string(), z.string()).optional(),
});

export const StateSchema = z.object({
	id: z.string(),
	on: z.array(TransitionSchema).optional(),
});

export const FsmSchema = z.object({
	initialState: z.string(),
	states: z.array(StateSchema),
});

export type FsmDefinition = z.infer<typeof FsmSchema>;
export type StateDefinition = z.infer<typeof StateSchema>;
export type TransitionDefinition = z.infer<typeof TransitionSchema>;

/**
 * FSM (Finite State Machine) - это неизменяемый Объект-Значение (Value Object).
 * Он инкапсулирует логику переходов состояний и ничего не знает о контексте или данных.
 * Его задача - быть "картой" состояний и правил.
 */
export class FSM {
	readonly initialState: string;
	private readonly statesById: Map<string, StateDefinition>;

	constructor(definition: FsmDefinition) {
		FsmSchema.parse(definition); // Валидация при создании

		this.initialState = definition.initialState;
		this.statesById = new Map(definition.states.map((s) => [s.id, s]));

		// Проверка инвариантов
		if (!this.statesById.has(this.initialState)) {
			throw new Error(
				`FSM invariant failed: initialState '${this.initialState}' not found.`,
			);
		}
		for (const state of this.statesById.values()) {
			for (const transition of state.on ?? []) {
				if (!this.statesById.has(transition.target)) {
					throw new Error(
						`FSM invariant failed: transition target '${transition.target}' from state '${state.id}' not found.`,
					);
				}
			}
		}
	}

	public findTransition(
		fromStateId: string,
		event: string,
	): TransitionDefinition | null {
		const state = this.statesById.get(fromStateId);
		if (!state) return null;
		return state.on?.find((t) => t.event === event) ?? null;
	}

	public getState(stateId: string): StateDefinition | undefined {
		return this.statesById.get(stateId);
	}
}
