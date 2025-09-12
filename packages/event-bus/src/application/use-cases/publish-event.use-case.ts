import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import { EventSchema } from "../../domain/event.entity.ts";
import { eventRepositoryPort, publishEventPort } from "../../domain/ports.ts";

/**
 * Use Case для публикации события в шину.
 */
export const publishEventUseCase = async (
	topic: string,
	payload: Record<string, any>,
): Promise<void> => {
	const saveEvent = usePort(eventRepositoryPort);
	const publish = usePort(publishEventPort);

	// 1. Создаем и валидируем доменный объект события
	const event = EventSchema.parse({
		id: randomUUID(),
		topic,
		payload,
		timestamp: new Date(),
	});

	// 2. (Опционально) Сохраняем событие для аудита
	await saveEvent(event);

	// 3. Публикуем событие для подписчиков
	await publish(topic, payload);
};
