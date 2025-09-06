// src/domain/graph/node.types.ts
import { z } from "zod";
import { NodeId as NodeIdBranded } from "./node.id"; // <-- Импортируем branded ID

// 1. Создаем генерик-функцию для NodeDataSchema
// <T extends z.ZodTypeAny> — это ограничение, которое говорит,
// что наш тип T должен быть любым валидным типом/схемой Zod.
export function createNodeDataSchema<T extends z.ZodTypeAny>(dataSchema: T) {
	return z.object({
		id: NodeIdBranded.schema, // <-- Используем branded ID
		name: z.string().min(1),
		path: z.string().optional(), // Относительный путь, опциональный
		data: dataSchema, // <-- Вот здесь используется наша динамическая схема для data!
		metadata: z.record(z.string(), z.unknown()).optional(), // Дополнительные метаданные
	});
}

// 2. Для простоты и обратной совместимости можем экспортировать версию с unknown
export const NodeDataSchema = createNodeDataSchema(z.unknown());

// 3. Выводим generic тип для NodeData
// Используем ReturnType для получения типа схемы, созданной функцией
export type NodeData<T = unknown> = z.infer<
	ReturnType<typeof createNodeDataSchema<z.ZodType<T>>>
>;

// 4. Экспортируем branded ID для удобства
export const NodeId = NodeIdBranded;
export type NodeId = ReturnType<typeof NodeIdBranded.create>;

// 5. Фабричная функция для создания NodeData с конкретным типом data
export function createNode<TData = unknown>(data: {
	id: string;
	name: string;
	path?: string; // Относительный путь, опциональный
	data: TData;
	metadata?: Record<string, unknown>;
}): NodeData<TData> {
	// Валидируем ID
	const nodeId = NodeId.create(data.id);

	// Если path не указан, строим его из name
	const path = data.path ?? `/${data.name}`;

	// Возвращаем валидированный объект
	return NodeDataSchema.parse({
		id: nodeId.value,
		name: data.name,
		path,
		data: data.data,
		metadata: data.metadata ?? {},
	}) as NodeData<TData>; // Приводим тип к NodeData<TData>
}


// --- СЕМАНТИЧЕСКИЙ СЛОЙ ---

// 1. Определяем схемы для данных (содержимого `data`) каждого семантического типа

// --- Blocks ---
export const TextBlockDataSchema = z.object({
  type: z.literal('TextBlock'),
  text: z.string(),
});

export const UserStoryBlockDataSchema = z.object({
  type: z.literal('UserStoryBlock'),
  actor: z.string(),
  action: z.string(),
});

export const TaskBlockDataSchema = z.object({
    type: z.literal('TaskBlock'),
    title: z.string(),
    completed: z.boolean().default(false),
});


// --- Containers ---
export const SheetDataSchema = z.object({
  type: z.literal('Sheet'),
  // Контейнер для блоков
});

export const DocumentDataSchema = z.object({
  type: z.literal('Document'),
  // Контейнер для листов
});

export const DirectoryDataSchema = z.object({
  type: z.literal('Directory'),
  // Контейнер для документов и других директорий
});


// 2. Создаем Discriminated Union для всех семантических типов данных
export const SemanticDataSchema = z.discriminatedUnion('type', [
  // Blocks
  TextBlockDataSchema,
  UserStoryBlockDataSchema,
  TaskBlockDataSchema,
  // Containers
  SheetDataSchema,
  DocumentDataSchema,
  DirectoryDataSchema,
]);

// 3. Создаем полную схему для семантического узла, используя нашу фабрику
export const SemanticNodeDataSchema = createNodeDataSchema(SemanticDataSchema);

// 4. Выводим типы TypeScript для удобства работы
export type TextBlockData = z.infer<typeof TextBlockDataSchema>;
export type UserStoryBlockData = z.infer<typeof UserStoryBlockDataSchema>;
export type TaskBlockData = z.infer<typeof TaskBlockDataSchema>;
export type SheetData = z.infer<typeof SheetDataSchema>;
export type DocumentData = z.infer<typeof DocumentDataSchema>;
export type DirectoryData = z.infer<typeof DirectoryDataSchema>;

export type SemanticData = z.infer<typeof SemanticDataSchema>;
export type SemanticNodeData = z.infer<typeof SemanticNodeDataSchema>;
