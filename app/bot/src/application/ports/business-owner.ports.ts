import { createPort } from '@maxdev1/sotajs/lib/di.v2';

// Порт для отображения вопроса о "боли" клиента
export const painPointQuestionOutPort = createPort<(output: { telegramId: number }) => Promise<void>>();

// TODO: Добавить другие порты для этого пути по мере необходимости
