import { usePort } from "@maxdev1/sotajs/lib/di.v2";
import { randomUUID } from "crypto";
import { ConversationSession } from "../../domain/entities/conversation-session.entity";
import {
	findActiveSessionByPersonaIdPort,
	findBotByIdPort,
	findConversationByIdPort,
	renderComponentOutPort,
	saveSessionPort,
} from "../ports/runtime.ports";
import { ProcessUserInputCommmandSchema, StartConversationCommandSchema } from "../dtos/runtime.dtos";

/**
 * Запускает новую сессию диалога для пользователя.
 */
export async function startConversationUseCase(
	command: unknown,
): Promise<void> {
	const { botId, personaId, chatId } =
		StartConversationCommandSchema.parse(command);

	const findBotById = usePort(findBotByIdPort);
	const findConversationById = usePort(findConversationByIdPort);
	const findActiveSession = usePort(findActiveSessionByPersonaIdPort);
	const saveSession = usePort(saveSessionPort);
	const renderComponent = usePort(renderComponentOutPort);

	// TODO: Добавить логику обработки уже существующей активной сессии

	const bot = await findBotById(botId);
	if (!bot) throw new Error(`Bot with id ${botId} not found.`);

	const conversation = await findConversationById(bot.state.conversationId);
	if (!conversation)
		throw new Error(
			`Conversation with id ${bot.state.conversationId} not found.`,
		);

	const initialState = conversation.state.fsm.initialState;

	const session = ConversationSession.create({
		id: randomUUID(),
		botId,
		conversationId: conversation.state.id,
		personaId,
		chatId,
		status: "active",
		currentStateId: initialState,
		collectedData: {},
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	await saveSession(session);

	const initialNode = conversation.state.graph.nodes[initialState];
	if (initialNode) {
		await renderComponent({
			chatId,
			component: initialNode.component,
			props: initialNode.props,
		});
	}
}

/**
 * Обрабатывает ввод от пользователя и передвигает диалог в следующее состояние.
 */
export async function processUserInputUseCase(command: unknown): Promise<void> {
	const { personaId, userInput } =
		ProcessUserInputCommmandSchema.parse(command);

	const findActiveSession = usePort(findActiveSessionByPersonaIdPort);
	const findConversationById = usePort(findConversationByIdPort);
	const saveSession = usePort(saveSessionPort);
	const renderComponent = usePort(renderComponentOutPort);

	const session = await findActiveSession(personaId);
	if (!session)
		throw new Error(`Active session for persona ${personaId} not found.`);

	const conversation = await findConversationById(session.state.conversationId);
	if (!conversation)
		throw new Error(
			`Conversation with id ${session.state.conversationId} not found.`,
		);

	const currentState =
		conversation.state.fsm.states[session.state.currentStateId];
	if (!currentState)
		throw new Error(`State ${session.state.currentStateId} not found in FSM.`);

	// TODO: Реализовать более сложный маппинг userInput на event FSM
	let event = "";
	if (typeof userInput.value === "string") {
		event = userInput.value;
	} else if (userInput.value && typeof userInput.value === "object" && "data" in userInput.value) {
		event = userInput.value.data as string;
	}
	const nextStateId = currentState.on?.[event];

	if (!nextStateId) {
		console.log(
			`No transition found from ${session.state.currentStateId} with event ${event}`,
		);
		// TODO: Вызвать порт для обработки невалидного ввода
		return;
	}

	const updatedState = session.actions.transitionTo(nextStateId);
	const updatedSession = ConversationSession.create({
		...session.state,
		...updatedState
	});
	// TODO: Добавить логику сохранения данных из userInput в session.collectedData
	await saveSession(updatedSession);

	const nextNode = conversation.state.graph.nodes[nextStateId];
	if (nextNode) {
		await renderComponent({
			chatId: session.state.chatId,
			component: nextNode.component,
			props: nextNode.props,
		});
	}
}
