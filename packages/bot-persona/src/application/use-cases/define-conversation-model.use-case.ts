import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import type { EntityDescriptor } from "../../domain/conversation/entity.descriptor";
import {
	conversationModelDefinedOutPort,
	operationFailedOutPort,
} from "../ports";
import { saveConversationModelPort } from "../../domain/ports";

/**
 * Use Case для определения новой модели разговора.
 * Принимает DTO с AJV схемой и правилами, сохраняет её и уведомляет об успехе.
 */
export async function defineConversationModelUseCase(
	dto: EntityDescriptor,
): Promise<void> {
	const saveConversationModel = usePort(saveConversationModelPort);
	const modelDefined = usePort(conversationModelDefinedOutPort);
	const operationFailed = usePort(operationFailedOutPort);

	try {
		// Генерируем ID для новой модели
		const modelId = randomUUID();

		// Создаем объект модели для сохранения
		const model = {
			id: modelId,
			...dto,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Сохраняем модель
		await saveConversationModel(model);

		// Уведомляем об успехе
		await modelDefined({
			modelId: model.id,
			name: model.name,
		});
	} catch (error: any) {
		await operationFailed({
			chatId: "system", // Системное сообщение
			reason: `Failed to define conversation model: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
