# Механизм взаимодействия компонентов ввода/вывода для BotPersona SDK

## 1. Обзор архитектуры

### 1.1 Основные сущности
```
[BotPersona] 
    ↓
[ComponentSystem] ←→ [ComponentRegistry]
    ↓                      ↑
[ComponentRenderer] → [PlatformAdapter]
    ↓                      ↑
[UserInteraction] ←→ [EventManager]
```

### 1.2 Поток данных
1. **BotPersona** определяет компоненты в ViewMap
2. **ComponentSystem** создает и управляет компонентами
3. **ComponentRenderer** отрисовывает компоненты через PlatformAdapter
4. **User** взаимодействует с компонентами
5. **EventManager** обрабатывает события и передает их в Use Cases

## 2. Детальная архитектура компонентов

### 2.1 Базовый интерфейс компонента

```typescript
export interface ComponentEvent {
  type: string;
  payload?: any;
  timestamp: Date;
  sourceComponentId: string;
}

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  validationRules?: ValidationRule[];
}

export interface Component {
  readonly id: string;
  readonly type: ComponentType;
  readonly props: Record<string, any>;
  
  // Методы жизненного цикла
  mount(): Promise<void>;
  unmount(): Promise<void>;
  update(props: Record<string, any>): Promise<void>;
  
  // Методы рендеринга
  render(): Promise<RenderResult>;
  
  // Методы событий
  on(event: string, handler: (event: ComponentEvent) => void): void;
  off(event: string, handler: (event: ComponentEvent) => void): void;
  emit(event: ComponentEvent): void;
  
  // Методы валидации
  validate(): ValidationResult[];
  
  // Методы состояния
  setState(state: any): Promise<void>;
  getState(): any;
}

export type ComponentType = 
  | 'TEXT_MESSAGE'
  | 'TEXT_INPUT' 
  | 'MULTI_SELECT'
  | 'SINGLE_SELECT'
  | 'NUMBER_INPUT'
  | 'DATE_PICKER'
  | 'BUTTON_GROUP'
  | string; // Для кастомных компонентов

export interface RenderResult {
  elementId: string;
  platformSpecificData: any;
  metadata?: Record<string, any>;
}
```

### 2.2 Система событий

```typescript
export class EventEmitter {
  private listeners: Map<string, Array<(event: ComponentEvent) => void>> = new Map();
  
  on(event: string, listener: (event: ComponentEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  off(event: string, listener: (event: ComponentEvent) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event: ComponentEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}
```

### 2.3 Базовый класс компонента

```typescript
export abstract class BaseComponent implements Component {
  protected readonly id: string;
  protected readonly type: ComponentType;
  protected props: Record<string, any>;
  protected state: any;
  protected eventEmitter: EventEmitter;
  protected validationRules: ValidationRule[];
  
  constructor(config: ComponentConfig) {
    this.id = config.id;
    this.type = config.type;
    this.props = config.props || {};
    this.state = {};
    this.validationRules = config.validationRules || [];
    this.eventEmitter = new EventEmitter();
  }
  
  async mount(): Promise<void> {
    // Базовая реализация - ничего не делает
  }
  
  async unmount(): Promise<void> {
    // Очищаем слушателей событий
    this.eventEmitter = new EventEmitter();
  }
  
  async update(props: Record<string, any>): Promise<void> {
    this.props = { ...this.props, ...props };
    // Эмитируем событие обновления
    this.emit({
      type: 'UPDATE',
      sourceComponentId: this.id,
      timestamp: new Date()
    });
  }
  
  abstract render(): Promise<RenderResult>;
  
  on(event: string, handler: (event: ComponentEvent) => void): void {
    this.eventEmitter.on(event, handler);
  }
  
  off(event: string, handler: (event: ComponentEvent) => void): void {
    this.eventEmitter.off(event, handler);
  }
  
  emit(event: ComponentEvent): void {
    this.eventEmitter.emit(event);
  }
  
  validate(): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    for (const rule of this.validationRules) {
      const result = rule.validate(this.state);
      if (!result.isValid) {
        results.push(result);
      }
    }
    
    return results;
  }
  
  async setState(state: any): Promise<void> {
    this.state = { ...this.state, ...state };
  }
  
  getState(): any {
    return { ...this.state };
  }
}
```

## 3. Конкретные компоненты

### 3.1 TextInputComponent

```typescript
export interface TextInputProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export class TextInputComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
    // Добавляем правила валидации по умолчанию
    if (this.props.required) {
      this.validationRules.push(new RequiredRule());
    }
    if (this.props.minLength) {
      this.validationRules.push(new MinLengthRule(this.props.minLength));
    }
    if (this.props.maxLength) {
      this.validationRules.push(new MaxLengthRule(this.props.maxLength));
    }
    if (this.props.pattern) {
      this.validationRules.push(new PatternRule(this.props.pattern));
    }
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'TEXT_INPUT',
        props: this.props
      }
    };
  }
  
  async handleInput(input: string): Promise<void> {
    await this.setState({ value: input });
    
    // Валидируем ввод
    const validationResults = this.validate();
    const isValid = validationResults.every(result => result.isValid);
    
    // Эмитируем событие изменения
    this.emit({
      type: 'CHANGE',
      payload: { value: input, isValid, validationResults },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
    
    // Если ввод валиден и это submit, эмитируем событие submit
    if (isValid && input && input.trim()) {
      this.emit({
        type: 'SUBMIT',
        payload: { value: input },
        sourceComponentId: this.id,
        timestamp: new Date()
      });
    }
  }
}
```

### 3.2 MultiSelectComponent

```typescript
export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected?: string[];
  minSelection?: number;
  maxSelection?: number;
  label?: string;
}

export class MultiSelectComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
    // Добавляем правила валидации по умолчанию
    if (this.props.minSelection) {
      this.validationRules.push(new MinSelectionRule(this.props.minSelection));
    }
    if (this.props.maxSelection) {
      this.validationRules.push(new MaxSelectionRule(this.props.maxSelection));
    }
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'MULTI_SELECT',
        props: this.props
      }
    };
  }
  
  async selectOption(optionValue: string): Promise<void> {
    const currentSelection = this.state.selected || [];
    let newSelection: string[];
    
    if (currentSelection.includes(optionValue)) {
      // Удаляем из выбора
      newSelection = currentSelection.filter(v => v !== optionValue);
    } else {
      // Добавляем в выбор
      newSelection = [...currentSelection, optionValue];
    }
    
    await this.setState({ selected: newSelection });
    
    // Валидируем выбор
    const validationResults = this.validate();
    const isValid = validationResults.every(result => result.isValid);
    
    // Эмитируем событие изменения
    this.emit({
      type: 'CHANGE',
      payload: { selected: newSelection, isValid, validationResults },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
    
    // Если выбор валиден и достигнут минимум, эмитируем событие submit
    if (isValid && this.props.minSelection && newSelection.length >= this.props.minSelection) {
      this.emit({
        type: 'SUBMIT',
        payload: { selected: newSelection },
        sourceComponentId: this.id,
        timestamp: new Date()
      });
    }
  }
  
  getSelectedOptions(): MultiSelectOption[] {
    const selectedValues = this.state.selected || [];
    return this.props.options.filter(option => 
      selectedValues.includes(option.value)
    );
  }
}
```

## 4. Система валидации

```typescript
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  ruleName: string;
}

export interface ValidationRule {
  validate(value: any): ValidationResult;
}

export class RequiredRule implements ValidationRule {
  validate(value: any): ValidationResult {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
      isValid,
      message: isValid ? undefined : 'This field is required',
      ruleName: 'REQUIRED'
    };
  }
}

export class MinLengthRule implements ValidationRule {
  constructor(private minLength: number) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'MIN_LENGTH' };
    }
    
    const str = String(value);
    const isValid = str.length >= this.minLength;
    return {
      isValid,
      message: isValid ? undefined : `Minimum length is ${this.minLength} characters`,
      ruleName: 'MIN_LENGTH'
    };
  }
}

export class MaxLengthRule implements ValidationRule {
  constructor(private maxLength: number) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'MAX_LENGTH' };
    }
    
    const str = String(value);
    const isValid = str.length <= this.maxLength;
    return {
      isValid,
      message: isValid ? undefined : `Maximum length is ${this.maxLength} characters`,
      ruleName: 'MAX_LENGTH'
    };
  }
}

export class MinSelectionRule implements ValidationRule {
  constructor(private minSelection: number) {}
  
  validate(value: any): ValidationResult {
    if (!Array.isArray(value)) {
      return { isValid: true, ruleName: 'MIN_SELECTION' };
    }
    
    const isValid = value.length >= this.minSelection;
    return {
      isValid,
      message: isValid ? undefined : `Minimum selection is ${this.minSelection} items`,
      ruleName: 'MIN_SELECTION'
    };
  }
}

export class MaxSelectionRule implements ValidationRule {
  constructor(private maxSelection: number) {}
  
  validate(value: any): ValidationResult {
    if (!Array.isArray(value)) {
      return { isValid: true, ruleName: 'MAX_SELECTION' };
    }
    
    const isValid = value.length <= this.maxSelection;
    return {
      isValid,
      message: isValid ? undefined : `Maximum selection is ${this.maxSelection} items`,
      ruleName: 'MAX_SELECTION'
    };
  }
}

export class PatternRule implements ValidationRule {
  constructor(private pattern: string | RegExp) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'PATTERN' };
    }
    
    const regex = typeof this.pattern === 'string' ? new RegExp(this.pattern) : this.pattern;
    const isValid = regex.test(String(value));
    return {
      isValid,
      message: isValid ? undefined : `Value does not match required pattern`,
      ruleName: 'PATTERN'
    };
  }
}
```

## 5. Механизм рендеринга

### 5.1 ComponentRenderer

```typescript
export interface ComponentRenderer {
  render(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
  update(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
  destroy(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
}

export class DefaultComponentRenderer implements ComponentRenderer {
  async render(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    const renderResult = await component.render();
    await platformAdapter.renderElement(renderResult);
  }
  
  async update(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    const renderResult = await component.render();
    await platformAdapter.updateElement(renderResult);
  }
  
  async destroy(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    await platformAdapter.removeElement(component.id);
  }
}
```

### 5.2 PlatformAdapter

```typescript
export type PlatformType = 'TELEGRAM' | 'WEB' | 'MOBILE' | string;

export interface RenderElement {
  elementId: string;
  type: string;
  props: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface PlatformAdapter {
  readonly type: PlatformType;
  
  renderElement(element: RenderElement): Promise<void>;
  updateElement(element: RenderElement): Promise<void>;
  removeElement(elementId: string): Promise<void>;
  handleUserInput(input: UserInput): Promise<UserInputResult>;
}

export interface UserInput {
  type: string;
  payload: any;
  componentId: string;
  timestamp: Date;
}

export interface UserInputResult {
  processed: boolean;
  error?: string;
  transformedInput?: any;
}
```

## 6. Интеграция с BotPersona

### 6.1 Расширение ViewMap

```typescript
// Расширенный дескриптор компонента
export interface ExtendedComponentDescriptor extends ComponentDescriptor {
  // Вместо простой строки, компонент может быть объектом
  component: string | ComponentConfig;
  interactions?: ComponentInteraction[];
  validation?: ComponentValidation[];
}

// Определение взаимодействий компонента
export interface ComponentInteraction {
  eventType: string;
  action: InteractionAction;
  conditions?: InteractionCondition[];
}

export type InteractionAction = 
  | 'TRANSITION' // Переход FSM
  | 'STORE_VALUE' // Сохранение значения
  | 'VALIDATE' // Валидация
  | 'CUSTOM' // Кастомное действие
  | string;

export interface InteractionCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'IN' | 'NOT_IN';
  value: any;
}
```

### 6.2 ComponentFactory

```typescript
export class ComponentFactory {
  private static registry: Map<ComponentType, new (config: ComponentConfig) => Component> = new Map();
  
  static register(type: ComponentType, componentClass: new (config: ComponentConfig) => Component): void {
    this.registry.set(type, componentClass);
  }
  
  static create(config: ComponentConfig): Component {
    const componentClass = this.registry.get(config.type);
    if (!componentClass) {
      throw new Error(`Unknown component type: ${config.type}`);
    }
    
    return new componentClass(config);
  }
  
  static createFromDescriptor(descriptor: ExtendedComponentDescriptor): Component {
    // Если component - строка, создаем простой компонент
    if (typeof descriptor.component === 'string') {
      return this.create({
        id: descriptor.id,
        type: descriptor.component as ComponentType,
        props: descriptor.props || {}
      });
    }
    
    // Если component - объект конфигурации
    return this.create({
      id: descriptor.id,
      ...descriptor.component
    });
  }
}

// Регистрируем стандартные компоненты
ComponentFactory.register('TEXT_INPUT', TextInputComponent);
ComponentFactory.register('MULTI_SELECT', MultiSelectComponent);
```

## 7. Обработка пользовательских событий

### 7.1 EventManager

```typescript
export class EventManager {
  private eventHandlers: Map<string, Array<(event: ComponentEvent) => Promise<void>>> = new Map();
  
  on(eventType: string, handler: (event: ComponentEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
  
  async handleEvent(event: ComponentEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error handling event ${event.type}:`, error);
        }
      }
    }
  }
}
```

### 7.2 Интеграция с Use Cases

```typescript
// В processUserInputUseCase нужно добавить обработку событий компонентов
export async function processComponentEventUseCase(
  command: ProcessComponentEventCommand
): Promise<void> {
  const { chatId, componentId, eventType, payload } = command;
  
  // Получаем активный диалог
  const conversation = await findConversation(chatId);
  if (!conversation) {
    throw new Error(`Active conversation for chat ${chatId} not found.`);
  }
  
  // Получаем BotPersona
  const persona = await findBotPersona(conversation.state.botPersonaId);
  if (!persona) {
    throw new Error(`BotPersona with id ${conversation.state.botPersonaId} not found.`);
  }
  
  // Создаем компонент из ViewMap
  const viewMap = new ViewMap(persona.state.viewMap);
  const componentDescriptor = viewMap.getNode(conversation.state.currentStateId);
  if (!componentDescriptor) {
    throw new Error(`Component descriptor for state ${conversation.state.currentStateId} not found.`);
  }
  
  const component = ComponentFactory.createFromDescriptor(componentDescriptor);
  
  // Обрабатываем событие компонента
  // Это зависит от типа компонента и события
  switch (component.type) {
    case 'TEXT_INPUT':
      if (eventType === 'CHANGE' || eventType === 'SUBMIT') {
        const textInput = component as TextInputComponent;
        await textInput.handleInput(payload.value);
      }
      break;
      
    case 'MULTI_SELECT':
      if (eventType === 'SELECT_OPTION') {
        const multiSelect = component as MultiSelectComponent;
        await multiSelect.selectOption(payload.optionValue);
      }
      break;
      
    // Другие типы компонентов...
  }
  
  // Сохраняем состояние компонента в контексте диалога
  // (Это потребует расширения Conversation aggregate)
  
  // Вызываем рендеринг обновленного компонента
  await renderComponent({
    chatId,
    componentName: componentDescriptor.component as string,
    props: { ...componentDescriptor.props, ...component.getState() }
  });
}
```

## 8. Расширяемость и кастомизация

### 8.1 Custom Component Registration

```typescript
// Разработчики могут регистрировать свои компоненты
export class CustomInputComponent extends BaseComponent {
  async render(): Promise<RenderResult> {
    // Кастомная реализация рендеринга
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'CUSTOM_INPUT',
        props: this.props
      }
    };
  }
  
  async handleCustomInput(input: any): Promise<void> {
    // Кастомная обработка ввода
    await this.setState({ customValue: input });
    this.emit({
      type: 'CUSTOM_EVENT',
      payload: { value: input },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
  }
}

// Регистрация кастомного компонента
ComponentFactory.register('CUSTOM_INPUT', CustomInputComponent);
```

### 8.2 Plugin System

```typescript
export interface ComponentPlugin {
  name: string;
  version: string;
  components: Array<{ type: ComponentType; class: new (config: ComponentConfig) => Component }>;
  validators?: ValidationRule[];
}

export class PluginManager {
  private plugins: Map<string, ComponentPlugin> = new Map();
  
  register(plugin: ComponentPlugin): void {
    this.plugins.set(plugin.name, plugin);
    
    // Регистрируем компоненты плагина
    plugin.components.forEach(comp => {
      ComponentFactory.register(comp.type, comp.class);
    });
    
    // Регистрируем валидаторы плагина
    if (plugin.validators) {
      plugin.validators.forEach(validator => {
        // Добавляем валидатор в глобальный реестр
      });
    }
  }
  
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      // Удаляем компоненты плагина
      plugin.components.forEach(comp => {
        // Удаление из фабрики
      });
      this.plugins.delete(pluginName);
    }
  }
}
```

Этот механизм взаимодействия предоставляет:
1. Единый интерфейс для всех компонентов
2. Гибкую систему событий
3. Расширяемую архитектуру для добавления новых компонентов
4. Интеграцию с существующей архитектурой BotPersona
5. Поддержку валидации и обработки пользовательского ввода