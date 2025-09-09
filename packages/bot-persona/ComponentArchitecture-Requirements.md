# Архитектурные требования для системы компонентов BotPersona SDK

## 1. Анализ текущей архитектуры

### 1.1 Текущий поток данных
1. **Use Case** вызывает доменную логику агрегата `Conversation`
2. **Conversation** обновляет свое состояние на основе FSM
3. **Use Case** получает новое состояние и запрашивает соответствующий компонент из `ViewMap`
4. **Use Case** вызывает выходной порт `componentRenderOutPort` с именем компонента и props
5. **Адаптер презентации** получает DTO и отрисовывает компонент на конкретной платформе

### 1.2 Текущие ограничения
- Components - это просто имена строковых идентификаторов без структуры
- Props - это простые типы данных без возможности сложных взаимодействий
- Нет механизма обработки пользовательского ввода от компонентов
- Нет унифицированного API для создания и управления компонентами

## 2. Архитектурные требования

### 2.1 Принципы проектирования

#### 2.1.1 Единый интерфейс компонентов
Все компоненты должны реализовывать единый интерфейс:
```typescript
interface Component {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  render(): RenderResult;
  handleEvent(event: ComponentEvent): void;
}
```

#### 2.1.2 Разделение входящих и исходящих компонентов
- **Input Components** - компоненты для получения данных от пользователя
- **Output Components** - компоненты для отображения информации пользователю

#### 2.1.3 Расширяемость
Архитектура должна позволять легко добавлять новые типы компонентов без изменения существующего кода.

#### 2.1.4 Инверсия зависимостей
Компоненты не должны зависеть от конкретных платформ, вместо этого платформы адаптируются под компоненты.

### 2.2 Требования к компонентам

#### 2.2.1 Базовый компонент
```typescript
abstract class BaseComponent implements Component {
  protected id: string;
  protected type: ComponentType;
  protected props: Record<string, any>;
  protected eventEmitter: EventEmitter;
  
  constructor(config: ComponentConfig) {
    this.id = config.id;
    this.type = config.type;
    this.props = config.props || {};
    this.eventEmitter = new EventEmitter();
  }
  
  abstract render(): RenderResult;
  
  on(event: string, handler: EventHandler): void {
    this.eventEmitter.on(event, handler);
  }
  
  emit(event: ComponentEvent): void {
    this.eventEmitter.emit(event.type, event);
  }
  
  abstract handleEvent(event: ComponentEvent): void;
}
```

#### 2.2.2 Типы компонентов
- **TEXT_MESSAGE** - простое текстовое сообщение
- **TEXT_INPUT** - поле ввода текста
- **MULTI_SELECT** - множественный выбор из списка
- **SINGLE_SELECT** - единственный выбор из списка
- **NUMBER_INPUT** - поле ввода чисел
- **DATE_PICKER** - выбор даты
- **BUTTON_GROUP** - группа кнопок

#### 2.2.3 События компонентов
- **CHANGE** - значение компонента изменилось
- **SUBMIT** - пользователь подтвердил ввод
- **CANCEL** - пользователь отменил действие
- **VALIDATE** - запрос на валидацию данных

### 2.3 Требования к системе рендеринга

#### 2.3.1 ComponentRenderer
```typescript
interface ComponentRenderer {
  render(component: Component, platform: PlatformAdapter): Promise<RenderResult>;
  update(component: Component, platform: PlatformAdapter): Promise<void>;
  destroy(component: Component, platform: PlatformAdapter): Promise<void>;
}
```

#### 2.3.2 PlatformAdapter
```typescript
interface PlatformAdapter {
  type: PlatformType;
  renderElement(element: RenderElement): Promise<void>;
  updateElement(element: RenderElement): Promise<void>;
  removeElement(elementId: string): Promise<void>;
  handleUserInput(input: UserInput): Promise<UserInputResult>;
}
```

### 2.4 Требования к интеграции с BotPersona

#### 2.4.1 Расширение ViewMap
Текущий `ViewMap` должен быть расширен для поддержки компонентов:
```typescript
interface ExtendedComponentDescriptor extends ComponentDescriptor {
  component: Component; // Вместо строки - реальный компонент
  interactions?: ComponentInteraction[]; // Описание взаимодействий
}
```

#### 2.4.2 ComponentFactory
Фабрика для создания компонентов по конфигурации:
```typescript
class ComponentFactory {
  static create(config: ComponentConfig): Component {
    switch (config.type) {
      case 'TEXT_INPUT':
        return new TextInputComponent(config);
      case 'MULTI_SELECT':
        return new MultiSelectComponent(config);
      // ...
      default:
        throw new Error(`Unknown component type: ${config.type}`);
    }
  }
}
```

### 2.5 Требования к обработке пользовательского ввода

#### 2.5.1 InputHandler
```typescript
interface InputHandler {
  handleInput(component: Component, input: UserInput): Promise<InputResult>;
  validateInput(component: Component, input: UserInput): Promise<ValidationResult>;
}
```

#### 2.5.2 Integration with Use Cases
Use Cases должны уметь обрабатывать события от компонентов:
```typescript
// В processUserInputUseCase
const component = viewMap.getNode(currentStateIdAfter);
if (component.interactions) {
  // Обработка специфичных взаимодействий компонента
  await handleComponentInteractions(component.interactions, event, payload);
}
```

## 3. Архитектурные ограничения

### 3.1 Совместимость
Новая система компонентов должна быть обратно совместима с текущей архитектурой, где компоненты - это строки.

### 3.2 Производительность
- Время создания компонента < 10ms
- Время рендеринга компонента < 50ms
- Память на один компонент < 1KB

### 3.3 Безопасность
- Все входные данные должны валидироваться
- Запрет на выполнение произвольного кода в компонентах
- Защита от XSS и других атак

## 4. Паттерны проектирования

### 4.1 Factory Pattern
Для создания компонентов разных типов

### 4.2 Observer Pattern
Для обработки событий компонентов

### 4.3 Adapter Pattern
Для интеграции с различными платформами

### 4.4 Strategy Pattern
Для различных алгоритмов рендеринга и валидации

### 4.5 Composite Pattern
Для создания сложных компонентов из простых

## 5. Требования к расширяемости

### 5.1 Plugin System
Архитектура должна поддерживать систему плагинов для добавления новых типов компонентов.

### 5.2 Custom Components
Разработчики должны иметь возможность создавать собственные компоненты, реализуя стандартные интерфейсы.

### 5.3 Theme Support
Компоненты должны поддерживать темизацию для различных визуальных стилей.

## 6. Требования к тестированию

### 6.1 Unit Testing
Каждый компонент должен быть покрыт unit-тестами.

### 6.2 Integration Testing
Должны быть тесты интеграции компонентов с BotPersona.

### 6.3 Cross-platform Testing
Должны быть тесты на разных платформах.