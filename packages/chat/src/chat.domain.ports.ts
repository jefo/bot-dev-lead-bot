import { createPort } from "@maxdev1/sotajs/lib/di.v2";
import type { PersonaEntityType } from "./persona.entity";
import type { ChatEntityType } from "./chat.entity";
import type { MessageEntityType } from "./message.entity";

// Domain ports (work with domain entities)
export const findPersonaByIdPort =
	createPort<(id: string) => Promise<PersonaEntityType | null>>();
export const savePersonaPort =
	createPort<(persona: PersonaEntityType) => Promise<void>>();

export const findChatByIdPort =
	createPort<(id: string) => Promise<ChatEntityType | null>>();
export const saveChatPort =
	createPort<(chat: ChatEntityType) => Promise<void>>();

export const saveMessagePort =
	createPort<(message: MessageEntityType) => Promise<void>>();
