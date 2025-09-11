import { createPort } from "@maxdev1/sotajs";
import type { BotPersonaType } from "./bot-persona/bot-persona.aggregate";
import type { ConversationType } from "./conversation/conversation.aggregate";
import type { FormEntityType } from "./conversation/form.entity";

// --- Порты Данных (Data Ports) ---
// Определяются в домене, так как они являются частью контракта доменных объектов (способность к персистенции).

// BotPersona
export const saveBotPersonaPort =
	createPort<(persona: BotPersonaType) => Promise<void>>();
export const findBotPersonaByIdPort =
	createPort<(id: string) => Promise<BotPersonaType | null>>();

// Conversation
export const saveConversationPort =
	createPort<(conversation: ConversationType) => Promise<void>>();
export const findActiveConversationByChatIdPort =
	createPort<(chatId: string) => Promise<ConversationType | null>>();

// Conversation Model
export const saveConversationModelPort =
	createPort<(model: FormEntityType) => Promise<void>>();
export const findConversationModelByIdPort =
	createPort<(id: string) => Promise<FormEntityType | null>>();
