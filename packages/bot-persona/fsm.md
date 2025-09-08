1. Требования к агрегату Conversation

Хранимые данные

id: UUID.

fsm: описание состояний, переходов, начального состояния.

graph: визуальные ноды (связанные со состояниями).

currentState: текущее состояние FSM.

Инварианты

Начальное состояние FSM существует в graph.

Все состояния FSM связаны с нодами в graph.

Все цели переходов (target) указывают на реальные состояния.

currentState всегда указывает на одно из состояний FSM.

Поведение

start() → переводит агрегат в начальное состояние.

transition(event: string, context?: Record<string, any>):

проверяет, допустим ли переход из текущего состояния по событию,

применяет assign (если есть),

меняет currentState,

возвращает новую ноду графа (для UI).

В будущем можно расширить: гварды, эффекты, side effects — но пока YAGNI.

2. Имплементация
import { createAggregate } from "@maxdev1/sotajs/lib/aggregate";
import { z } from "zod";

// --- FSM ---

const TransitionSchema = z.object({
  target: z.string(),
  assign: z.record(z.string()).optional(),
});

const StateSchema = z.object({
  on: z.record(z.string(), TransitionSchema),
});

const FsmSchema = z.object({
  initial: z.string(),
  states: z.record(z.string(), StateSchema),
});

// --- Graph ---

const GraphNodeSchema = z.object({
  component: z.string(),
  props: z.record(z.string(), z.any()).optional(),
});

const GraphSchema = z.object({
  nodes: z.record(z.string(), GraphNodeSchema),
});

// --- Aggregate Schema ---

const ConversationSchema = z.object({
  id: z.string().uuid(),
  fsm: FsmSchema,
  graph: GraphSchema,
  currentState: z.string().optional(), // динамическое состояние
});

// --- Domain Aggregate ---

export const ConversationAggregate = createAggregate({
  name: "Conversation",
  schema: ConversationSchema,
  actions: {
    start(state) {
      state.currentState = state.fsm.initial;
      return state;
    },
    transition(state, event: string, context: Record<string, any> = {}) {
      if (!state.currentState) {
        throw new Error("Conversation not started. Call start() first.");
      }

      const fsmState = state.fsm.states[state.currentState];
      if (!fsmState) {
        throw new Error(`Unknown current state '${state.currentState}'`);
      }

      const transition = fsmState.on[event];
      if (!transition) {
        throw new Error(`No transition defined from '${state.currentState}' on event '${event}'`);
      }

      // apply assign if exists
      if (transition.assign) {
        for (const [key, valueExpr] of Object.entries(transition.assign)) {
          context[key] = valueExpr;
          // NB: тут можно потом прикрутить expression-eval или path resolver
        }
      }

      // move to next state
      state.currentState = transition.target;

      // return новый граф-ноду (для UI)
      return state.graph.nodes[state.currentState];
    },
  },
  invariants: [
    // initial state должен существовать в Graph
    (state) => {
      if (!state.graph.nodes[state.fsm.initial]) {
        throw new Error(`Initial state '${state.fsm.initial}' not found in graph`);
      }
    },
    // все состояния FSM должны быть в Graph
    (state) => {
      for (const stateId of Object.keys(state.fsm.states)) {
        if (!state.graph.nodes[stateId]) {
          throw new Error(`FSM state '${stateId}' not linked to graph`);
        }
      }
    },
    // все переходы валидны
    (state) => {
      for (const [stateId, fsmState] of Object.entries(state.fsm.states)) {
        for (const [event, transition] of Object.entries(fsmState.on)) {
          if (!state.graph.nodes[transition.target]) {
            throw new Error(
              `Transition from '${stateId}' on '${event}' points to unknown state '${transition.target}'`,
            );
          }
        }
      }
    },
    // currentState (если задан) должен быть валиден
    (state) => {
      if (state.currentState && !state.fsm.states[state.currentState]) {
        throw new Error(`Invalid currentState '${state.currentState}'`);
      }
    },
  ],
});

export type Conversation = ReturnType<typeof ConversationAggregate.create>;

3. Как работает
const convo = ConversationAggregate.create({
  id: crypto.randomUUID(),
  fsm: {
    initial: "welcome",
    states: {
      welcome: { on: { NEXT: { target: "askName" } } },
      askName: { on: { SUBMIT: { target: "summary", assign: { name: "userInput" } } } },
      summary: { on: {} },
    },
  },
  graph: {
    nodes: {
      welcome: { component: "WelcomeScreen" },
      askName: { component: "NameInput" },
      summary: { component: "SummaryScreen" },
    },
  },
});

// Стартуем
ConversationAggregate.actions.start(convo);

// Двигаемся
const node1 = ConversationAggregate.actions.transition(convo, "NEXT");
// => вернет GraphNode "NameInput"

const node2 = ConversationAggregate.actions.transition(convo, "SUBMIT", { userInput: "Alice" });
// => вернет GraphNode "SummaryScreen"


📌 Таким образом, у нас:

богатый домен с поведением,

чистый FSM-движок внутри агрегата,

при этом минимум лишних фич (YAGNI).
