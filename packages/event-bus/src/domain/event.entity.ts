import { z } from "zod";

// Используем Zod для валидации структуры события
export const EventSchema = z.object({
	id: z.string().uuid(),
	topic: z.string().min(1),
	// Исправлено: z.record принимает тип ключа и тип значения
	payload: z.record(z.string(), z.any()),
	timestamp: z.date(),
	metadata: z.record(z.string(), z.any()).optional(),
});

// Название типа сохранено как EventEntity во избежание коллизий
export type EventEntity<T extends Record<string, any> = Record<string, any>> =
	Omit<z.infer<typeof EventSchema>, "payload"> & {
		payload: T;
	};
