import { describe, test, expect } from "bun:test";
import { createChatUseCase } from './create-chat.use-case';
import { ChatEntity } from './chat.entity';

describe('createChatUseCase', () => {
  test('should validate input correctly', async () => {
    const invalidInput = {
      id: 'invalid-uuid',
      title: '',
      participantIds: [],
    };
    
    expect(createChatUseCase(invalidInput)).rejects.toThrow();
  });
  
  test('should create chat entity correctly', () => {
    const chat = ChatEntity.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Chat',
      participantIds: ['123e4567-e89b-12d3-a456-426614174001'],
      createdAt: new Date(),
    });
    
    expect(chat.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(chat.state.title).toBe('Test Chat');
    expect(chat.state.participantIds).toEqual(['123e4567-e89b-12d3-a456-426614174001']);
  });
});