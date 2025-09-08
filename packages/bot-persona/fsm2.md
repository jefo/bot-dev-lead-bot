Требования (функциональные + нефункциональные)

Ядро домена — FSM как Value Object

FSM должен содержать набор состояний (id), переходов (событие → target), начальное состояние.

Переходы могут содержать декларативные assign операции (маппинг ключей в context агрегата).

FSM должен предоставлять безопасные методы canTransition(currentState, event), nextState(currentState, event).

Агрегат Conversation

Хранит: id, participants, fsm (VO), viewMap (graph/mapper), context (ключ-значение для runtime-данных), currentState, history (список domain events / audit).

Все изменения состояния (переходы) должны проходить через доменные методы агрегата (например applyEvent(eventName, payload?)).

Доменные методы должны проверять инварианты и выбрасывать объясняющие ошибки при нарушении.

View mapping (Graph)

Отдельная декларация viewMap, сопоставляющая stateId → ComponentDescriptor (component name + props шаблон).

Conversation должен уметь возвращать ComponentDescriptor для текущего состояния.

Валидация и инварианты

FSM: initialState присутствует в states; все transition.target существуют в states.

For each FSM state there must be a view node with the same id (cross-context invariant) — configurable (можно включать/выключать).

Типизация должна быть строгой (event names, state ids — строки, assign — мапа string→string или string→expression).

Расширяемость

Возможность подключать side-effects (подписчики) на StateChanged события извне (event bus на уровне приложения).

Лёгкая сериализация / десериализация агрегата.

Транзакционность / Audit

Каждое изменение должно логироваться в history с таймстампом, пред/после состоянием и причиной.

Простота интеграции

Использовать zod для валидации входящих payload-ов и схему, совместимую с createAggregate (ваша библиотека).

Реализация (TypeScript)

Ниже — полный файл conversation.aggregate.ts. Рефакторный, с комментариями. С учетом вашей библиотеки createAggregate и zod.

// conversation.aggregate.ts
import { createAggregate } from "@maxdev1/sotajs/lib/aggregate";
import { z } from "zod";

/*
  Domain types:
  - StateId = string
  - EventName = string
  - Assign = Record<string, string>  // декларатив: ключ -> выражение/путь (можно потом интерпретировать)
*/

// -------------------- Zod схемы для сериализации/валидации --------------------

const TransitionSchema = z.object({
  event: z.string(), // e.g. "CLICK_NEXT"
  target: z.string(), // stateId
  // optional declaration that says how to map incoming payload to context keys
  assign: z.record(z.string(), z.string()).optional(),
});

const StateSchema = z.object({
  id: z.string(),
  meta: z.record(z.any()).optional(),
  on: z.array(TransitionSchema).optional(), // list of possible transitions from this state
});

const FsmSchema = z.object({
  initialState: z.string(),
  states: z.array(StateSchema),
});

const ComponentDescriptorSchema = z.object({
  id: z.string(), // node id (should match state id)
  component: z.string(),
  // props can be static values or templated values (strings) which the runtime will resolve from context
  props: z.record(z.union([z.string(), z.number(), z.boolean(), z.object({}).passthrough()])).optional(),
  meta: z.record(z.any()).optional(),
});

const ViewMapSchema = z.object({
  nodes: z.array(ComponentDescriptorSchema),
});

// Conversation schema for aggregate storage
const ConversationSchema = z.object({
  id: z.string().uuid(),
  participants: z.array(z.string()).optional(),
  // store FSM and viewMap as JSON blobs, but validated
  fsm: FsmSchema,
  viewMap: ViewMapSchema,
  context: z.record(z.any()).optional(), // runtime data for assign/props
  currentState: z.string().optional(),
  history: z.array(z.object({
    id: z.string(),
    kind: z.string(),
    payload: z.any().optional(),
    timestamp: z.string(),
  })).optional(),
});

// -------------------- Value Object: FSM (pure domain logic) --------------------

export type StateId = string;
export type EventName = string;

export class FSM {
  readonly initialState: StateId;
  readonly statesById: Map<StateId, z.infer<typeof StateSchema>>;

  constructor(fsmObj: z.infer<typeof FsmSchema>) {
    this.initialState = fsmObj.initialState;
    this.statesById = new Map();
    for (const s of fsmObj.states) {
      if (this.statesById.has(s.id)) {
        throw new Error(`Duplicate state id in FSM: ${s.id}`);
      }
      this.statesById.set(s.id, s);
    }
    // invariants: initialState exists
    if (!this.statesById.has(this.initialState)) {
      throw new Error(`FSM invariant: initialState '${this.initialState}' not found among states`);
    }
    // invariants: all transition targets exist
    for (const s of this.statesById.values()) {
      const transitions = s.on ?? [];
      for (const t of transitions) {
        if (!this.statesById.has(t.target)) {
          throw new Error(`FSM invariant: transition target '${t.target}' from state '${s.id}' not found`);
        }
      }
    }
  }

  getState(stateId: StateId) {
    return this.statesById.get(stateId) ?? null;
  }

  // returns the transition record if allowed, else null
  findTransition(fromState: StateId, event: EventName) {
    const s = this.statesById.get(fromState);
    if (!s || !s.on) return null;
    return s.on.find((t) => t.event === event) ?? null;
  }

  canTransition(fromState: StateId | null, event: EventName) : boolean {
    const stateToCheck = fromState ?? this.initialState;
    return !!this.findTransition(stateToCheck, event);
  }

  nextState(fromState: StateId | null, event: EventName) : { target: StateId, assign?: Record<string,string> } | null {
    const stateToCheck = fromState ?? this.initialState;
    const t = this.findTransition(stateToCheck, event);
    if (!t) return null;
    return { target: t.target, assign: t.assign };
  }

  // serialization helper
  toJSON(): z.infer<typeof FsmSchema> {
    return {
      initialState: this.initialState,
      states: Array.from(this.statesById.values()),
    };
  }
}

// -------------------- Helpers for ViewMap --------------------

export function viewNodeMapFrom(viewMap: z.infer<typeof ViewMapSchema>) {
  const m = new Map<string, z.infer<typeof ComponentDescriptorSchema>>();
  for (const n of viewMap.nodes) {
    if (m.has(n.id)) throw new Error(`Duplicate view node id: ${n.id}`);
    m.set(n.id, n);
  }
  return m;
}

// -------------------- Aggregat: Conversation --------------------

export const ConversationAggregate = createAggregate({
  name: "Conversation",
  schema: ConversationSchema,
  actions: {
    // actions are optional helpers for the aggregate store layer; domain methods are below
  },
  invariants: [
    // 1. FSM valid (constructor validation will handle most; but we also assert initialState exists in FSM)
    (raw) => {
      // validate fsm using zod to keep consistent error messages
      FsmSchema.parse(raw.fsm);
      // FSM class will do deeper checks on construction; try-catch to throw friendly error
      try {
        new FSM(raw.fsm);
      } catch (e: any) {
        throw new Error(`FSM invariant failed: ${e.message}`);
      }
    },
    // 2. viewMap valid
    (raw) => {
      ViewMapSchema.parse(raw.viewMap);
      // cross-check: every state of FSM must have a node in viewMap
      const fsmStates = raw.fsm.states.map((s: any) => s.id);
      const nodeIds = new Set(raw.viewMap.nodes.map((n: any) => n.id));
      for (const sid of fsmStates) {
        if (!nodeIds.has(sid)) {
          throw new Error(`Cross-context invariant: viewMap node for state '${sid}' is missing.`);
        }
      }
    },
    // 3. currentState must be valid (if present)
    (raw) => {
      if (raw.currentState && !raw.fsm.states.some((s: any) => s.id === raw.currentState)) {
        throw new Error(`currentState '${raw.currentState}' not found in FSM states`);
      }
    },
  ],
});

// Enhance aggregate instance with domain methods (factory wrapper).
export type ConversationInstance = ReturnType<typeof ConversationAggregate.create>;

export function ConversationDomainFactory(raw: z.infer<typeof ConversationSchema>): ConversationInstance & {
  // domain methods:
  applyEvent: (eventName: EventName, payload?: Record<string, any>, meta?: Record<string, any>) => void,
  canTransition: (eventName: EventName) => boolean,
  getCurrentComponent: () => z.infer<typeof ComponentDescriptorSchema>,
  getContext: () => Record<string, any>,
  toSnapshot: () => any,
} {
  // validate raw
  ConversationSchema.parse(raw);

  // instantiate aggregate (this returns the library-specific wrapper)
  const agg = ConversationAggregate.create(raw);

  // compose domain-level VO
  const fsmVo = new FSM(raw.fsm);
  const viewMap = viewNodeMapFrom(raw.viewMap);

  // ensure currentState exists or set to initialState lazily
  if (!agg.currentState) {
    agg.currentState = fsmVo.initialState;
    agg.history = agg.history ?? [];
    agg.history.push({
      id: `evt-init-${Date.now()}`,
      kind: "ConversationInitialized",
      payload: { state: agg.currentState },
      timestamp: new Date().toISOString(),
    });
  }

  // domain method: applyEvent
  function applyEvent(eventName: EventName, payload?: Record<string, any>, meta?: Record<string, any>) {
    const fromState = agg.currentState ?? fsmVo.initialState;
    const transition = fsmVo.nextState(fromState, eventName);
    if (!transition) {
      throw new Error(`Transition not allowed from '${fromState}' on event '${eventName}'`);
    }
    // apply assign to context (simple strategy: assign values from payload by key path strings or literals)
    agg.context = agg.context ?? {};
    if (transition.assign) {
      for (const [k, expr] of Object.entries(transition.assign)) {
        // Very simple resolver:
        // if expr starts with "payload." we read from payload, else set literal string
        if (typeof expr === "string" && expr.startsWith("payload.")) {
          const path = expr.slice("payload.".length).split(".");
          let val: any = payload;
          for (const p of path) {
            if (val == null) { val = undefined; break; }
            val = val[p];
          }
          agg.context[k] = val;
        } else if (typeof expr === "string" && expr.startsWith("context.")) {
          const path = expr.slice("context.".length).split(".");
          let val: any = agg.context;
          for (const p of path) {
            if (val == null) { val = undefined; break; }
            val = val[p];
          }
          agg.context[k] = val;
        } else {
          // literal value
          agg.context[k] = expr;
        }
      }
    }

    const prevState = agg.currentState;
    agg.currentState = transition.target;

    // write history
    agg.history = agg.history ?? [];
    agg.history.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      kind: "StateChanged",
      payload: {
        from: prevState,
        to: agg.currentState,
        event: eventName,
        assign: transition.assign ?? null,
        payload,
        meta,
      },
      timestamp: new Date().toISOString(),
    });

    // Return domain event object, so application layer can publish side-effects
    return {
      type: "StateChanged",
      from: prevState,
      to: agg.currentState,
      event: eventName,
      assign: transition.assign ?? null,
      payload,
      meta,
      contextSnapshot: { ...agg.context },
    };
  }

  function canTransition(eventName: EventName) {
    const fromState = agg.currentState ?? fsmVo.initialState;
    return fsmVo.canTransition(fromState, eventName);
  }

  function getCurrentComponent() {
    const node = viewMap.get(agg.currentState!);
    if (!node) throw new Error(`No view node for current state '${agg.currentState}'`);
    // shallow resolve props templates from context (strings like "{{context.userName}}") - keep simple
    const resolvedProps: any = {};
    if (node.props) {
      for (const [k, v] of Object.entries(node.props)) {
        if (typeof v === "string" && v.startsWith("context.")) {
          const path = v.slice("context.".length).split(".");
          let val: any = agg.context ?? {};
          for (const p of path) { val = val?.[p]; if (val === undefined) break; }
          resolvedProps[k] = val;
        } else {
          resolvedProps[k] = v;
        }
      }
    }
    return { ...node, props: resolvedProps };
  }

  function getContext() {
    return agg.context ?? {};
  }

  function toSnapshot() {
    // return serializable snapshot of aggregate
    return {
      id: agg.id,
      participants: agg.participants,
      fsm: fsmVo.toJSON(),
      viewMap: { nodes: Array.from(viewMap.values()) },
      context: agg.context,
      currentState: agg.currentState,
      history: agg.history,
    };
  }

  // attach domain methods to aggregate instance (we return merged object)
  return Object.assign(agg, {
    applyEvent,
    canTransition,
    getCurrentComponent,
    getContext,
    toSnapshot,
  });
}

Ключевые решения и пояснения

FSM как VO (класс FSM) — это важно: бизнес-логика переходов изолирована, проверяется при создании и может быть переиспользована в тестах отдельно от агрегата и представления.

Transitions как массив с event и target — это устраняет неоднозначности (z.record ранее терял ключи событий). Теперь событие — явное поле event, а порядок/множественные варианты читаются естественно.

ViewMap как массив нодов — явные id позволяют легко делать cross-check и миграции; вы также сможете расширить component до имени фабрики/импорта.

assign декларативен, но прост — выражения вида payload.foo или context.bar применяются прямо при транзиции. Если вам нужно более мощное вычисление, можно подключить движок выражений (e.g. jsonata / jexl) позже.

История — простой журнал history в агрегате; при желании можно заменить event sourcing-слоем и хранить события в отдельной store.

Cross-context invariant — мы проверяем, что для каждого состояния FSM есть node в viewMap. Если хотите — можно сделать это опциональным (если UI не требует отображения для некоторых внутренних состояний).

Сериализация — toSnapshot() возвращает удобный JSON для записи в БД.

Пример использования
import { ConversationDomainFactory } from "./conversation.aggregate";

const raw = {
  id: "11111111-1111-1111-1111-111111111111",
  participants: ["user:1"],
  fsm: {
    initialState: "start",
    states: [
      { id: "start", on: [{ event: "NEXT", target: "askName", assign: { tmp: "literal" } }] },
      { id: "askName", on: [{ event: "SUBMIT", target: "done", assign: { userName: "payload.name" } }] },
      { id: "done", on: [] },
    ],
  },
  viewMap: {
    nodes: [
      { id: "start", component: "Welcome" },
      { id: "askName", component: "AskName", props: { label: "context.label" } },
      { id: "done", component: "Summary" },
    ],
  },
  context: { label: "Введите имя" }
};

const conv = ConversationDomainFactory(raw);

// initial state set automatically
console.log(conv.currentState); // "start"
console.log(conv.getCurrentComponent()); // node for 'start'

const evt = conv.applyEvent("NEXT");
console.log(evt.to, conv.currentState); // askName

conv.applyEvent("SUBMIT", { name: "Ivan" });
console.log(conv.getContext()); // { label: "Введите имя", tmp: "literal", userName: "Ivan" }

console.log(conv.getCurrentComponent()); // resolved props, component = AskName for askName or Summary after done

Миграция со старой реализации

Если у вас сейчас FSM хранится как record (ключи событий в on: { EVENT: { target }}), напишите маленькую миграционную функцию, которая превратит это в массив переходов: для каждого on ключа сформировать { event: key, target: value.target, assign: value.assign }.
