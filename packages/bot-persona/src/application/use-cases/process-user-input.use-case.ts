import { usePort } from "@maxdev1/sotajs";
import { FSM } from "../../domain/bot-persona/fsm.vo";
import { ViewMap } from "../../domain/bot-persona/view-map.vo";
import {
	type ProcessUserInputCommmand,
} from "../dtos";
import {
	findActiveConversationByChatIdPort,
	findBotPersonaByIdPort,
	saveConversationPort,
} from "../../domain/ports";
import {
	componentRenderOutPort,
	invalidInputOutPort,
	conversationFinishedOutPort,
	operationFailedOutPort,
} from "../ports";

/**
 * Use Case для обработки ввода пользователя и продвижения диалога.
 */
export async function processUserInputUseCase(
	command: ProcessUserInputCommmand,
): Promise<void> {
	const { chatId, event, payload } = command;

	// Получение всех зависимостей через порты
	const findConversation = usePort(findActiveConversationByChatIdPort);
	const findBotPersona = usePort(findBotPersonaByIdPort);
	const saveConversation = usePort(saveConversationPort);
	const renderComponent = usePort(componentRenderOutPort);
	const invalidInput = usePort(invalidInputOutPort);
	const conversationFinished = usePort(conversationFinishedOutPort);
	const operationFailed = usePort(operationFailedOutPort);

	try {
		const conversation = await findConversation(chatId);
		if (!conversation) {
			throw new Error(`Active conversation for chat ${chatId} not found.`);
		}

		const persona = await findBotPersona(conversation.state.botPersonaId);
		if (!persona) {
			throw new Error(
				`BotPersona with id ${conversation.state.botPersonaId} not found.`,
			);
		}

		const fsm = new FSM(persona.state.fsm);
		const viewMap = new ViewMap(persona.state.viewMap);
		const currentStateIdBefore = conversation.state.currentStateId;

		// Вызов доменной логики
		conversation.actions.processInput(fsm, event, payload);

		await saveConversation(conversation);

		const currentStateIdAfter = conversation.state.currentStateId;

		// Логика после изменения состояния
		if (currentStateIdBefore === currentStateIdAfter) {
			// Состояние не изменилось, значит, ввод был невалидным
			await invalidInput({
				chatId,
				reason: `Invalid event '${event}' in state '${currentStateIdBefore}'`,
				timestamp: new Date(),
			});
			return;
		}

		const nextNode = viewMap.getNode(currentStateIdAfter);
		if (!nextNode) {
			throw new Error(
				`ViewMap node for state '${currentStateIdAfter}' not found.`,
			);
		}

		// Проверяем, является ли новое состояние конечным (нет доступных переходов)
		const isFinalState =
			(fsm.getState(currentStateIdAfter)?.on ?? []).length === 0;
		if (isFinalState) {
			conversation.actions.finish();
			await saveConversation(conversation);
			await conversationFinished({ chatId });
		}

		// Рендерим компонент для нового состояния
		await renderComponent({
			chatId,
			componentName: nextNode.component,
			// TODO: Реализовать резолвинг пропсов из контекста
			props: nextNode.props ?? {},
		});
	} catch (error: any) {
		await operationFailed({
			chatId,
			reason: `Failed to process user input: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
