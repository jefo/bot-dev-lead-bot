# Enhanced Entity Framework for Bot Persona Engine

## Overview

This document describes an engineering invention that extends the SotaJS framework with enhanced entity capabilities specifically designed for the Bot Persona engine. The invention allows for the creation of powerful, expressive domain entities from simple JSON-serializable DTOs.

## Key Components

### 1. ConversationModelDto

A JSON-serializable Data Transfer Object that defines the structure and behavior of a conversation entity:

```typescript
interface ConversationModelDto {
  name: string;                    // Entity name
  props: Record<string, PropDefinition>; // Data schema
  guards: PropertyGuardRule[];     // Property update restrictions
  transitions: TransitionRule[];   // State transition rules
  defaults?: Record<string, any>;  // Default values
}
```

### 2. Enhanced Entity Factory

The `createEnhancedEntity` function transforms a `ConversationModelDto` into a full DDD Entity with:

- Automatic getters/setters for each property
- Built-in guard support for property updates
- Transition rule enforcement for state changes
- Invariant validation
- Immutability through Immer

### 3. Core Concepts

#### Guards
Property guards prevent invalid updates to entity properties based on configurable rules:

```typescript
{
  propertyName: 'status',
  condition: {
    operator: 'eq',
    value: 'completed'
  },
  errorMessage: 'Cannot change status from completed to another value'
}
```

#### Transitions
State transition rules control how entities can change states:

```typescript
{
  fromState: 'open',
  toState: 'in_progress',
  allowed: true
}
```

#### Invariants
Business rules that must always hold true for valid entity states:

```typescript
const invariants = [
  (state) => {
    if (state.status === 'completed' && !state.title) {
      throw new Error('Completed tasks must have a title');
    }
  }
];
```

## Architecture Flow

1. **Define**: Create a `ConversationModelDto` as a JSON-serializable structure
2. **Transform**: Use `createEnhancedEntity` to convert DTO into a DDD Entity class
3. **Instantiate**: Create entity instances with automatic guard and invariant enforcement
4. **Use**: Work with entities that automatically enforce all business rules

## Benefits

1. **Declarative**: Business rules are defined declaratively in DTOs
2. **Serializable**: All definitions can be stored in databases or configuration files
3. **Expressive**: Leverages the full power of DDD principles
4. **Safe**: Automatic enforcement of guards, transitions, and invariants
5. **Flexible**: Easy to modify behavior by changing DTO configurations

## Example Usage

```typescript
// Define entity behavior as DTO
const dto: ConversationModelDto = {
  name: 'SupportTicket',
  props: { /* ... */ },
  guards: [ /* ... */ ],
  transitions: [ /* ... */ ]
};

// Transform DTO into DDD Entity
const EntityClass = createEnhancedEntity(dto, invariants);

// Create and use entities with automatic rule enforcement
const entity = EntityClass.create({ /* ... */ });
entity.status = 'in_progress'; // Automatically checked against guards/transitions
```

This invention provides a powerful foundation for building sophisticated bot persona engines with strong domain modeling capabilities.