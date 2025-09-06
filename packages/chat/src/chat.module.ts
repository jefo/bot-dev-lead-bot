import { ChatService } from './chat.service';
import { Persona } from './persona.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';

export class ChatModule {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  // Use case: sendMessage
  async sendMessage(chatId: string, senderId: string, content: string) {
    try {
      const message = this.chatService.sendMessage(chatId, senderId, content);
      return {
        success: true,
        data: message
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Создание персоны
  createPersona(id: string, name: string) {
    return this.chatService.createPersona(id, name);
  }

  // Создание чата
  createChat(id: string, title: string, participantIds: string[]) {
    return this.chatService.createChat(id, title, participantIds);
  }

  // Получение сообщений чата
  getChatMessages(chatId: string) {
    return this.chatService.getChatMessages(chatId);
  }
}