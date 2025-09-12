import { describe, it, expect, beforeEach, jest } from "bun:test";
import { setPortAdapter, resetDI } from "@maxdev1/sotajs";
import {
	eventRepositoryPort,
	publishEventPort,
	subscribeToTopicPort,
} from "./domain/ports";
import {
	events,
	inMemoryEventRepositoryAdapter,
	inMemoryPublishEventAdapter,
	inMemorySubscribeToTopicAdapter,
	subscriptions,
} from "./infrastructure/in-memory.adapter";
import { subscribeToTopicUseCase } from "./application/use-cases/subscribe-to-topic.use-case";
import { publishEventUseCase } from "./application/use-cases/publish-event.use-case";

// --- Composition Root для тестов ---
function composeEventBus() {
	setPortAdapter(publishEventPort, inMemoryPublishEventAdapter);
	setPortAdapter(subscribeToTopicPort, inMemorySubscribeToTopicAdapter);
	setPortAdapter(eventRepositoryPort, inMemoryEventRepositoryAdapter);
}

describe("EventBus Integration Test", () => {
	beforeEach(() => {
		// Полная очистка перед каждым тестом
		resetDI();
		subscriptions.clear();
		events.length = 0;
		composeEventBus();
	});

	it("should allow a subscriber to receive an event on a specific topic", async () => {
		// Arrange
		const topic = "user.created";
		const handler = jest.fn(async (payload) => {});
		await subscribeToTopicUseCase(topic, handler);

		const eventPayload = { userId: "user-123", name: "John Doe" };

		// Act
		await publishEventUseCase(topic, eventPayload);

		// Assert
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler).toHaveBeenCalledWith(eventPayload);
	});

	it("should not notify subscribers of different topics", async () => {
		// Arrange
		const topicA = "orders.created";
		const topicB = "invoices.paid";

		const handlerA = jest.fn(async (payload) => {});
		const handlerB = jest.fn(async (payload) => {});

		await subscribeToTopicUseCase(topicA, handlerA);
		await subscribeToTopicUseCase(topicB, handlerB);

		// Act: Публикуем событие только в topicA
		await publishEventUseCase(topicA, { orderId: "order-1" });

		// Assert
		expect(handlerA).toHaveBeenCalledTimes(1);
		expect(handlerB).not.toHaveBeenCalled();
	});

	it("should notify all subscribers for a given topic", async () => {
		// Arrange
		const topic = "product.updated";
		const handler1 = jest.fn(async (payload) => {});
		const handler2 = jest.fn(async (payload) => {});

		await subscribeToTopicUseCase(topic, handler1);
		await subscribeToTopicUseCase(topic, handler2);

		const eventPayload = { productId: "prod-456" };

		// Act
		await publishEventUseCase(topic, eventPayload);

		// Assert
		expect(handler1).toHaveBeenCalledTimes(1);
		expect(handler1).toHaveBeenCalledWith(eventPayload);
		expect(handler2).toHaveBeenCalledTimes(1);
		expect(handler2).toHaveBeenCalledWith(eventPayload);
	});

	it("should save the event to the repository upon publishing", async () => {
		// Arrange
		const topic = "payment.succeeded";
		const eventPayload = { transactionId: "txn-789" };
		expect(events.length).toBe(0);

		// Act
		await publishEventUseCase(topic, eventPayload);

		// Assert
		expect(events.length).toBe(1);
		const savedEvent = events[0];
		expect(savedEvent.topic).toBe(topic);
		expect(savedEvent.payload).toEqual(eventPayload);
	});
});
