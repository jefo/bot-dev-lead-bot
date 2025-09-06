// src/domain/graph/nodes-relation.aggregate.ts
import { z } from "zod";
import { createAggregate } from "@maxdev1/sotajs/lib/aggregate";
import { EdgeId } from "./edge.id";
import { NodeDataSchema } from "./node.types";

// --- Non-Generic Version ---

// 1. Базовая схема для EdgeProps с unknown для data
export const EdgePropsSchema = z.object({
	id: EdgeId.schema,
	left: NodeDataSchema,
	right: NodeDataSchema,
	rightEdgeName: z.string().min(1),
	leftEdgeName: z.string().min(1),
});

// 2. Тип для EdgeProps с unknown
export type EdgeProps = z.infer<typeof EdgePropsSchema>;

// 3. Базовый агрегат с unknown
export const EdgeAggregate = createAggregate({
	name: "EdgeAggregate",
	schema: EdgePropsSchema,
	invariants: [
		(state: EdgeProps) => {
			if (String(state.left.id) === String(state.right.id)) {
				throw new Error("Node A and Node B cannot be the same node.");
			}
		},
		(state: EdgeProps) => {
			if (
				String(state.id) === String(state.left.id) ||
				String(state.id) === String(state.right.id)
			) {
				throw new Error(
					"Edge ID cannot be the same as Node A or Node B ID.",
				);
			}
		},
	],
	actions: {
		updateSemantics: (
			state: EdgeProps,
			payload: { newLeft: string; newRight: string },
		) => {
			if (!payload.newLeft.trim() || !payload.newRight.trim()) {
				throw new Error("Semantic names cannot be empty.");
			}
			return {
				state: {
					...state,
					leftEdgeName: payload.newLeft.trim(),
					rightEdgeName: payload.newRight.trim(),
				},
			};
		},
		updateLeftData: (state: EdgeProps, newData: unknown) => {
			// Предполагаем, что newData уже валидирован вызывающим кодом
			return {
				state: {
					...state,
					left: {
						...state.left,
						data: newData,
					},
				},
			};
		},
		updateRightData: (state: EdgeProps, newData: unknown) => {
			// Предполагаем, что newData уже валидирован вызывающим кодом
			return {
				state: {
					...state,
					right: {
						...state.right,
						data: newData,
					},
				},
			};
		},
	},
});

// --- Generic Version ---

// 4. Generic factory function для создания Edge с конкретными типами данных
export const createTypedEdge = <TDataA = unknown, TDataB = unknown>() => {
	// Для generic версии мы создаем новую схему с конкретными типами данных
	// Это требует, чтобы вызывающий код передал правильные схемы Zod для TDataA и TDataB

	// Но поскольку createAggregate принимает только одну схему, мы не можем динамически изменить
	// схему для `data` внутри `left` и `right` без "обмана" TypeScript.

	// Поэтому мы будем использовать "обман" TypeScript, но с правильной валидацией на уровне вызывающего кода.
	// Это означает, что агрегат будет создан с базовой схемой (с unknown),
	// но вызывающий код будет работать с правильными типами.

	// "Обман" для типов
	type TypedEdgeProps = {
		id: string;
		left: { id: string; name: string; data: TDataA };
		right: { id: string; name: string; data: TDataB };
		leftEdgeName: string;
		rightEdgeName: string;
	};

	// Базовая схема для runtime валидации
	const runtimeSchema = EdgePropsSchema as z.ZodType<TypedEdgeProps>;

	return createAggregate({
		name: "Edge",
		schema: runtimeSchema,
		invariants: [
			(state: TypedEdgeProps) => {
				if (state.right.id === state.left.id) {
					throw new Error("Node A and Node B cannot be the same node.");
				}
			},
			(state: TypedEdgeProps) => {
				if (state.id === state.left.id || state.id === state.right.id) {
					throw new Error(
						"Edge ID cannot be the same as Node A or Node B ID.",
					);
				}
			},
		],
		actions: {
			updateSemantics: (
				state: TypedEdgeProps,
				payload: { newLeft: string; newRight: string },
			) => {
				if (!payload.newLeft.trim() || !payload.newRight.trim()) {
					throw new Error("Semantic names cannot be empty.");
				}
				return {
					state: {
						...state,
						leftEdgeName: payload.newLeft.trim(),
						rightEdgeName: payload.newRight.trim(),
					},
				};
			},
			updateLeftData: (
				state: TypedEdgeProps,
				newData: TDataA, // <-- Типизированный newData
			) => {
				// Предполагаем, что newData уже валидирован вызывающим кодом
				return {
					state: {
						...state,
						left: {
							...state.left,
							data: newData, // <-- Полная типобезопасность
						},
					},
				};
			},
			updateRightData: (
				state: TypedEdgeProps,
				newData: TDataB, // <-- Типизированный newData
			) => {
				// Предполагаем, что newData уже валидирован вызывающим кодом
				return {
					state: {
						...state,
						right: {
							...state.right,
							data: newData, // <-- Полная типобезопасность
						},
					},
				};
			},
		},
	});
};

// --- Типы ---

// 5. Тип для non-generic версии
export type EdgeAggragateType = ReturnType<typeof EdgeAggregate.create>;

// 6. Тип для generic версии. Используется как ReturnType<typeof createTypedEdge<T1, T2>>
// export type TypedEdgeType<TDataA, TDataB> = InstanceType<ReturnType<typeof createTypedEdge<TDataA, TDataB>>>;
