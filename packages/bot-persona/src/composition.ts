import { setPortAdapter, resetDI } from "@maxdev1/sotajs/lib/di.v2";

// Импорт всех портов
import * as AppPorts from "../application/ports";
import * as DomainPorts from "../domain/ports";

// Импорт всех адаптеров
import * as Persistence from "./persistence/in-memory.adapters";
import * as Presenters from "./presenters/console.presenters";

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

  // --- Связывание выходных портов ---
  setPortAdapter(AppPorts.componentRenderOutPort, Presenters.consoleComponentRenderAdapter);
  setPortAdapter(AppPorts.operationFailedOutPort, Presenters.consoleFailurePresenter);
  
  // Связываем остальные порты с тем же обработчиком ошибок для простоты
  setPortAdapter(AppPorts.conversationFinishedOutPort, (dto) => {
      console.log(`--- Conversation Finished for chat: ${dto.chatId} ---`)
      return Promise.resolve();
  });
  setPortAdapter(AppPorts.invalidInputOutPort, Presenters.consoleFailurePresenter);
  setPortAdapter(AppPorts.conversationNotFoundOutPort, Presenters.consoleFailurePresenter);
}
