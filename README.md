# bot-dev-lead-bot

A Telegram bot for lead generation built with SotaJS framework principles.

## Project Structure

- `packages/sotajs` - The SotaJS framework (external dependency, read-only)
- `app/bot` - The main bot application

## Bot Functionality

The bot is designed to qualify potential clients for bot development services through an interactive conversation flow:

1. Welcome message with value proposition
2. Business audit functionality with targeted questions
3. Lead capture and transfer to operators
4. Demo mode to showcase bot capabilities

## Installation

```bash
bun install
```

## Running the Bot

```bash
# Development mode
bun run dev:bot

# Production mode
bun run start:bot
```

## Testing

```bash
# Run bot tests
bun run test:bot
```

## Architecture Overview

The bot follows a clean architecture based on Domain-Driven Design and Hexagonal Architecture principles:

- **Domain Layer**: Core business entities (User, DialogSession, Message)
- **Application Layer**: Use cases and DTOs for business logic orchestration
- **Infrastructure Layer**: Adapters for external systems (Telegram API)
- **Presentation Layer**: HTTP controllers for webhook handling

All components are loosely coupled through dependency injection patterns implemented in the SotaJS framework.