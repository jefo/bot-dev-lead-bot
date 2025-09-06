# Graphya

A TypeScript library for creating and managing graph data structures with Domain-Driven Design (DDD) principles.

## Features

- **Node and Edge Entities**: Strongly typed entities for graph nodes and edges
- **Edge Aggregate**: Implements DDD aggregate pattern for edge relationships
- **Branded IDs**: Type-safe identifiers for nodes and edges
- **Zod Validation**: Runtime validation using Zod schemas
- **Generic Support**: Full TypeScript generic support for custom node data types
- **Immutable State**: Immutable state management for graph entities

## Installation

```bash
npm install graphya
```

## Usage

### Basic Node Creation

```typescript
import { NodeId, createNode } from 'graphya';

const node = createNode({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'My Node',
  data: { key: 'value' }
});

console.log(node.id); // Branded ID
console.log(node.name); // "My Node"
console.log(node.data); // { key: "value" }
```

### Creating Edges

```typescript
import { EdgeId, EdgeAggregate } from 'graphya';

const edgeData = {
  id: EdgeId.create('a1b2c3d4-e5f6-7890-abcd-ef1234567890').value,
  left: {
    id: NodeId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479').value,
    name: 'Node A',
    data: 'Data of Node A'
  },
  right: {
    id: NodeId.create('e8a5b5a0-5bfa-4a0e-8b0a-0e02b2c3d479').value,
    name: 'Node B',
    data: { complex: 'structure', value: 42 }
  },
  rightEdgeName: 'relatesTo',
  leftEdgeName: 'isRelatedTo'
};

const edge = EdgeAggregate.create(edgeData);
```

### Generic Edge Support

```typescript
import { createTypedEdge } from 'graphya';
import { z } from 'zod';

type User = { email: string; age: number };
type Product = { price: number; category: string };

const UserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().positive()
});

const ProductSchema = z.object({
  price: z.number().nonnegative(),
  category: z.string().min(1)
});

const UserProductEdge = createTypedEdge<User, Product>();

const edgeData = {
  id: EdgeId.create('a1b2c3d4-e5f6-7890-abcd-ef1234567890').value,
  left: {
    id: NodeId.create('f47ac10b-58cc-4372-a567-0e02b2c3d479').value,
    name: 'User Node',
    data: { email: 'user@example.com', age: 30 }
  },
  right: {
    id: NodeId.create('e8a5b5a0-5bfa-4a0e-8b0a-0e02b2c3d479').value,
    name: 'Product Node',
    data: { price: 99.99, category: 'Electronics' }
  },
  rightEdgeName: 'buys',
  leftEdgeName: 'boughtBy'
};

const edge = UserProductEdge.create(edgeData);
// TypeScript knows that edge.state.left.data is User
// and edge.state.right.data is Product
```

### Updating Edge Semantics

```typescript
edge.actions.updateSemantics({
  newLeft: 'connectsTo',
  newRight: 'isConnectedTo'
});
```

### Updating Node Data

```typescript
edge.actions.updateLeftData('New data for left node');
edge.actions.updateRightData({ updated: true, value: 100 });
```

## API Reference

### NodeId
Branded ID for graph nodes.

### EdgeId
Branded ID for graph edges.

### createNode
Factory function for creating nodes with custom data.

### EdgeAggregate
Non-generic edge aggregate implementation.

### createTypedEdge
Generic factory function for creating type-safe edge aggregates.

## License

MIT