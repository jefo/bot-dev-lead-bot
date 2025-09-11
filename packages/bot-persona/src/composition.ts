import { setPortAdapter, resetDI } from "@maxdev1/sotajs";

// Импорт всех портов
import * as AppPorts from "./application/ports";
import * as DomainPorts from "./domain/ports";

// Импорт всех адаптеров
import * as Persistence from "./infrastructure/persistence/in-memory.adapters";
import * as Presenters from "./infrastructure/presenters/console.presenters";

// Экспортируем адаптер для тестов
export { inMemoryFindAllBotPersonasAdapter } from "./infrastructure/persistence/in-memory.adapters";

/**
 * Функция для связывания всех портов с их реализациями (адаптерами).
 * Это сердце приложения, где происходит внедрение зависимостей.
 */
export function composeApp() {
  // Очищаем контейнер перед каждой композицией (важно для тестов)
  resetDI();

  // --- Связывание портов данных ---
  setPortAdapter(DomainPorts.saveBotPersonaPort, Persistence.inMemorySaveBotPersonaAdapter);
  setPortAdapter(DomainPorts.findBotPersonaByIdPort, Persistence.inMemoryFindBotPersonaByIdAdapter);
  setPortAdapter(DomainPorts.saveConversationPort, Persistence.inMemorySaveConversationAdapter);
  setPortAdapter(DomainPorts.findActiveConversationByChatIdPort, Persistence.inMemoryFindActiveConversationByChatIdAdapter);
  setPortAdapter(DomainPorts.saveConversationModelPort, Persistence.inMemorySaveConversationModelAdapter);
  setPortAdapter(DomainPorts.findConversationModelByIdPort, Persistence.inMemoryFindConversationModelByIdAdapter);

  // --- Связывание выходных портов ---
  setPortAdapter(AppPorts.componentRenderOutPort, Presenters.consoleComponentRenderAdapter);
  setPortAdapter(AppPorts.operationFailedOutPort, Presenters.consoleFailurePresenter);
  setPortAdapter(AppPorts.conversationModelDefinedOutPort, async (dto) => {
    console.log(`--- Conversation Model Defined: ${dto.name} (ID: ${dto.modelId}) ---`);
    return Promise.resolve();
  });
  
  // Связываем остальные порты с тем же обработчиком ошибок для простоты
  setPortAdapter(AppPorts.conversationFinishedOutPort, (dto) => {
      console.log(`--- Conversation Finished for chat: ${dto.chatId} ---`)
      return Promise.resolve();
  });
  setPortAdapter(AppPorts.invalidInputOutPort, Presenters.consoleFailurePresenter);
  setPortAdapter(AppPorts.conversationNotFoundOutPort, Presenters.consoleFailurePresenter);
}
