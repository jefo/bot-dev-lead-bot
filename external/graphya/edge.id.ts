import { createBrandedId } from "@maxdev1/sotajs/lib/branded-id";

// Branded ID для Edge
export const EdgeId = createBrandedId("EdgeId");
export type EdgeId = ReturnType<typeof EdgeId.create>;
