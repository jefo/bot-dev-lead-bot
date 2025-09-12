import { createPort } from "@maxdev1/sotajs";
import type { EventEntity } from "./event.entity";

// Определяем тип для функции-подписчика
export type Subscriber = (payload: any) => Promise<void>;

// --- Application Ports ---

// Порт для публикации события
export const publishEventPort = createPort<(topic: string, payload: Record<string, any>) => Promise<void>>();

// Порт для подписки на тему
export const subscribeToTopicPort = createPort<(topic: string, handler: Subscriber) => Promise<void>>();

// --- Domain Ports ---

// Порт для сохранения события в хранилище (если нужно)
export const eventRepositoryPort = createPort<(event: EventEntity) => Promise<void>>();
