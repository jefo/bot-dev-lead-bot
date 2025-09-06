// src/domain/graph/node.id.ts

import type z from "zod";
import { createBrandedId } from "@maxdev1/sotajs/lib/branded-id";

export const NodeId = createBrandedId("NodeId");
export type NodeId = ReturnType<typeof NodeId.create>;
