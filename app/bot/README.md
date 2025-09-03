# Bot for Lead Generation

This is a Telegram bot designed to generate leads for bot development services. It follows the SotaJS framework principles with a clean architecture based on Domain-Driven Design and Hexagonal Architecture.

## Architecture

The bot follows a clean architecture where:

1. **Driving Adapters** (Telegram webhook) consume Use Cases
2. **Use Cases** orchestrate business logic and return platform-agnostic DTOs
3. **Domain Entities** contain the business logic
4. **Driving Adapters** transform platform-agnostic DTOs to platform-specific format
5. **External Systems** (Telegram API) receive platform-specific data

```
[Telegram API] 
      ↓ (platform-specific data)
[Telegram Driving Adapter] 
      ↓ (transform to platform-agnostic)
[Use Cases] 
      ↓ (return platform-agnostic DTOs)
[Domain Entities] 
      ↓ (business logic)
[Telegram Driving Adapter] 
      ↓ (transform to platform-specific)
[Telegram API] 
```

## Data Flow

1. **Telegram API** sends platform-specific webhook to **Telegram Driving Adapter**
2. **Telegram Driving Adapter** transforms webhook data to platform-agnostic DTO
3. **Telegram Driving Adapter** calls appropriate **Use Case** with platform-agnostic data
4. **Use Case** orchestrates business logic using **Domain Entities**
5. **Use Case** returns platform-agnostic DTO (SingleChoiceDto, InfoMessageDto, etc.)
6. **Telegram Driving Adapter** transforms platform-agnostic DTO to Telegram-specific format
7. **Telegram Driving Adapter** sends response to **Telegram API**

## Key Components

### Domain Entities

- **User**: Represents a bot user with platform-specific information and business logic
- **DialogSession**: Manages conversation state, context, and business rules
- **Message**: Represents individual messages in a conversation

### Use Cases (Pure Orchestration)

- **handleUserActionUseCase**: Main orchestrator for handling all user actions
  - Returns: `SingleChoiceDto | InfoMessageDto | DialogEndDto | null`

### Platform-agnostic DTOs

All DTOs are platform-agnostic:
- `SingleChoiceDto` - For single choice questions
- `MultiChoiceDto` - For multiple choice questions
- `FreeTextDto` - For free text input
- `InfoMessageDto` - For informational messages
- `DialogEndDto` - For dialog completion
- `TransferToOperatorDto` - For operator handoff

### Driving Adapter Transformation

**Input Transformation** (Telegram → Platform-agnostic):
- Telegram webhook → `IncomingUserActionDto`

**Output Transformation** (Platform-agnostic → Telegram):
- `SingleChoiceDto` → Telegram message with inline keyboard
- `InfoMessageDto` → Telegram text message
- `DialogEndDto` → Telegram summary message

## Example Flow

1. User sends "/start" to Telegram bot
2. Telegram sends webhook to `/webhook/telegram`
3. `telegramDrivingAdapter` transforms webhook to `IncomingUserActionDto`
4. `telegramDrivingAdapter` calls `handleUserActionUseCase`
5. `handleUserActionUseCase` returns `SingleChoiceDto` with welcome options
6. `telegramDrivingAdapter` transforms `SingleChoiceDto` to Telegram message with buttons
7. `telegramDrivingAdapter` sends response to Telegram API
8. User sees message with buttons in Telegram

This architecture ensures:
- Business logic is pure and testable with platform-agnostic DTOs
- Platform-specific concerns are isolated in driving adapters
- Easy to add new platforms (WhatsApp, Web, etc.) by adding new driving adapters
- Easy to test use cases with mock data
- Clear separation of concerns and unidirectional data flow