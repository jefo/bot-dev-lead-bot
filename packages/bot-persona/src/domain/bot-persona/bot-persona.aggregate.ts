import { createAggregate } from "@maxdev1/sotajs";
import { z } from "zod";
import { FsmSchema, FSM } from "./fsm.vo";
import { ViewMapSchema, ViewMap } from "./view-map.vo";

// Схема была исправлена: добавлены fsm и viewMap
const BotPersonaSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	fsm: FsmSchema,
	viewMap: ViewMapSchema,
});

export type BotPersonaState = z.infer<typeof BotPersonaSchema>;

/**
 * Агрегат BotPersona.
 * Ответственность: Хранить и защищать целостность определения (шаблона) бота.
 * Является транзакционной границей для FSM и ViewMap.
 */
export const BotPersona = createAggregate({
	name: "BotPersona",
	schema: BotPersonaSchema,
	invariants: [
		// Кросс-контекстный инвариант: каждое состояние в FSM должно иметь узел в ViewMap.
		// Теперь этот инвариант работает корректно, так как fsm и viewMap есть в схеме.
		(state) => {
			const fsm = new FSM(state.fsm);
			const viewMap = new ViewMap(state.viewMap);
			const viewMapNodeIds = viewMap.getNodeIds();

			for (const fsmState of fsm.statesById.values()) {
				if (!viewMapNodeIds.has(fsmState.id)) {
					throw new Error(
						`Invariant failed: FSM state '${fsmState.id}' has no corresponding node in ViewMap.`,
					);
				}
			}
		},
	],
	actions: {
		// У этого агрегата нет публичных действий, так как он является, по сути, статическим определением.
		// Он создается и обновляется целиком.
	},
});

export type BotPersonaType = ReturnType<typeof BotPersona.create>;

// Экспериментальная фабрика удалена