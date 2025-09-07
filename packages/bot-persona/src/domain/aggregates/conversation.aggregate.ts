import { createAggregate } from '@maxdev1/sotajs/lib/aggregate';
import { z } from 'zod';

// --- Схемы для FSM и Графа ---

const FsmStateSchema = z.object({
  on: z.record(z.string()), // on: { EVENT_NAME: 'target_state_id' }
});

const FsmSchema = z.object({
  initialState: z.string(),
  states: z.record(FsmStateSchema),
});

const GraphNodeSchema = z.object({
  component: z.string(),
  props: z.record(z.any()).optional(),
});

const GraphSchema = z.object({
  nodes: z.record(GraphNodeSchema),
});

// --- Схема самого Агрегата ---

const ConversationSchema = z.object({
  id: z.string().uuid(),
  fsm: FsmSchema,
  graph: GraphSchema,
});

export type ConversationState = z.infer<typeof ConversationSchema>;

// --- Агрегат с инвариантами для проверки целостности ---

export const ConversationAggregate = createAggregate({
  name: 'Conversation',
  schema: ConversationSchema,
  actions: {},
  invariants: [
    // 1. Начальное состояние FSM должно существовать в графе
    (state) => {
      if (!state.graph.nodes[state.fsm.initialState]) {
        throw new Error(`FSM's initial state '${state.fsm.initialState}' does not exist in the graph nodes.`);
      }
    },
    // 2. Каждое целевое состояние в переходах FSM должно существовать в графе
    (state) => {
      for (const fsmState of Object.values(state.fsm.states)) {
        for (const targetStateId of Object.values(fsmState.on)) {
          if (!state.graph.nodes[targetStateId]) {
            throw new Error(`FSM transition target state '${targetStateId}' does not exist in the graph nodes.`);
          }
        }
      }
    },
  ],
});
