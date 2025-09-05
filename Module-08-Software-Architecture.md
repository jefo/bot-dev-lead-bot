### [БЛОК 6 / Часть 2]: Архитектура Приложения (SOTA.js)

#### 3.4. Принцип "Семантических Выходных Портов"
Каждый Use Case является обработчиком команды, который по завершении бизнес-операции сообщает о её результате через специфичный, семантически именованный выходной порт.

**Преимущества:**
1. **Один Use Case — Множество Выходных Портов**: Вместо одного общего `presentationPort`, каждый Use Case определяет собственный набор выходных портов, соответствующий его возможным исходам.
2. **DTO — это Бизнес-Результат, а не UI**: Слой приложения оперирует DTO, описывающими итог операции, как если бы он просто возвращал их через `return`.
3. **Presentation Adapter — это "Композитор" UI**: Адаптер получает DTO с бизнес-данными и на их основе создает сообщение для пользователя.

#### 3.5. Жизненный цикл запроса
1.  **Driving Adapter** (напр. Telegram Controller) → **Use Case** (с Command DTO)
2.  Use Case → **Data Port** → Rich Entity
3.  Use Case вызывает действие у Rich Entity
4.  Use Case → **Data Port** (сохраняет новое состояние)
5.  Use Case формирует **Business Outcome DTO**
6.  Use Case вызывает семантический **выходной порт** (напр. `ecommerceOwnerSegmentedPort`)
7.  **Presentation Adapter** (напр. `onEcommerceOwnerSegmented`) получает outcome DTO
8.  Presentation Adapter генерирует финальное сообщение и отправляет его пользователю

#### 3.6. Структура модуля

##### Domain Layer
```typescript
// domain/entities/qualification.entities.ts
export const QualificationProfile = createEntity({...});
export const Lead = createEntity({...});

// domain/ports/repository.ports.ts
export const findUserByIdPort = createPort<...>();
export const saveUserPort = createPort<...>();
```

##### Application Layer
```typescript
// application/ports/ecommerce-owner.outputs.ts
export const ecommerceOwnerSegmentedPort = createPort<...>();
export const ecommerceOwnerRoleSelectedPort = createPort<...>();

// application/use-cases/ecommerce-owner.use-cases.ts
export const segmentEcommerceOwnerUseCase = async (input: unknown): Promise<void> => {...};
export const selectEcommerceOwnerRoleUseCase = async (input: unknown): Promise<void> => {...};
```

##### Infrastructure Layer
```typescript
// infrastructure/telegram/ecommerce-owner.presentation-adapters.ts
export const onEcommerceOwnerSegmented = async (dto: {...}) => {...};
export const onEcommerceOwnerRoleSelected = async (dto: {...}) => {...};

// infrastructure/telegram/ecommerce-owner.telegram-adapter.ts
export const ecommerceOwnerTelegramDrivingAdapter = async (req: any, res: any) => {...};
```

##### Composition Root
```typescript
// composition/ecommerce-owner.composition.ts
export const composeEcommerceOwnerDI = () => {
  // Связываем порты данных с адаптерами
  setPortAdapter(findUserByIdPort, mockFindUserByIdAdapter);
  
  // Связываем семантические порты с presentation adapters
  setPortAdapter(ecommerceOwnerSegmentedPort, onEcommerceOwnerSegmented);
};
```

#### 3.7. Преимущества архитектуры
1.  **Максимальная гибкость**: Для поддержки нового канала (например, Web) нужно лишь добавить новый Presentation Adapter.
2.  **Чистое разделение ответственности**: Domain (бизнес-правила), Application (сценарии), Adapters (внешний мир).
3.  **Тестируемость**: Каждый слой может быть протестирован независимо.
4.  **Расширяемость**: Новые пути и сценарии добавляются без изменения существующего кода.
5.  **Поддерживаемость**: Изменения в одном слое не влияют на другие слои.
