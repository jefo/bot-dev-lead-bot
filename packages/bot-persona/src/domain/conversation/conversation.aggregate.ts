import { createAggregate } from "@maxdev1/sotajs";
import { z } from "zod";
import { HistoryEntry, HistoryEntrySchema } from "./history-entry.vo";
import type { FSM } from "../bot-persona/fsm.vo";

const ConversationContextSchema = z.record(
	z.union([z.string(), z.number(), z.boolean(), z.object({}).passthrough()]),
);

const ConversationSchema = z.object({
	id: z.string().uuid(),
	botPersonaId: z.string().uuid(),
	chatId: z.string(),
	status: z.enum(["active", "finished", "cancelled"]),
	currentStateId: z.string(),
	context: ConversationContextSchema.default({}),
	history: z.array(HistoryEntrySchema).default([]),
	createdAt: z.date(),
	updatedAt: z.date(),
});

type ConversationState = z.infer<typeof ConversationSchema>;

/**
 * Агрегат Conversation.
 * Ответственность: Управлять жизненным циклом одного живого диалога.
 */
export const Conversation = createAggregate({
	name: "Conversation",
	schema: ConversationSchema,
	invariants: [
		(state) => {
			if (state.status !== "active" && state.history.length === 0) {
				throw new Error("Non-active conversation cannot be empty.");
			}
		},
	],
	actions: {
		/**
		 * Обрабатывает ввод пользователя и производит переход состояния.
		 * @param state - текущее состояние Conversation
		 * @param fsm - VO логики переходов, полученный из агрегата BotPersona
		 * @param event - событие, полученное от пользователя
		 * @param payload - данные, переданные с событием
		 */
		processInput(
			state: ConversationState,
			fsm: FSM,
		event: string,
			payload: unknown,
		) {
			if (state.status !== "active") {
				throw new Error("Cannot process input in a non-active conversation.");
			}

			const transition = fsm.findTransition(state.currentStateId, event);
			if (!transition) {
				// Если переход не найден, состояние не меняется.
				// Use Case должен обработать это, вызвав, например, `invalidInputOutPort`.
				return;
			}

			const previousStateId = state.currentStateId;
			state.currentStateId = transition.target;

			// Обработка `assign` для сохранения данных в контекст
			if (transition.assign) {
				for (const [key, valueExpr] of Object.entries(transition.assign)) {
					// Простой резолвер: 'payload.field' или литерал
					if (
						typeof valueExpr === "string" &&
						valueExpr.startsWith("payload.")
					) {
						const path = valueExpr.substring("payload.".length);
						// @ts-ignore - простая реализация, для сложных случаев нужен lodash.get
						state.context[key] = payload?.[path];
					} else {
						state.context[key] = valueExpr;
					}
				}
			}

			// Добавляем запись в историю
			state.history.push({
				event,
				fromState: previousStateId,
				toState: state.currentStateId,
				timestamp: new Date(),
			});

			state.updatedAt = new Date();
		},

		finish(state: ConversationState) {
			if (state.status !== "active") {
				throw new Error("Only active conversations can be finished.");
			}
			state.status = "finished";
			state.updatedAt = new Date();
		},
	},
});

export type ConversationType = ReturnType<typeof Conversation.create>;
