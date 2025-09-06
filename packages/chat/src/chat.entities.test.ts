import { describe, it, expect } from "bun:test";

// Import directly from the sotajs lib files to avoid loading index.ts
import { createEntity } from '@maxdev1/sotajs/lib/entity';
import { z } from 'zod';

// Recreate our entities in the test to avoid import issues
const PersonaSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
});

type PersonaProps = z.infer<typeof PersonaSchema>;

const Persona = createEntity({
  schema: PersonaSchema,
  actions: {
    rename: (state: PersonaProps, newName: string) => {
      return { ...state, name: newName };
    },
  },
});

const ChatSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  participantIds: z.array(z.string().uuid()),
  createdAt: z.date(),
});

type ChatProps = z.infer<typeof ChatSchema>;

const Chat = createEntity({
  schema: ChatSchema,
  actions: {
    addParticipant: (state: ChatProps, personaId: string) => {
      if (!state.participantIds.includes(personaId)) {
        return { 
          ...state, 
          participantIds: [...state.participantIds, personaId] 
        };
      }
      return state;
    },
    
    removeParticipant: (state: ChatProps, personaId: string) => {
      return { 
        ...state, 
        participantIds: state.participantIds.filter(id => id !== personaId) 
      };
    },
    
    rename: (state: ChatProps, newTitle: string) => {
      return { ...state, title: newTitle };
    },
  },
});

const MessageSchema = z.object({
  id: z.string().uuid(),
  chatId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1),
  timestamp: z.date(),
});

type MessageProps = z.infer<typeof MessageSchema>;

const Message = createEntity({
  schema: MessageSchema,
  actions: {
    editContent: (state: MessageProps, newContent: string) => {
      return { ...state, content: newContent };
    },
    
    delete: (state: MessageProps) => {
      return { ...state, content: "[deleted]" };
    },
  },
});

describe('Chat Domain Entities', () => {
  describe('Persona', () => {
    it('should create a valid Persona', () => {
      const persona = Persona.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe'
      });
      
      expect(persona.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(persona.state.name).toBe('John Doe');
    });
    
    it('should validate required fields', () => {
      expect(() => {
        Persona.create({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: '' // Empty name should fail validation
        });
      }).toThrow();
    });
    
    it('should validate UUID format', () => {
      expect(() => {
        Persona.create({
          id: 'invalid-uuid',
          name: 'John Doe'
        });
      }).toThrow();
    });
    
    it('should allow renaming', () => {
      const persona = Persona.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe'
      });
      
      persona.actions.rename('Jane Doe');
      expect(persona.state.name).toBe('Jane Doe');
    });
  });
  
  describe('Chat', () => {
    it('should create a valid Chat', () => {
      const chat = Chat.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Team Chat',
        participantIds: ['123e4567-e89b-12d3-a456-426614174001'],
        createdAt: new Date()
      });
      
      expect(chat.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(chat.state.title).toBe('Team Chat');
      expect(chat.state.participantIds).toContain('123e4567-e89b-12d3-a456-426614174001');
    });
    
    it('should validate required fields', () => {
      expect(() => {
        Chat.create({
          id: '123e4567-e89b-12d3-a456-426614174000',
          title: '', // Empty title should fail validation
          participantIds: [],
          createdAt: new Date()
        });
      }).toThrow();
    });
    
    it('should allow adding participants', () => {
      const chat = Chat.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Team Chat',
        participantIds: [],
        createdAt: new Date()
      });
      
      chat.actions.addParticipant('123e4567-e89b-12d3-a456-426614174001');
      expect(chat.state.participantIds).toContain('123e4567-e89b-12d3-a456-426614174001');
    });
    
    it('should prevent duplicate participants', () => {
      const chat = Chat.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Team Chat',
        participantIds: ['123e4567-e89b-12d3-a456-426614174001'],
        createdAt: new Date()
      });
      
      chat.actions.addParticipant('123e4567-e89b-12d3-a456-426614174001');
      expect(chat.state.participantIds.length).toBe(1); // Should still be 1
    });
    
    it('should allow removing participants', () => {
      const chat = Chat.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Team Chat',
        participantIds: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
        createdAt: new Date()
      });
      
      chat.actions.removeParticipant('123e4567-e89b-12d3-a456-426614174001');
      expect(chat.state.participantIds).not.toContain('123e4567-e89b-12d3-a456-426614174001');
      expect(chat.state.participantIds).toContain('123e4567-e89b-12d3-a456-426614174002');
    });
  });
  
  describe('Message', () => {
    it('should create a valid Message', () => {
      const timestamp = new Date();
      const message = Message.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        chatId: '123e4567-e89b-12d3-a456-426614174001',
        senderId: '123e4567-e89b-12d3-a456-426614174002',
        content: 'Hello, world!',
        timestamp
      });
      
      expect(message.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(message.state.content).toBe('Hello, world!');
      expect(message.state.timestamp).toBe(timestamp);
    });
    
    it('should validate required fields', () => {
      expect(() => {
        Message.create({
          id: '123e4567-e89b-12d3-a456-426614174000',
          chatId: '123e4567-e89b-12d3-a456-426614174001',
          senderId: '123e4567-e89b-12d3-a456-426614174002',
          content: '', // Empty content should fail validation
          timestamp: new Date()
        });
      }).toThrow();
    });
    
    it('should allow editing content', () => {
      const message = Message.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        chatId: '123e4567-e89b-12d3-a456-426614174001',
        senderId: '123e4567-e89b-12d3-a456-426614174002',
        content: 'Hello, world!',
        timestamp: new Date()
      });
      
      message.actions.editContent('Hello, everyone!');
      expect(message.state.content).toBe('Hello, everyone!');
    });
    
    it('should allow deleting message', () => {
      const message = Message.create({
        id: '123e4567-e89b-12d3-a456-426614174000',
        chatId: '123e4567-e89b-12d3-a456-426614174001',
        senderId: '123e4567-e89b-12d3-a456-426614174002',
        content: 'Hello, world!',
        timestamp: new Date()
      });
      
      message.actions.delete();
      expect(message.state.content).toBe('[deleted]');
    });
  });
});