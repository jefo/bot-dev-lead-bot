import { usePort } from "@maxdev1/sotajs/lib/di.v2";
import { randomUUID } from "crypto";
import { BotAggregate } from "../../domain/aggregates/bot.aggregate";
import { ConversationAggregate } from "../../domain/aggregates/conversation.aggregate";
import { DefineBotCommandSchema } from "../dtos/define-bot.dto";
import {
	saveBotPort,
	saveConversationPort,
} from "../ports/bot-definition.ports";

/**
 * Use Case для определения нового бота и его логики.
 */
export async function defineBotUseCase(
	command: unknown,
): Promise<{ botId: string }> {
	// 1. Валидация базовой структуры команды
	const { botName, fsmDefinition, viewModelDefinition } =
		DefineBotCommandSchema.parse(command);

	// 2. Получение зависимостей
	const saveBot = usePort(saveBotPort);
	const saveConversation = usePort(saveConversationPort);

	// 3. Создание агрегата ConversationAggregate
	// При создании будут автоматически проверены инварианты (целостность FSM и графа)
	const conversation = ConversationAggregate.create({
		id: randomUUID(),
		fsm: fsmDefinition,
		graph: viewModelDefinition,
	});

	// 4. Сохранение ConversationAggregate
	await saveConversation(conversation);

	// 5. Создание агрегата BotAggregate
	const bot = BotAggregate.create({
		id: randomUUID(),
		name: botName,
		conversationId: conversation.id,
	});

	// 6. Сохранение BotAggregate
	await saveBot(bot);

	// 7. Возвращаем ID созданного бота
	return { botId: bot.id };
}
