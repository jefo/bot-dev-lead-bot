# Semantic Graph Object Model Module
SGOM - это граф, состоящий из `триплетов`. каждый элемент триплета имеет свое имя (семантическое) и может быть получен как Сущность.
SGOM - это семантическая система координат для информации.

На самом деле сам граф служит только лишь для того что бы задавать информации координаты.
Сам информация хранится в `data` в `Node`; `relation` в триплете `EdgeAggregate` отражает семантику информации хранящейся в двух `Node`.

Как мы можем видеть сами `Node` и `EdgeAggregate` служат лишь утилитарной функции - системой координат информации, которая позволяет находить информацию по идентификаторам `Node` и `Relation`.

## Структура

- `node.id.ts`: Branded ID для узлов.
- `relation.id.ts`: Branded ID для связей.
- `node.types.ts`: Схема и тип для данных узла (`NodeData`).
- `nodes-relation.aggregate.ts`: Агрегат `EdgeAggregate`, представляющий связь между двумя узлами.
- `index.ts`: Файл для удобного экспорта всех элементов модуля.
- `node-crud.test.ts`: Тесты для CRUD операций с `Node`.
- `edge.aggregate.test.ts`: Тесты для CRUD операций с `EdgeAggregate`.
- `graph-crud.integration.test.ts`: Интеграционные тесты для полного цикла CRUD операций с `Node` и `EdgeAggregate`.

## EdgeAggregate Aggregate

`EdgeAggregate` - это агрегат, который:

- Содержит полные данные двух узлов (`left` и `right`).
- Хранит семантические имена связи в обоих направлениях (`rightEdgeName` и `leftEdgeName`).
- Гарантирует консистентность данных в рамках своей границы.
- Реализован с использованием `createAggregate` из SotaJS.
- Позволяет хранить в узлах данные любого типа в поле `data`.

### Особенности реализации

- Поле `data` служит для того что бы содержать связанную с узлом информацию.
- Поддерживается **типобезопасность** через **generic типы** и **фабрики схем Zod**.
- Для максимальной гибкости и типобезопасности можно использовать `createTypedEdge<TDataA, TDataB>()`, передав ему схемы Zod для данных узлов `left` и `right`.
- Из-за ограничений текущей версии `createAggregate` из SotaJS, инварианты (например, проверка на одинаковые ID узлов) проверяются только при выполнении действий, а не при создании агрегата. Это означает, что агрегат с некорректными данными (например, с одинаковыми ID узлов) может быть создан, но любая попытка изменить его состояние вызовет ошибку.
- Для ID узлов и связи в схеме используются обычные `z.string().uuid()`, а не branded ID, чтобы избежать проблем с типами в `zod`. Branded ID используются при создании экземпляров данных для валидации.
- Валидация содержимого `data` не проводится на уровне агрегата и должна обеспечиваться вызывающим кодом (например, Use Case), желательно с использованием схем Zod.

## CRUD Operations

Модуль предоставляет полную поддержку CRUD операций для `Node` и `EdgeAggregate`:

- **Create**: `NodeDataSchema.parse(data)`, `EdgeAggregate.create(data)`.
- **Read**: `node.state`, `relation.state`.
- **Update**: `relation.actions.updateSemantics(...)`, `relation.actions.updateLeftData(...)`, `relation.actions.updateRightData(...)`.
- **Delete**: В DDD агрегаты не удаляются напрямую. Удаление происходит через репозиторий.

### Тестирование CRUD

- `node-crud.test.ts`: Тесты для CRUD операций с `Node`.
- `edge.aggregate.test.ts`: Тесты для CRUD операций с `EdgeAggregate`.

## Generic Support

Модуль поддерживает generic типы для `EdgeAggregate`, что позволяет типизировать данные узлов:

```typescript
import { z } from 'zod';
import { createTypedEdgeAggregate } from './nodes-relation.aggregate';

// 1. Определяем типы данных для наших узлов
type User = { email: string; age: number };
type Product = { price: number; category: string };

// 2. Определяем схемы Zod для этих типов
const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});
const ProductSchema = z.object({
  price: z.number().nonnegative(),
  category: z.string().min(1),
});

// 3. Создаем специализированную версию EdgeAggregate с использованием схем
const UserProductRelation = createTypedEdge<User, Product>();

const validUUIDa = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const validUUIDb = 'e8a5b5a0-5bfa-4a0e-8b0a-0e02b2c3d479';
const validUUIDr = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

// 4. Создаем тестовые данные с правильной структурой
const validUserNodeData = {
  id: NodeId.create(validUUIDa).value,
  name: "User Node",
  data: { email: "user@example.com", age: 30 } // <-- Типизированные данные
};

const validProductNodeData = {
  id: NodeId.create(validUUIDb).value,
  name: "Product Node",
  data: { price: 99.99, category: "Electronics" } // <-- Типизированные данные
};

const validRelationData: unknown = {
  id: EdgeId.create(validUUIDr).value,
  left: validUserNodeData,
  right: validProductNodeData,
  rightEdgeName: "buys",
  leftEdgeName: "boughtBy"
};

// 5. Создаем агрегат - TS знает точные типы данных!
const relation = UserProductRelation.create(validRelationData);

// 6. TypeScript теперь знает, что relation.state.left.data это User
// и relation.state.right.data это Product
expect(relation.state.left.data.email).toBe("user@example.com");
expect(relation.state.right.data.price).toBe(99.99);

// 7. updateNodeAData теперь требует объект типа User
relation.actions.updateNodeAData({ email: "newuser@example.com", age: 25 });
expect(relation.state.nodeA.data.email).toBe("newuser@example.com");
expect(relation.state.nodeA.data.age).toBe(25);

// relation.actions.updateNodeAData({ email: "newuser@example.com", age: "25" });
// ^-- Это вызовет ошибку типов TypeScript на этапе компиляции!

// 8. updateNodeBData теперь требует объект типа Product
relation.actions.updateNodeBData({ price: 199.99, category: "Books" });
expect(relation.state.nodeB.data.price).toBe(199.99);
expect(relation.state.nodeB.data.category).toBe("Books");

// relation.actions.updateNodeBData({ name: "Book" });
// ^-- Это тоже вызовет ошибку типов!
```

## Следующие шаги / Где искать больше информации

- Углубленная архитектура: `external/sotajs/README.md`, `src/domain/nodes/README.md`.
- Тесты как спецификации: `*.test.ts` файлы.
- Исходный код: Все `.ts` файлы содержат комментарии и типы.
- Use Cases: `src/application/use-cases/`.
