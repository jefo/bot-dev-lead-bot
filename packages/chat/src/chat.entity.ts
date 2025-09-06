import { createEntity } from '@maxdev1/sotajs';
import { z } from 'zod';

// Chat Entity
const ChatSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  participantIds: z.array(z.string().uuid()),
  createdAt: z.date(),
});

type ChatProps = z.infer<typeof ChatSchema>;

export const Chat = createEntity({
  schema: ChatSchema,
  actions: {
    addParticipant: (state: ChatProps, personaId: string) => {
      if (!state.participantIds.includes(personaId)) {
        return { 
          ...state, 
          participantIds: [...state.participantIds, personaId] 
        };
      }
      return state;
    },
    
    removeParticipant: (state: ChatProps, personaId: string) => {
      return { 
        ...state, 
        participantIds: state.participantIds.filter(id => id !== personaId) 
      };
    },
    
    rename: (state: ChatProps, newTitle: string) => {
      return { ...state, title: newTitle };
    },
  },
});