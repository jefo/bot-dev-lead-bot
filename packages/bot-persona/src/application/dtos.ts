// --- Типы для FSM ---

export type TransitionDto = {
  event: string;
  target: string;
  assign?: Record<string, string>;
};

export type StateDto = {
  id: string;
  on?: TransitionDto[];
};

export type FsmDto = {
  initialState: string;
  states: StateDto[];
};

// --- Типы для ViewMap ---

export type ComponentPropDto = 
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[];

export type ComponentDescriptorDto = {
  id: string; // ID состояния, с которым связан этот компонент
  component: string;
  props?: Record<string, ComponentPropDto>;
};

export type ViewMapDto = {
  nodes: ComponentDescriptorDto[];
};

// --- Типы для FormDefinition ---

export type FormFieldDefinitionDto = {
  id: string;
  type: string; // text, number, boolean, etc.
  label: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
};

export type FormDefinitionDto = {
  fields: FormFieldDefinitionDto[];
};

// --- DTO для команд ---

export type DefineBotPersonaCommand = {
  name: string;
  fsm: unknown; // Валидация будет на уровне домена
  viewMap: unknown;
  formDefinition?: unknown; // Определение формы (опционально)
};

export type StartConversationCommand = {
  botPersonaId: string;
  chatId: string;
};

export type ProcessUserInputCommmand = {
  chatId: string;
  event: string;
  payload?: unknown;
};

// --- DTO для выходных портов ---

export type ComponentRenderDto = {
  chatId: string;
  componentName: string;
  props: Record<string, any>;
};

export type FailureDto = {
  chatId: string;
  reason: string;
  timestamp: Date;
};
