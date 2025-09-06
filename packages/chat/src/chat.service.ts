import { Persona } from './persona.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';

export class ChatService {
  private personas: Map<string, InstanceType<typeof Persona>> = new Map();
  private chats: Map<string, InstanceType<typeof Chat>> = new Map();
  private messages: Map<string, InstanceType<typeof Message>> = new Map();

  // Создание персоны
  createPersona(id: string, name: string) {
    const persona = Persona.create({ id, name });
    this.personas.set(id, persona);
    return persona;
  }

  // Создание чата
  createChat(id: string, title: string, participantIds: string[]) {
    const chat = Chat.create({ 
      id, 
      title, 
      participantIds, 
      createdAt: new Date() 
    });
    this.chats.set(id, chat);
    return chat;
  }

  // Отправка сообщения
  sendMessage(chatId: string, senderId: string, content: string) {
    // Проверяем существование чата и отправителя
    const chat = this.chats.get(chatId);
    const sender = this.personas.get(senderId);
    
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`);
    }
    
    if (!sender) {
      throw new Error(`Persona with id ${senderId} not found`);
    }
    
    // Проверяем, что отправитель является участником чата
    if (!chat.state.participantIds.includes(senderId)) {
      throw new Error(`Persona ${senderId} is not a participant of chat ${chatId}`);
    }
    
    // Создаем сообщение
    const messageId = this.generateId();
    const message = Message.create({
      id: messageId,
      chatId,
      senderId,
      content,
      timestamp: new Date()
    });
    
    this.messages.set(messageId, message);
    return message;
  }

  // Получение сообщений чата
  getChatMessages(chatId: string) {
    const messages: InstanceType<typeof Message>[] = [];
    for (const message of this.messages.values()) {
      if (message.state.chatId === chatId) {
        messages.push(message);
      }
    }
    return messages.sort((a, b) => a.state.timestamp.getTime() - b.state.timestamp.getTime());
  }

  // Вспомогательный метод для генерации ID (в реальной реализации можно использовать библиотеку)
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}