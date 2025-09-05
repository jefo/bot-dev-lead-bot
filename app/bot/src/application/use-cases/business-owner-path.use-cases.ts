import { painPointQuestionOutPort } from '../ports/business-owner.ports';
import { createSingleChoiceStepHandler } from './generic-step.handler';

/**
 * Конфигурация для шага выбора ниши.
 */
const selectNicheConfig = {
  // Функция, которая знает, как обновить сущность. Она вызывает бизнес-метод,
  // который сам выполнит валидацию.
  updateAction: (profile, niche) => profile.actions.setNiche(niche),
  
  // Порт, который будет вызван после успешного выполнения шага
  nextStepOutPort: painPointQuestionOutPort,
};

/**
 * Use Case для выбора ниши. 
 * Является экземпляром generic-обработчика с конкретной конфигурацией.
 */
export const selectNicheUseCase = createSingleChoiceStepHandler(selectNicheConfig);
