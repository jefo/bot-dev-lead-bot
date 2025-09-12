# PersonaForge: Architecture Overview

## Core Pattern: Hexagonal Architecture (Ports & Adapters)

The framework is designed around a set of independent, isolated "hexagons" or **Bounded Contexts**. Each context manages its own domain logic and exposes its functionality through a well-defined API (its "ports"). These contexts are then composed together in a final `Application` to form a complete system.

## The Core Contexts (The Hexagons)

### 1. `Chat` Context (Library)

- **Responsibility**: To manage the mechanics of a message exchange. Its domain is centered around `Messages`, `Participants` (`Personas`), and `Timestamps`.
- **API**: Provides use cases like `PostMessageToChatUseCase`, `AddPersonaToChatUseCase`.
- **Isolation**: It is completely agnostic of the message source or destination (Telegram, Slack, etc.) and of the nature of the participants (human or bot).

### 2. `BotPersona` Context (Library)

- **Responsibility**: To define and execute the behavior of an automated, stateful `Persona`. Its domain is centered around `FSM` (flow), `ViewMap` (presentation), and `Form` (data collection).
- **API**: Provides use cases like `DefineBotPersonaUseCase`, `ProcessEventForConversationUseCase`.
- **Isolation**: It knows nothing about the `Chat` context or any specific messaging platform. It simply receives an event and produces a result (e.g., "render this component").

### 3. `Application` Context (The Composition Root)

- **Responsibility**: This is the **"glue"** that assembles a runnable application from the framework's libraries. It is not a library itself, but the end-product built by a developer.
- **Tasks**:
    1.  **Instantiate Contexts**: It creates instances of the `Chat` context and the required `BotPersona` engines.
    2.  **Configure Adapters**: It attaches concrete infrastructure adapters to the ports of each context (e.g., wiring a `TelegramAdapter` to the `Chat` context's messaging ports).
    3.  **Orchestrate Interaction**: It writes the simple, yet crucial, logic that pipes events and data between contexts. For example: `on(chat.messageReceived) -> if(isForBot) -> botPersona.processEvent()`.

## Context Map & Relationships

- `Chat` and `BotPersona` are **independent peer contexts**. They do not know about each other.
- The `Application` context **depends on both** `Chat` and `BotPersona`, acting as a **Mediator**.
- From the `Chat`'s perspective, a `BotPersona` is just another external actor (a `Driving Actor`), identical to a human user.
- From the `BotPersona`'s perspective, the `Chat` is an external source of events. `BotPersona` is a **Consumer** of these events.
