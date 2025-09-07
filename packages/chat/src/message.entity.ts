import { createEntity } from "@maxdev1/sotajs/lib/entity";
import { z } from "zod";

// Message Entity
const MessageSchema = z.object({
	id: z.string().uuid(), // ID самого сообщения может остаться UUID
	chatId: z.string().min(1),
	senderId: z.string().min(1),
	content: z.string().min(1),
	timestamp: z.date(),
});

type MessageProps = z.infer<typeof MessageSchema>;

export const Message = createEntity({
	schema: MessageSchema,
	actions: {
		editContent: (state: MessageProps, newContent: string) => {
			return { ...state, content: newContent };
		},

		delete: (state: MessageProps) => {
			return { ...state, content: "[deleted]" };
		},
	},
});

export type MessageEntityType = ReturnType<typeof Message.create>;
