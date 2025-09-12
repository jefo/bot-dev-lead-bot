import { usePort } from "@maxdev1/sotajs";
import type { Subscriber } from "../../domain/ports.ts";
import { subscribeToTopicPort } from "../../domain/ports.ts";

/**
 * Use Case для подписки на тему в шине событий.
 */
export const subscribeToTopicUseCase = async (
	topic: string,
	handler: Subscriber,
): Promise<void> => {
	const subscribe = usePort(subscribeToTopicPort);
	await subscribe(topic, handler);
};
