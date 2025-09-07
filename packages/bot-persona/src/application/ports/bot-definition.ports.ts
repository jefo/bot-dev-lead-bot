import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import type { BotAggregateType } from '../../domain/aggregates/bot.aggregate';
import type { ConversationAggregateType } from '../../domain/aggregates/conversation.aggregate';

export const saveBotPort = createPort<(bot: BotAggregateType) => Promise<void>>();

export const saveConversationPort = createPort<(convo: ConversationAggregateType) => Promise<void>>();
