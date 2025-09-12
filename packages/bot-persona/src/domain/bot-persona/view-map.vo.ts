import { z } from "zod";

// Схемы Zod для валидации и сериализации
export const ComponentPropSchema = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.string()),
	z.array(z.number()),
	z.array(z.boolean()),
	z.record(z.string(), z.any()), // Разрешаем объекты в качестве props
]);

export const ComponentDescriptorSchema = z.object({
	id: z.string(), // ID состояния, с которым связан этот компонент
	component: z.string(),
	props: z.record(z.string(), ComponentPropSchema).optional(), // Исправлено: добавлен ключевой тип
});

export const ViewMapSchema = z.object({
	nodes: z.array(ComponentDescriptorSchema),
});

export type ViewMapDefinition = z.infer<typeof ViewMapSchema>;
export type ComponentDescriptor = z.infer<typeof ComponentDescriptorSchema>;

/**
 * ViewMap - это неизменяемый Объект-Значение (Value Object).
 * Он представляет собой "словарь", который сопоставляет состояния FSM с компонентами UI.
 */
export class ViewMap {
	private readonly nodesById: Map<string, ComponentDescriptor>;

	constructor(definition: ViewMapDefinition) {
		ViewMapSchema.parse(definition); // Валидация при создании
		this.nodesById = new Map(definition.nodes.map((n) => [n.id, n]));
	}

	public getNode(stateId: string): ComponentDescriptor | null {
		return this.nodesById.get(stateId) ?? null;
	}

	public getNodeIds(): Set<string> {
		return new Set(this.nodesById.keys());
	}
}
