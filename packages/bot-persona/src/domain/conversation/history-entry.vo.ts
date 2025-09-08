import { z } from "zod";

export const HistoryEntrySchema = z.object({
	event: z.string(),
	fromState: z.string(),
	toState: z.string(),
	timestamp: z.date(),
});

export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;
