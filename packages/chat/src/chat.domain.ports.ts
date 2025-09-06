import { createPort } from '@maxdev1/sotajs';
import { Persona } from './persona.entity';
import { Chat } from './chat.entity';
import { Message } from './message.entity';

// Domain ports (work with domain entities)
export const findPersonaByIdPort = createPort<(id: string) => Promise<Persona | null>>();
export const savePersonaPort = createPort<(persona: Persona) => Promise<void>>();

export const findChatByIdPort = createPort<(id: string) => Promise<Chat | null>>();
export const saveChatPort = createPort<(chat: Chat) => Promise<void>>();

export const saveMessagePort = createPort<(message: Message) => Promise<void>>();