import { painPointQuestionOutPort, relevantCaseOutPort } from '../ports/business-owner.ports';
import { createSingleChoiceStepHandler } from './generic-step.handler';

// --- Конфигурация для шага выбора НИШИ ---
const selectNicheConfig = {
  updateAction: (profile, niche) => profile.actions.setNiche(niche),
  nextStepOutPort: painPointQuestionOutPort, // После выбора ниши, спрашиваем про боль
};

export const selectNicheUseCase = createSingleChoiceStepHandler(selectNicheConfig);


// --- Конфигурация для шага выбора "БОЛИ" ---
const selectPainPointConfig = {
  updateAction: (profile, painPoint) => profile.actions.setPainPoint(painPoint),
  nextStepOutPort: relevantCaseOutPort, // После выбора боли, показываем кейс
};

export const selectPainPointUseCase = createSingleChoiceStepHandler(selectPainPointConfig);