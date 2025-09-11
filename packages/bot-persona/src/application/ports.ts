import { createPort } from "@maxdev1/sotajs";
import type { ComponentRenderDto, FailureDto } from "./dtos";

// --- Выходные Порты (Output Ports) ---
// Определяются в application, так как описывают реакции приложения на результат выполнения use case.

export const componentRenderOutPort =
	createPort<(dto: ComponentRenderDto) => Promise<void>>();
export const conversationFinishedOutPort =
	createPort<(dto: { chatId: string }) => Promise<void>>();
export const invalidInputOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();
export const conversationNotFoundOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();
export const operationFailedOutPort =
	createPort<(dto: FailureDto) => Promise<void>>();

// New port for conversation model definition
export const conversationModelDefinedOutPort =
	createPort<(dto: { modelId: string; name: string }) => Promise<void>>();
