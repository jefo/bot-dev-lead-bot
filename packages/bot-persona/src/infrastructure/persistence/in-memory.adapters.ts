import type { BotPersonaType } from "../../domain/bot-persona/bot-persona.aggregate";
import type { ConversationType } from "../../domain/conversation/conversation.aggregate";

// Эмуляция таблиц в базе данных
export const botPersonas = new Map<string, BotPersonaType>();
export const conversations = new Map<string, ConversationType>();

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
