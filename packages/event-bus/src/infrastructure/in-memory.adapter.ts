import { EventEntity } from "../domain/event.entity";
import { Subscriber } from "../domain/ports";

// Хранилище подписчиков в памяти (экспортируется для тестов)
export const subscriptions = new Map<string, Subscriber[]>();

// Хранилище событий в памяти (для аудита и отладки)
export const events: EventEntity[] = [];

// Адаптер для порта публикации
export const inMemoryPublishEventAdapter = async (
	topic: string,
	payload: Record<string, any>,
): Promise<void> => {
	const handlers = subscriptions.get(topic) || [];
	console.log(
		`[EventBus]: Publishing event '${topic}'. Found ${handlers.length} subscribers.`,
	);
	// Вызываем всех подписчиков параллельно
	await Promise.all(handlers.map((handler) => handler(payload)));
};

// Адаптер для порта подписки
export const inMemorySubscribeToTopicAdapter = async (
	topic: string,
	handler: Subscriber,
): Promise<void> => {
	console.log(`[EventBus]: New subscription for topic '${topic}'.`);
	const handlers = subscriptions.get(topic) || [];
	if (!handlers.includes(handler)) {
		subscriptions.set(topic, [...handlers, handler]);
	}
};

// Адаптер для репозитория событий
export const inMemoryEventRepositoryAdapter = async (
	event: EventEntity,
): Promise<void> => {
	events.push(event);
};
