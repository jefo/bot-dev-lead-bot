import { test, expect } from "bun:test";

// Import directly from the entity file, not from index.ts
import { createEntity } from '@maxdev1/sotajs/lib/entity';
import { z } from 'zod';

test('test direct import from sotajs lib', () => {
  // Define a simple schema
  const TestSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
  });

  type TestProps = z.infer<typeof TestSchema>;

  // Create entity using direct import
  const TestEntity = createEntity({
    schema: TestSchema,
    actions: {
      rename: (state: TestProps, newName: string) => {
        return { ...state, name: newName };
      },
    },
  });
  
  // Test that it works
  const entity = TestEntity.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Name'
  });
  
  expect(entity.id).toBe('123e4567-e89b-12d3-a456-426614174000');
  expect(entity.state.name).toBe('Test Name');
  
  // Call the action to get a new entity with updated state
  entity.actions.rename('New Name');
  // Note: actions don't modify the entity in place, they return new state
  // To get the updated state, we need to call the action and use the result
  
  // Actually, looking at the sotajs tests, it seems actions modify the entity in place
  // Let's recheck the entity state
  expect(entity.state.name).toBe('Test Name'); // Should still be the original name
  
  // Let's look at how the sotajs tests work with actions
  const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    email: z.string().email(),
    isActive: z.boolean().default(true),
  });
  
  type UserProps = z.infer<typeof UserSchema>;
  
  const User = createEntity({
    schema: UserSchema,
    actions: {
      updateName: (state: UserProps, newName: string) => {
        return { ...state, name: newName };
      },
      updateEmail: (state: UserProps, newEmail: string) => {
        return { ...state, email: newEmail };
      },
      deactivate: (state: UserProps) => {
        return { ...state, isActive: false };
      },
    },
  });
  
  const user = User.create({
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'John Doe',
    email: 'john.doe@example.com',
    isActive: true,
  });
  
  expect(user.state.name).toBe('John Doe');
  
  // According to sotajs tests, actions modify the entity in place
  user.actions.updateName('Jane Doe');
  expect(user.state.name).toBe('Jane Doe');
});