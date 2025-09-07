import { createEntity } from "@maxdev1/sotajs/lib/entity";
import { z } from "zod";

const SessionStatusSchema = z.enum(["active", "finished", "error"]);

const ConversationSessionSchema = z.object({
	id: z.string().uuid(),
	botId: z.string().uuid(),
	conversationId: z.string().uuid(),

	personaId: z.string().min(1),
	chatId: z.string().min(1),

	status: SessionStatusSchema,
	currentStateId: z.string(),
	collectedData: z.record(z.any()), // Объект для сбора данных от пользователя

	createdAt: z.date(),
	updatedAt: z.date(),
});

export type ConversationSessionState = z.infer<
	typeof ConversationSessionSchema
>;

export const ConversationSession = createEntity({
	schema: ConversationSessionSchema,
	actions: {
		transitionTo(
			state: ConversationSessionState,
			newStateId: string,
		): ConversationSessionState {
			if (state.status !== "active")
				throw new Error("Cannot transition in a non-active session.");
			return { ...state, currentStateId: newStateId, updatedAt: new Date() };
		},
		updateData(
			state: ConversationSessionState,
			dataToMerge: Record<string, any>,
		): ConversationSessionState {
			return {
				...state,
				collectedData: { ...state.collectedData, ...dataToMerge },
				updatedAt: new Date(),
			};
		},
		finish(state: ConversationSessionState): ConversationSessionState {
			return { ...state, status: "finished", updatedAt: new Date() };
		},
		setError(state: ConversationSessionState): ConversationSessionState {
			return { ...state, status: "error", updatedAt: new Date() };
		},
	},
});

export type ConversationSessionType = ReturnType<
	typeof ConversationSession.create
>;
