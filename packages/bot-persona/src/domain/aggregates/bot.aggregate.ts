import { createEntity } from "@maxdev1/sotajs/lib/entity";
import { z } from "zod";

const BotSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1),
	// Ссылка на агрегат, который хранит логику поведения этого бота
	conversationId: z.string().uuid(),
});

export const BotAggregate = createEntity({
	schema: BotSchema,
	actions: {
		rename(state, newName: string) {
			return { ...state, name: newName };
		},
	},
});

export type BotAggregateType = ReturnType<typeof BotAggregate.create>;
