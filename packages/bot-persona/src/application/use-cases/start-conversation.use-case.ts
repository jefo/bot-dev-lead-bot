import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import { Conversation } from "../../domain/conversation/conversation.aggregate";
import { FSM } from "../../domain/bot-persona/fsm.vo";
import { ViewMap } from "../../domain/bot-persona/view-map.vo";
import {
	type StartConversationCommand,
} from "../dtos";
import {
	findBotPersonaByIdPort,
	saveConversationPort,
} from "../../domain/ports";
import { componentRenderOutPort, operationFailedOutPort } from "../ports";

/**
 * Use Case для старта нового диалога.
 */
export async function startConversationUseCase(
	command: StartConversationCommand,
): Promise<void> {
	const { botPersonaId, chatId } = command;

	const findBotPersonaById = usePort(findBotPersonaByIdPort);
	const saveConversation = usePort(saveConversationPort);
	const renderComponent = usePort(componentRenderOutPort);
	const operationFailed = usePort(operationFailedOutPort);

	try {
		const persona = await findBotPersonaById(botPersonaId);
		if (!persona) {
			throw new Error(`BotPersona with id ${botPersonaId} not found.`);
		}

		const fsm = new FSM(persona.state.fsm);
		const viewMap = new ViewMap(persona.state.viewMap);
		const initialStateId = fsm.initialState;

		const conversation = Conversation.create({
			id: randomUUID(),
			botPersonaId,
			chatId,
			status: "active",
			currentStateId: initialStateId,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await saveConversation(conversation);

		const initialNode = viewMap.getNode(initialStateId);
		if (initialNode) {
			await renderComponent({
				chatId,
				componentName: initialNode.component,
				props: initialNode.props ?? {},
			});
		}
	} catch (error: any) {
		await operationFailed({
			chatId,
			reason: `Failed to start conversation: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
