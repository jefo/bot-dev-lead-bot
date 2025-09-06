// src/domain/graph/ports.ts

// TODO: This is a temporary path. We need to set up a proper path alias for @sota/core
import { createPort } from "@maxdev1/sotajs/lib/di.v2";
import { NodeId, type SemanticNodeData } from "./node.types";
import {
	EdgeAggregate,
	type EdgeProps,
	type EdgeAggragateType,
} from "./edge.aggregate";

// --- READ PORTS ---

/**
 * A port for finding a single node by its ID.
 */
export const findNodeByIdPort =
	createPort<(nodeId: NodeId) => Promise<SemanticNodeData | null>>();

/**
 * A port for finding all direct child relations of a given node.
 */
export const findChildRelationsPort =
	createPort<(nodeId: NodeId) => Promise<EdgeProps[]>>();

// --- WRITE PORTS ---

/**
 * A port for creating or updating a single node.
 */
export const saveNodePort =
	createPort<(nodeData: SemanticNodeData) => Promise<void>>();

/**
 * A port for creating or updating a single relation.
 */
export const saveRelationPort =
	createPort<(relation: EdgeAggragateType) => Promise<void>>();
