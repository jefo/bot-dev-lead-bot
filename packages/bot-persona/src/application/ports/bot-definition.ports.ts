import { createPort } from '@maxdev1/sotajs/lib/di.v2';
import type { BotAggregate } from '../domain/aggregates/bot.aggregate';
import type { ConversationAggregate } from '../domain/aggregates/conversation.aggregate';

export const saveBotPort = createPort<(bot: InstanceType<typeof BotAggregate>) => Promise<void>>();

export const saveConversationPort = createPort<(convo: InstanceType<typeof ConversationAggregate>) => Promise<void>>();
