import { createEnhancedEntity } from './enhanced-entity.factory';
import { ConversationModelDto } from './conversation-model.dto';

/**
 * Complete example showing the transformation from DTO to Entity
 * This demonstrates the full flow of how a JSON-serializable DTO
 * can be transformed into a powerful DDD Entity with guards, transitions, and invariants
 */

// Step 1: Define the conversation model as a JSON-serializable DTO
// This could come from a database, API, or configuration file
const conversationModelDto: ConversationModelDto = {
  name: 'SupportTicket',
  props: {
    id: { type: 'string', required: true },
    status: { type: 'string', required: true },
    title: { type: 'string', required: true, validation: { minLength: 1, maxLength: 200 } },
    description: { type: 'string', required: false },
    priority: { type: 'string', required: true },
    assignee: { type: 'string', required: false },
    customerId: { type: 'string', required: true },
    createdAt: { type: 'date', required: true },
    updatedAt: { type: 'date', required: true }
  },
  defaults: {
    status: 'open',
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  guards: [
    // Cannot change assignee of closed tickets
    {
      propertyName: 'assignee',
      condition: {
        operator: 'neq',
        value: 'closed'
      },
      errorMessage: 'Cannot change assignee of closed tickets'
    },
    // Priority can only be escalated, not de-escalated
    {
      propertyName: 'priority',
      condition: {
        operator: 'in',
        value: ['low', 'medium', 'high']
      },
      errorMessage: 'Priority must be low, medium, or high'
    }
  ],
  transitions: [
    // Normal workflow transitions
    { fromState: 'open', toState: 'in_progress', allowed: true },
    { fromState: 'in_progress', toState: 'resolved', allowed: true },
    { fromState: 'resolved', toState: 'closed', allowed: true },
    
    // Prevent invalid transitions
    { fromState: 'closed', toState: 'open', allowed: false, errorMessage: 'Cannot reopen closed tickets' },
    { fromState: 'resolved', toState: 'open', allowed: false, errorMessage: 'Cannot reopen resolved tickets' }
  ]
};

// Step 2: Define business invariants (rules that must always hold true)
const supportTicketInvariants = [
  // Resolved tickets must have an assignee
  (state: any) => {
    if (state.status === 'resolved' && (!state.assignee || state.assignee.length === 0)) {
      throw new Error('Resolved tickets must have an assignee');
    }
  },
  
  // Closed tickets must have a description
  (state: any) => {
    if (state.status === 'closed' && (!state.description || state.description.length === 0)) {
      throw new Error('Closed tickets must have a description explaining the resolution');
    }
  },
  
  // High priority tickets cannot remain unassigned for long
  (state: any) => {
    if (state.priority === 'high' && !state.assignee && 
        new Date().getTime() - new Date(state.createdAt).getTime() > 24 * 60 * 60 * 1000) {
      throw new Error('High priority tickets must be assigned within 24 hours');
    }
  }
];

// Step 3: Transform the DTO into a DDD Entity class
const SupportTicketEntity = createEnhancedEntity(conversationModelDto, supportTicketInvariants);

// Step 4: Use the Entity in practice
console.log('=== Support Ticket System Demo ===\n');

try {
  // Create a new support ticket
  const ticket = SupportTicketEntity.create({
    id: 'ticket-001',
    title: 'Cannot login to the application',
    customerId: 'customer-123',
    priority: 'high'
  });

  console.log('1. Created new ticket:');
  console.log(JSON.stringify(ticket.state, null, 2));

  // Assign the ticket
  ticket.assignee = 'support-agent-456';
  console.log('\n2. After assigning to agent:');
  console.log(JSON.stringify(ticket.state, null, 2));

  // Start working on the ticket
  ticket.status = 'in_progress';
  console.log('\n3. After starting work:');
  console.log(JSON.stringify(ticket.state, null, 2));

  // Try to resolve the ticket
  ticket.description = 'Issue resolved by resetting password';
  ticket.status = 'resolved';
  console.log('\n4. After resolving:');
  console.log(JSON.stringify(ticket.state, null, 2));

  // Close the ticket
  ticket.status = 'closed';
  console.log('\n5. After closing:');
  console.log(JSON.stringify(ticket.state, null, 2));

  // Try to violate a guard (change assignee of closed ticket)
  console.log('\n6. Trying to violate guard (change assignee of closed ticket):');
  try {
    ticket.assignee = 'another-agent';
  } catch (error) {
    console.log('   Guard prevented action:', error.message);
  }

  // Try to violate a transition rule (reopen closed ticket)
  console.log('\n7. Trying to violate transition rule (reopen closed ticket):');
  try {
    ticket.status = 'open';
  } catch (error) {
    console.log('   Transition rule prevented action:', error.message);
  }

  // Try to violate an invariant (create ticket with invalid priority)
  console.log('\n8. Trying to violate invariant (create ticket with invalid priority):');
  try {
    const invalidTicket = SupportTicketEntity.create({
      id: 'ticket-002',
      title: 'Another issue',
      customerId: 'customer-456',
      priority: 'invalid-priority'
    });
  } catch (error) {
    console.log('   Invariant prevented creation:', error.message);
  }

} catch (error) {
  console.error('Error:', error.message);
}

console.log('\n=== Demo Complete ===');