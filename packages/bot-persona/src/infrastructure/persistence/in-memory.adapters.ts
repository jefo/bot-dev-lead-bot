import type { BotPersonaType } from "../../domain/bot-persona/bot-persona.aggregate";
import type { ConversationType } from "../../domain/conversation/conversation.aggregate";
import type { ConversationModel } from "../../domain/conversation/conversation-model.type";

// Эмуляция таблиц в базе данных
export const botPersonas = new Map<string, BotPersonaType>();
export const conversations = new Map<string, ConversationType>();
export const conversationModels = new Map<string, ConversationModel>();

// --- Адаптеры для BotPersona ---

export const inMemorySaveBotPersonaAdapter = async (persona: BotPersonaType): Promise<void> => {
  botPersonas.set(persona.state.id, persona);
};

export const inMemoryFindBotPersonaByIdAdapter = async (id: string): Promise<BotPersonaType | null> => {
  return botPersonas.get(id) ?? null;
};

// Адаптер для тестов - возвращает все botPersonas
export const inMemoryFindAllBotPersonasAdapter = async (): Promise<Map<string, BotPersonaType>> => {
  return botPersonas;
};

// --- Адаптеры для Conversation ---

export const inMemorySaveConversationAdapter = async (conversation: ConversationType): Promise<void> => {
  conversations.set(conversation.state.id, conversation);
};

export const inMemoryFindActiveConversationByChatIdAdapter = async (chatId: string): Promise<ConversationType | null> => {
  for (const conv of conversations.values()) {
    if (conv.state.chatId === chatId && conv.state.status === "active") {
      return conv;
    }
  }
  return null;
};

// --- Адаптеры для Conversation Model ---

export const inMemorySaveConversationModelAdapter = async (model: ConversationModel): Promise<void> => {
  conversationModels.set(model.id, model);
};

export const inMemoryFindConversationModelByIdAdapter = async (id: string): Promise<ConversationModel | null> => {
  return conversationModels.get(id) ?? null;
};
