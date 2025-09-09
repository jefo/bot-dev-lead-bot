# Документация по использованию компонентов BotPersona SDK

## 1. Обзор

Библиотека компонентов BotPersona SDK предоставляет унифицированный механизм создания и взаимодействия с компонентами интерфейса ботов. Она включает в себя как компоненты вывода информации, так и компоненты ввода данных от пользователя.

## 2. Установка и настройка

Библиотека компонентов является частью пакета `@bot-persona/sdk` и автоматически доступна после установки основного пакета:

```bash
npm install @bot-persona/sdk
```

## 3. Основные концепции

### 3.1 Компоненты (Components)

Компоненты - это строительные блоки интерфейса бота. Они могут быть двух типов:
- **Input Components** - компоненты для получения данных от пользователя
- **Output Components** - компоненты для отображения информации пользователю

### 3.2 Фабрика компонентов (ComponentFactory)

Фабрика компонентов используется для создания экземпляров компонентов по их конфигурации:

```typescript
import { ComponentFactory } from '@bot-persona/sdk/components';

const component = ComponentFactory.create({
  id: 'unique-component-id',
  type: 'TEXT_INPUT',
  props: {
    label: 'Enter your name',
    placeholder: 'John Doe',
    required: true
  }
});
```

### 3.3 Система событий

Все компоненты поддерживают систему событий для обработки взаимодействий:

```typescript
component.on('CHANGE', (event) => {
  console.log('Component value changed:', event.payload);
});

component.on('SUBMIT', (event) => {
  console.log('Component submitted:', event.payload);
});
```

## 4. Доступные компоненты

### 4.1 TextInputComponent

Компонент для ввода текстовой информации.

#### Пример использования:

```typescript
import { ComponentFactory } from '@bot-persona/sdk/components';

const textInput = ComponentFactory.create({
  id: 'name-input',
  type: 'TEXT_INPUT',
  props: {
    label: 'What is your name?',
    placeholder: 'Enter your full name',
    required: true,
    minLength: 2,
    maxLength: 50
  }
});

// Подписка на события
textInput.on('CHANGE', (event) => {
  console.log('Name changed to:', event.payload.value);
  console.log('Is valid:', event.payload.isValid);
});

textInput.on('SUBMIT', (event) => {
  console.log('Name submitted:', event.payload.value);
});

// Имитация ввода пользователя
await textInput.handleInput('John Doe');
```

#### Свойства (Props):

| Свойство | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| label | string | Нет | Метка поля |
| placeholder | string | Нет | Placeholder текст |
| required | boolean | Нет | Обязательность заполнения |
| minLength | number | Нет | Минимальная длина |
| maxLength | number | Нет | Максимальная длина |
| pattern | string | Нет | Регулярное выражение для валидации |
| type | 'text' \| 'email' \| 'password' \| 'tel' | Нет | Тип поля ввода |

#### Методы:

- `handleInput(input: string)`: Обработка ввода пользователя
- `getValue(): string | undefined`: Получение текущего значения
- `isValid(): boolean`: Проверка валидности значения

#### События:

- `CHANGE`: Значение компонента изменилось
- `SUBMIT`: Пользователь подтвердил ввод

### 4.2 MultiSelectComponent

Компонент для множественного выбора из списка опций.

#### Пример использования:

```typescript
import { ComponentFactory } from '@bot-persona/sdk/components';

const multiSelect = ComponentFactory.create({
  id: 'services-select',
  type: 'MULTI_SELECT',
  props: {
    label: 'Select services you need:',
    options: [
      { value: 'consultation', label: 'Consultation' },
      { value: 'diagnostics', label: 'Diagnostics' },
      { value: 'treatment', label: 'Treatment' }
    ],
    minSelection: 1,
    maxSelection: 2
  }
});

// Подписка на события
multiSelect.on('CHANGE', (event) => {
  console.log('Selection changed:', event.payload.selected);
  console.log('Is valid:', event.payload.isValid);
});

multiSelect.on('SUBMIT', (event) => {
  console.log('Selection submitted:', event.payload.selected);
});

// Имитация выбора пользователя
await multiSelect.selectOption('consultation');
await multiSelect.selectOption('treatment');
```

#### Свойства (Props):

| Свойство | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| label | string | Нет | Метка поля |
| options | MultiSelectOption[] | Да | Список опций для выбора |
| minSelection | number | Нет | Минимальное количество выборов |
| maxSelection | number | Нет | Максимальное количество выборов |
| required | boolean | Нет | Обязательность выбора |

#### Тип MultiSelectOption:

```typescript
interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

#### Методы:

- `selectOption(optionValue: string)`: Выбор/отмена выбора опции
- `getSelectedOptions(): MultiSelectOption[]`: Получение выбранных опций
- `getSelectedValues(): string[]`: Получение значений выбранных опций
- `isValid(): boolean`: Проверка валидности выбора

#### События:

- `CHANGE`: Выбор изменился
- `SUBMIT`: Пользователь подтвердил выбор

### 4.3 TextMessageComponent

Компонент для отображения текстовых сообщений.

#### Пример использования:

```typescript
import { ComponentFactory } from '@bot-persona/sdk/components';

const textMessage = ComponentFactory.create({
  id: 'welcome-message',
  type: 'TEXT_MESSAGE',
  props: {
    text: 'Welcome to our service! How can we help you today?',
    format: 'plain'
  }
});

// Получение текста сообщения
const messageText = textMessage.getText();
const messageFormat = textMessage.getFormat();
```

#### Свойства (Props):

| Свойство | Тип | Обязательный | Описание |
|----------|-----|--------------|----------|
| text | string | Да | Отображаемый текст |
| format | 'plain' \| 'markdown' \| 'html' | Нет | Формат текста (по умолчанию 'plain') |

#### Методы:

- `getText(): string`: Получение текста сообщения
- `getFormat(): 'plain' \| 'markdown' \| 'html'`: Получение формата текста

## 5. Система валидации

Все компоненты ввода поддерживают встроенную систему валидации с помощью правил:

### 5.1 Доступные правила валидации

- `RequiredRule`: Проверка обязательности заполнения
- `MinLengthRule`: Проверка минимальной длины
- `MaxLengthRule`: Проверка максимальной длины
- `MinSelectionRule`: Проверка минимального количества выборов
- `MaxSelectionRule`: Проверка максимального количества выборов
- `PatternRule`: Проверка по регулярному выражению
- `EmailRule`: Проверка email адреса
- `NumberRule`: Проверка числового значения

### 5.2 Пример использования правил валидации:

```typescript
import { 
  RequiredRule, 
  MinLengthRule, 
  PatternRule, 
  EmailRule 
} from '@bot-persona/sdk/components';

const textInput = ComponentFactory.create({
  id: 'email-input',
  type: 'TEXT_INPUT',
  props: {
    label: 'Email address',
    type: 'email'
  }
});

// Правила валидации автоматически добавляются на основе props
// Для email поля добавляются RequiredRule и PatternRule для email

// Проверка валидности
const isValid = textInput.isValid();
```

## 6. Интеграция с BotPersona

### 6.1 Использование компонентов в ViewMap

Компоненты интегрируются с BotPersona через ViewMap:

```typescript
const botPersonaDefinition = {
  name: "Customer Service Bot",
  fsm: {
    initialState: "welcome",
    states: [
      {
        id: "welcome",
        on: [{ event: "START", target: "getName" }]
      },
      {
        id: "getName",
        on: [{ event: "NAME_PROVIDED", target: "getServices" }]
      },
      {
        id: "getServices",
        on: [{ event: "SERVICES_SELECTED", target: "confirmation" }]
      },
      {
        id: "confirmation",
        on: []
      }
    ]
  },
  viewMap: {
    nodes: [
      {
        id: "welcome",
        component: "TEXT_MESSAGE",
        props: {
          text: "Welcome! Let's get started.",
          options: ["START - Begin consultation"]
        }
      },
      {
        id: "getName",
        component: "TEXT_INPUT",
        props: {
          label: "What is your name?",
          placeholder: "Enter your full name",
          required: true
        }
      },
      {
        id: "getServices",
        component: "MULTI_SELECT",
        props: {
          label: "Select services you need:",
          options: [
            { value: "consultation", label: "Consultation" },
            { value: "diagnostics", label: "Diagnostics" },
            { value: "treatment", label: "Treatment" }
          ],
          minSelection: 1
        }
      },
      {
        id: "confirmation",
        component: "TEXT_MESSAGE",
        props: {
          text: "Thank you! We'll contact you shortly."
        }
      }
    ]
  }
};
```

### 6.2 Обработка событий компонентов в Use Cases

Use Cases могут обрабатывать события компонентов:

```typescript
// В processUserInputUseCase
export async function processUserInputUseCase(
  command: ProcessUserInputCommmand
): Promise<void> {
  const { chatId, event, payload } = ProcessUserInputCommmandSchema.parse(command);

  // Получение текущего диалога и BotPersona
  const conversation = await findConversation(chatId);
  const persona = await findBotPersona(conversation.state.botPersonaId);
  
  // Получение текущего компонента
  const viewMap = new ViewMap(persona.state.viewMap);
  const currentNode = viewMap.getNode(conversation.state.currentStateId);
  
  // Обработка специфичных событий компонентов
  if (event === 'COMPONENT_EVENT') {
    // Обработка события от компонента
    await handleComponentEvent(conversation, event, payload);
  }
  
  // Продолжение обработки как обычно
  conversation.actions.processInput(fsm, event, payload);
  await saveConversation(conversation);
}
```

## 7. Создание кастомных компонентов

### 7.1 Расширение базового компонента

Для создания кастомного компонента нужно расширить BaseComponent:

```typescript
import { BaseComponent, ComponentConfig, RenderResult } from '@bot-persona/sdk/components';

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
}

export class DatePickerComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
    
    // Добавление кастомной логики инициализации
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'DATE_PICKER',
        props: this.props
      }
    };
  }
  
  async selectDate(date: string): Promise<void> {
    await this.setState({ selectedDate: date });
    
    // Валидация выбранной даты
    const isValid = this.validateDate(date);
    
    // Эмитирование события
    this.emit({
      type: 'DATE_SELECTED',
      payload: { date, isValid },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
  }
  
  private validateDate(date: string): boolean {
    // Кастомная логика валидации даты
    return true; // Упрощенный пример
  }
}
```

### 7.2 Регистрация кастомного компонента

```typescript
import { ComponentFactory } from '@bot-persona/sdk/components';
import { DatePickerComponent } from './date-picker-component';

// Регистрация кастомного компонента
ComponentFactory.register('DATE_PICKER', DatePickerComponent);
```

## 8. Адаптеры платформ

### 8.1 ConsolePlatformAdapter

Адаптер для консольного вывода, используемый по умолчанию:

```typescript
import { ConsolePlatformAdapter } from '@bot-persona/sdk/components';

const consoleAdapter = new ConsolePlatformAdapter();

// Использование в рендерере
const renderer = new DefaultComponentRenderer();
await renderer.render(component, consoleAdapter);
```

### 8.2 Создание кастомного адаптера

Для интеграции с другими платформами можно создать кастомный адаптер:

```typescript
import { PlatformAdapter, RenderElement, UserInput, UserInputResult } from '@bot-persona/sdk/components';

export class TelegramPlatformAdapter implements PlatformAdapter {
  readonly type = 'TELEGRAM';
  
  async renderElement(element: RenderElement): Promise<void> {
    // Кастомная логика рендеринга для Telegram
    // Например, отправка сообщения через Telegram Bot API
  }
  
  async updateElement(element: RenderElement): Promise<void> {
    // Кастомная логика обновления элемента
  }
  
  async removeElement(elementId: string): Promise<void> {
    // Кастомная логика удаления элемента
  }
  
  async handleUserInput(input: UserInput): Promise<UserInputResult> {
    // Кастомная логика обработки пользовательского ввода
    return {
      processed: true
    };
  }
}
```

## 9. Лучшие практики

### 9.1 Уникальные идентификаторы

Всегда используйте уникальные идентификаторы для компонентов:

```typescript
// Хорошо
const component = ComponentFactory.create({
  id: `input-${Date.now()}-${Math.random()}`,
  type: 'TEXT_INPUT',
  props: { /* ... */ }
});

// Плохо
const component = ComponentFactory.create({
  id: 'input', // Не уникальный
  type: 'TEXT_INPUT',
  props: { /* ... */ }
});
```

### 9.2 Обработка ошибок

Всегда обрабатывайте возможные ошибки:

```typescript
try {
  await component.handleInput(userInput);
} catch (error) {
  console.error('Error handling input:', error);
  // Отправка сообщения об ошибке пользователю
}
```

### 9.3 Очистка ресурсов

Не забывайте очищать слушатели событий:

```typescript
// При удалении компонента
component.off('CHANGE', changeHandler);
component.off('SUBMIT', submitHandler);
await component.unmount();
```

## 10. Примеры использования

### 10.1 Простой FAQ-бот

```typescript
const faqBotDefinition = {
  name: "FAQ Bot",
  fsm: {
    initialState: "welcome",
    states: [
      {
        id: "welcome",
        on: [
          { event: "FAQ1", target: "faq1" },
          { event: "FAQ2", target: "faq2" },
          { event: "END", target: "end" }
        ]
      },
      {
        id: "faq1",
        on: [{ event: "BACK", target: "welcome" }]
      },
      {
        id: "faq2",
        on: [{ event: "BACK", target: "welcome" }]
      },
      {
        id: "end",
        on: []
      }
    ]
  },
  viewMap: {
    nodes: [
      {
        id: "welcome",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Welcome! Select a question:",
          options: [
            "FAQ1 - How does this bot work?",
            "FAQ2 - Where to find documentation?",
            "END - Finish"
          ]
        }
      },
      {
        id: "faq1",
        component: "TEXT_MESSAGE",
        props: { 
          text: "This bot uses finite state machine..."
        }
      },
      {
        id: "faq2",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Documentation is available in the repository..."
        }
      },
      {
        id: "end",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Thank you for using our bot!"
        }
      }
    ]
  }
};
```

### 10.2 Бот для записи на прием

```typescript
const appointmentBotDefinition = {
  name: "Appointment Bot",
  fsm: {
    initialState: "welcome",
    states: [
      {
        id: "welcome",
        on: [{ event: "BOOK_APPOINTMENT", target: "getService" }]
      },
      {
        id: "getService",
        on: [{ event: "SERVICE_SELECTED", target: "getName" }]
      },
      {
        id: "getName",
        on: [{ event: "NAME_PROVIDED", target: "getContact" }]
      },
      {
        id: "getContact",
        on: [{ event: "CONTACT_PROVIDED", target: "getDateTime" }]
      },
      {
        id: "getDateTime",
        on: [{ event: "DATETIME_SELECTED", target: "confirmation" }]
      },
      {
        id: "confirmation",
        on: [{ event: "CONFIRM", target: "success" }]
      },
      {
        id: "success",
        on: []
      }
    ]
  },
  viewMap: {
    nodes: [
      {
        id: "welcome",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Welcome to appointment service!",
          options: ["BOOK_APPOINTMENT - Book appointment"]
        }
      },
      {
        id: "getService",
        component: "MULTI_SELECT",
        props: { 
          label: "Select service:",
          options: [
            { value: "consultation", label: "Consultation" },
            { value: "diagnostics", label: "Diagnostics" },
            { value: "treatment", label: "Treatment" }
          ],
          minSelection: 1,
          maxSelection: 1
        }
      },
      {
        id: "getName",
        component: "TEXT_INPUT",
        props: { 
          label: "Your name:",
          placeholder: "Enter your full name",
          required: true
        }
      },
      {
        id: "getContact",
        component: "TEXT_INPUT",
        props: { 
          label: "Your phone:",
          placeholder: "Enter your phone number",
          required: true,
          pattern: "^\\+?[1-9]\\d{1,14}$"
        }
      },
      {
        id: "getDateTime",
        component: "TEXT_INPUT",
        props: { 
          label: "Preferred date and time:",
          placeholder: "YYYY-MM-DD HH:MM",
          required: true
        }
      },
      {
        id: "confirmation",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Please confirm your appointment"
        }
      },
      {
        id: "success",
        component: "TEXT_MESSAGE",
        props: { 
          text: "Your appointment is confirmed!"
        }
      }
    ]
  }
};
```

Эта документация охватывает основные аспекты использования библиотеки компонентов BotPersona SDK. Она предоставляет мощный и гибкий механизм для создания интерактивных интерфейсов ботов с унифицированным API для различных типов компонентов.