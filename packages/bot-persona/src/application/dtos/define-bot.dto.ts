import { z } from 'zod';

// DTO для команды на определение нового бота
// Разделяем FSM и ViewModel для удобства API

// Схема для FSM определения
const FsmDefinitionSchema = z.object({
  initialState: z.string(),
  states: z.record(z.string(), z.object({
    on: z.record(z.string(), z.string()).optional(),
  })),
});

// Схема для ViewModel определения
const ViewModelDefinitionSchema = z.object({
  nodes: z.record(z.string(), z.object({
    component: z.string(),
    props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.object({}).passthrough()])).optional(),
  })),
});

export const DefineBotCommandSchema = z.object({
  botName: z.string().min(1),
  fsmDefinition: FsmDefinitionSchema,
  viewModelDefinition: ViewModelDefinitionSchema,
});

export type DefineBotCommand = z.infer<typeof DefineBotCommandSchema>;
