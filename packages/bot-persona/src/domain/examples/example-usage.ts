import { createEnhancedEntity } from './enhanced-entity.factory';
import { ConversationModelDto } from './conversation-model.dto';

// Example: Define a conversation model as a JSON-serializable DTO
const conversationModelDto: ConversationModelDto = {
  name: 'TaskConversation',
  props: {
    id: { type: 'string', required: true },
    status: { type: 'string', required: true },
    title: { type: 'string', required: true, validation: { minLength: 1, maxLength: 100 } },
    description: { type: 'string', required: false },
    priority: { type: 'string', required: true },
    assignee: { type: 'string', required: false },
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  defaults: {
    status: 'new',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  guards: [
    // Prevent changing status from 'completed' to 'new'
    {
      propertyName: 'status',
      condition: {
        operator: 'eq',
        value: 'completed'
      },
      errorMessage: 'Cannot change status from completed to another value'
    },
    // Priority can only be changed if task is not completed
    {
      propertyName: 'priority',
      condition: {
        operator: 'neq',
        value: 'completed'
      },
      errorMessage: 'Cannot change priority of completed task'
    }
  ],
  transitions: [
    // Allow transition from 'new' to 'in_progress'
    {
      fromState: 'new',
      toState: 'in_progress',
      allowed: true
    },
    // Prevent transition from 'completed' to 'new'
    {
      fromState: 'completed',
      toState: 'new',
      allowed: false,
      errorMessage: 'Cannot reopen a completed task'
    },
    // Allow transition from 'in_progress' to 'completed'
    {
      fromState: 'in_progress',
      toState: 'completed',
      allowed: true
    }
  ]
};

// Define invariants (business rules that must always hold true)
const invariants = [
  // Title is required for completed tasks
  (state: any) => {
    if (state.status === 'completed' && (!state.title || state.title.length === 0)) {
      throw new Error('Completed tasks must have a title');
    }
  },
  
  // Priority must be valid
  (state: any) => {
    const validPriorities = ['low', 'medium', 'high'];
    if (state.priority && !validPriorities.includes(state.priority)) {
      throw new Error(`Invalid priority: ${state.priority}`);
    }
  }
];

// Transform the DTO into a DDD Entity class with invariants
const TaskConversationEntity = createEnhancedEntity(conversationModelDto, invariants);

// Example usage
try {
  // Create a new conversation entity from the DTO
  const conversation = TaskConversationEntity.create({
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Implement new feature',
    description: 'Need to implement the new feature for the bot',
    priority: 'high'
  });

  console.log('Initial state:', conversation.state);

  // Update properties (guards will be automatically applied)
  conversation.status = 'in_progress';
  console.log('After status update:', conversation.state);

  // Try to complete the task
  conversation.status = 'completed';
  console.log('After completion:', conversation.state);

  // Try to change priority of completed task (should fail due to guard)
  try {
    conversation.priority = 'low';
  } catch (error) {
    console.log('Guard prevented priority change:', error.message);
  }

  // Try to reopen completed task (should fail due to transition rule)
  try {
    conversation.status = 'new';
  } catch (error) {
    console.log('Transition rule prevented status change:', error.message);
  }

  // Try to create a task with invalid priority (should fail due to invariant)
  try {
    const invalidTask = TaskConversationEntity.create({
      id: 'invalid-id',
      title: 'Invalid task',
      priority: 'invalid-priority'
    });
  } catch (error) {
    console.log('Invariant prevented creation:', error.message);
  }

} catch (error) {
  console.error('Error:', error.message);
}