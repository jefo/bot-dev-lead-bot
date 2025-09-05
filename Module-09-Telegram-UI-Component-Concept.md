# Концепция: UI-Компоненты для Telegram

Этот документ описывает архитектурный подход к созданию сообщений и клавиатур в Telegram. Цель — уйти от императивного построения JSON-объектов в презентерах к декларативной, переиспользуемой и композируемой модели UI-компонентов.

## 1. Соответствие ключевым принципам

Этот подход напрямую поддерживает наши три ключевых принципа разработки.

### DRY (Don’t Repeat Yourself)
Вместо того чтобы определять одну и ту же кнопку или структуру клавиатуры в нескольких местах, мы создаем один компонент (например, `MainMenuKeyboard`) и переиспользуем его. Изменение компонента в одном месте автоматически отразится везде, где он используется.

### SOLID (Single Responsibility Principle)
Концепция компонентов помогает идеально разделить обязанности:
- **Компонент:** Отвечает только за свою часть "view". `Button` отвечает за кнопку, `WelcomeMessage` — за текст приветствия. Они ничего не знают о бизнес-логике.
- **"Экран" (Screen):** Компонент высшего порядка, который собирает мелкие компоненты в одно целое сообщение. Его ответственность — композиция UI.
- **Презентер (Adapter):** Его ответственность сужается до выбора нужного "Экрана" и передачи в него данных из DTO, полученного от use case. Он больше не занимается версткой JSON.

### YAGNI (You Ain’t Gonna Need It)
Мы не будем создавать универсальную библиотеку компонентов "на все случаи жизни". Мы будем создавать только те компоненты, которые необходимы для реализации текущего модуля. Например, для первого модуля мы создадим `Button`, `Row`, `Keyboard` и `RoleSelectionKeyboard`. Новые компоненты будут добавляться только по мере необходимости.

## 2. Детальная концепция

#### Что такое "Компонент"?

Это чистая функция, которая принимает на вход `props` (данные) и возвращает фрагмент JSON, совместимый с Telegram Bot API.

```typescript
// Простейший компонент кнопки
// props -> { text: string, callback_data: string }
// returns -> Telegram's InlineKeyboardButton object
function Button(props) {
  return { text: props.text, callback_data: props.callback_data };
}
```

#### Композиция

Компоненты можно вкладывать друг в друга, собирая сложный интерфейс из простых, как конструктор.

```typescript
// components/common/Keyboard.ts
function Row(buttons) { return buttons; }
function Keyboard(rows) { return { inline_keyboard: rows }; }

// components/onboarding/RoleSelectionKeyboard.ts
import { Button, Row, Keyboard } from '../common';

export function RoleSelectionKeyboard() {
  return Keyboard([
    Row([ Button({ text: '👨‍💼 Я владелец бизнеса', callback_data: 'business_owner' }) ]),
    Row([ Button({ text: '🎯 Я маркетолог', callback_data: 'specialist' }) ]),
    Row([ Button({ text: '🤔 Просто изучаю', callback_data: 'explorer' }) ]),
  ]);
}
```

#### "Экраны" (Screens)

"Экран" — это компонент высшего порядка, который объединяет несколько мелких компонентов в готовое к отправке сообщение.

```typescript
// infrastructure/telegram/screens/OnboardingScreen.ts
import { RoleSelectionKeyboard } from '../components/onboarding/RoleSelectionKeyboard';

export function OnboardingScreen(props) {
  const text = `Здравствуйте! Увидел ваш интерес на Kwork...`;
  const keyboard = RoleSelectionKeyboard();
  return { text, reply_markup: keyboard };
}
```

## 3. Пример рефакторинга Презентера

Этот подход кардинально упрощает код презентеров.

**Было:**
```typescript
export async function welcomeUserAdapter(output) {
  const text = 'Здравствуйте!...';
  const keyboard = { inline_keyboard: [[{ text: '...' }]] };
  await telegramApi.sendMessage(output.telegramId, text, { reply_markup: keyboard });
}
```

**Стало:**
```typescript
import { OnboardingScreen } from './screens/OnboardingScreen';

export async function welcomeUserAdapter(output) {
  // 1. Готовим props
  const props = { telegramId: output.telegramId };
  // 2. Рендерим "Экран"
  const messagePayload = OnboardingScreen(props);
  // 3. Отправляем результат
  await telegramApi.sendMessage(output.telegramId, messagePayload);
}
```

## 4. Предлагаемая структура директорий

```
app/bot/src/infrastructure/telegram/
├── components/                # Переиспользуемые UI-компоненты
│   ├── common/                # Общие (Button, Keyboard)
│   └── onboarding/            # Специфичные для модуля
└── screens/                   # Компоненты-экраны, собирающие целые сообщения
```
