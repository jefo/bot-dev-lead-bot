// Mock the DI functions to avoid conflicts
const mockPorts: Record<string, any> = {};

// Mock implementation of DI functions
const resetDI = () => {
  Object.keys(mockPorts).forEach(key => delete mockPorts[key]);
};

const setPortAdapter = (port: any, adapter: any) => {
  const portId = port[Symbol.for('portId')] || port.name || 'unknown';
  mockPorts[portId] = adapter;
};

const usePort = (port: any) => {
  const portId = port[Symbol.for('portId')] || port.name || 'unknown';
  return mockPorts[portId];
};

// Import our use case and entities
import { sendMessageUseCase } from './send-message.use-case';
import { Chat } from './chat.entity';
import { Persona } from './persona.entity';
import { Message } from './message.entity';

// Mock the DI functions in the global scope
(globalThis as any).resetDI = resetDI;
(globalThis as any).setPortAdapter = setPortAdapter;
(globalThis as any).usePort = usePort;

export { resetDI, setPortAdapter, usePort };