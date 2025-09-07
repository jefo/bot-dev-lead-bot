import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import type { BotAggregate } from '../domain/aggregates/bot.aggregate';
import type { ConversationAggregate } from '../domain/aggregates/conversation.aggregate';
import type { ConversationSession } from '../domain/entities/conversation-session.entity';

// --- Порты для доступа к данным ---

export const findBotByIdPort = createPort<(id: string) => Promise<InstanceType<typeof BotAggregate> | null>>();

export const findConversationByIdPort = createPort<(id: string) => Promise<InstanceType<typeof ConversationAggregate> | null>>();

export const findActiveSessionByPersonaIdPort = createPort<(personaId: string) => Promise<InstanceType<typeof ConversationSession> | null>>();

export const saveSessionPort = createPort<(session: InstanceType<typeof ConversationSession>) => Promise<void>>();


// --- Порты вывода (инфраструктура) ---

export const renderComponentOutPort = createPort<(
  dto: { 
    chatId: string, 
    component: string, 
    props?: Record<string, any> 
  }
) => Promise<void>>();
