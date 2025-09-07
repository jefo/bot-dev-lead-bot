import { usePort } from '@maxdev1/sotajs/lib/di.v2';
import { randomUUID } from 'crypto';
import { ConversationSession } from '../../domain/entities/conversation-session.entity';
import { ProcessUserInputCommmand, ProcessUserInputCommmandSchema, StartConversationCommand, StartConversationCommandSchema } from '../dtos/runtime.dtos';
import { findActiveSessionByPersonaIdPort, findBotByIdPort, findConversationByIdPort, renderComponentOutPort, saveSessionPort } from '../ports/runtime.ports';

/**
 * Запускает новую сессию диалога для пользователя.
 */
export async function startConversationUseCase(command: unknown): Promise<void> {
  const { botId, personaId, chatId } = StartConversationCommandSchema.parse(command);

  const findBotById = usePort(findBotByIdPort);
  const findConversationById = usePort(findConversationByIdPort);
  const findActiveSession = usePort(findActiveSessionByPersonaIdPort);
  const saveSession = usePort(saveSessionPort);
  const renderComponent = usePort(renderComponentOutPort);

  // TODO: Добавить логику обработки уже существующей активной сессии

  const bot = await findBotById(botId);
  if (!bot) throw new Error(`Bot with id ${botId} not found.`);

  const conversation = await findConversationById(bot.state.conversationId);
  if (!conversation) throw new Error(`Conversation with id ${bot.state.conversationId} not found.`);

  const initialState = conversation.state.fsm.initialState;

  const session = ConversationSession.create({
    id: randomUUID(),
    botId,
    conversationId: conversation.id,
    personaId,
    chatId,
    status: 'active',
    currentStateId: initialState,
    collectedData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await saveSession(session);

  const initialNode = conversation.state.graph.nodes[initialState];
  await renderComponent({
    chatId,
    component: initialNode.component,
    props: initialNode.props,
  });
}

/**
 * Обрабатывает ввод от пользователя и передвигает диалог в следующее состояние.
 */
export async function processUserInputUseCase(command: unknown): Promise<void> {
  const { personaId, userInput } = ProcessUserInputCommmandSchema.parse(command);

  const findActiveSession = usePort(findActiveSessionByPersonaIdPort);
  const findConversationById = usePort(findConversationByIdPort);
  const saveSession = usePort(saveSessionPort);
  const renderComponent = usePort(renderComponentOutPort);

  const session = await findActiveSession(personaId);
  if (!session) throw new Error(`Active session for persona ${personaId} not found.`);

  const conversation = await findConversationById(session.state.conversationId);
  if (!conversation) throw new Error(`Conversation with id ${session.state.conversationId} not found.`);

  const currentState = conversation.state.fsm.states[session.state.currentStateId];
  if (!currentState) throw new Error(`State ${session.state.currentStateId} not found in FSM.`);

  // TODO: Реализовать более сложный маппинг userInput на event FSM
  const event = userInput.value.toString();
  const nextStateId = currentState.on[event];

  if (!nextStateId) {
    console.log(`No transition found from ${session.state.currentStateId} with event ${event}`);
    // TODO: Вызвать порт для обработки невалидного ввода
    return;
  }

  session.actions.transitionTo(nextStateId);
  // TODO: Добавить логику сохранения данных из userInput в session.collectedData
  await saveSession(session);

  const nextNode = conversation.state.graph.nodes[nextStateId];
  await renderComponent({
    chatId: session.state.chatId,
    component: nextNode.component,
    props: nextNode.props,
  });
}
