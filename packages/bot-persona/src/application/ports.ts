import { createPort } from "@maxdev1/sotajs/lib/di.v2";
import type { BotPersonaType } from "../domain/bot-persona/bot-persona.aggregate";
import type { ConversationType } from "../domain/conversation/conversation.aggregate";
import type { ComponentRenderDto, FailureDto } from "./dtos";

// --- Порты Данных (Data Ports) ---

// BotPersona
export const saveBotPersonaPort = createPort<(persona: BotPersonaType) => Promise<void>>();
export const findBotPersonaByIdPort = createPort<(id: string) => Promise<BotPersonaType | null>>();

// Conversation
export const saveConversationPort = createPort<(conversation: ConversationType) => Promise<void>>();
export const findActiveConversationByChatIdPort = createPort<(chatId: string) => Promise<ConversationType | null>>();


// --- Выходные Порты (Output Ports) ---

export const componentRenderOutPort = createPort<(dto: ComponentRenderDto) => Promise<void>>();
export const conversationFinishedOutPort = createPort<(dto: { chatId: string }) => Promise<void>>();
export const invalidInputOutPort = createPort<(dto: FailureDto) => Promise<void>>();
export const conversationNotFoundOutPort = createPort<(dto: FailureDto) => Promise<void>>();
export const operationFailedOutPort = createPort<(dto: FailureDto) => Promise<void>>();
