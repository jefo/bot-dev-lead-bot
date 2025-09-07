import { createPort } from "@maxdev1/sotajs/lib/di.v2";
import type { BotAggregateType } from "../../domain/aggregates/bot.aggregate";
import type { ConversationAggregateType } from "../../domain/aggregates/conversation.aggregate";
import type { ConversationSessionType } from "../../domain/entities/conversation-session.entity";

// --- Порты для доступа к данным ---

export const findBotByIdPort =
	createPort<(id: string) => Promise<BotAggregateType | null>>();

export const findConversationByIdPort =
	createPort<(id: string) => Promise<ConversationAggregateType | null>>();

export const findActiveSessionByPersonaIdPort =
	createPort<(personaId: string) => Promise<ConversationSessionType | null>>();

export const saveSessionPort =
	createPort<(session: ConversationSessionType) => Promise<void>>();

// --- Порты вывода (инфраструктура) ---

export const renderComponentOutPort =
	createPort<
		(dto: {
			chatId: string;
			component: string;
			props?: Record<string, any>;
		}) => Promise<void>
	>();
