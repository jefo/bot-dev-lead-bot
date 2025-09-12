# PersonaForge: Ubiquitous Language

This document defines the common language used across all contexts of the PersonaForge framework.

- **Core**: The top-level orchestrator responsible for managing `Application` instances.

- **Application**: A pluggable, long-running service instance. Represents a complete, configured business process (e.g., a Telegram Chat instance, a CRM sync instance).

- **Chat**: A Bounded Context responsible for the exchange of messages between participants.

- **Persona**: A participant within a `Chat`. Can be a human or a bot.

- **BotPersona**: A Bounded Context responsible for defining and executing the behavior of a robotic `Persona`.

- **FSM (Finite State Machine)**: A Value Object within the `BotPersona` context that defines the graph of states and transitions (the *control flow*).

- **ViewMap**: A Value Object within the `BotPersona` context that maps FSM states to UI components (the *presentation flow*).

- **Form Descriptor**: A schema (properties, guards) that defines the data structure for a `BotPersona`.

- **Form**: An *instance* of the data structure defined by a `FormDescriptor`, holding the data for a single `Conversation`.

- **Conversation**: A stateful, ephemeral object representing a single interaction session, managed by the `BotPersona` context.
