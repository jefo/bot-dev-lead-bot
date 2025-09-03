import { createBrandedId } from '@maxdev1/sotajs/lib/branded-id';

// Создаем branded IDs для наших сущностей
export const UserId = createBrandedId('UserId');
export type UserId = InstanceType<typeof UserId>;

export const DialogSessionId = createBrandedId('DialogSessionId');
export type DialogSessionId = InstanceType<typeof DialogSessionId>;

export const MessageId = createBrandedId('MessageId');
export type MessageId = InstanceType<typeof MessageId>;