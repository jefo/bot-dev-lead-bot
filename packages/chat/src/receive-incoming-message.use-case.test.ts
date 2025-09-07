import { beforeEach, describe, expect, it, jest } from 'bun:test';
import { resetDI, setPortAdapter } from '@maxdev1/sotajs/lib/di.v2';
import { randomUUID } from 'crypto';
import {
  Chat,
  Persona,
  createChatUseCase,
  createPersonaUseCase,
  findChatByIdPort,
  findPersonaByIdPort,
  messageSentOutPort,
  receiveIncomingMessageUseCase,
  saveChatPort,
  saveMessagePort,
  savePersonaPort,
} from './index';

// --- Mocks & Spies ---
const memoryPersonas = new Map<string, InstanceType<typeof Persona>>();
const memoryChats = new Map<string, InstanceType<typeof Chat>>();

const mockSavePersonaPort = jest.fn(async (p) => { memoryPersonas.set(p.id, p); });
const mockSaveChatPort = jest.fn(async (c) => { memoryChats.set(c.id, c); });
const mockSaveMessagePort = jest.fn();
const mockMessageSentOutPort = jest.fn();

describe('receiveIncomingMessageUseCase Integration Test', () => {

  beforeEach(() => {
    resetDI();
    memoryPersonas.clear();
    memoryChats.clear();
    mockSavePersonaPort.mockClear();
    mockSaveChatPort.mockClear();
    mockSaveMessagePort.mockClear();
    mockMessageSentOutPort.mockClear();

    // --- Composition Root (локальный для теста) ---
    setPortAdapter(findPersonaByIdPort, async (id) => memoryPersonas.get(id) || null);
    setPortAdapter(findChatByIdPort, async (id) => memoryChats.get(id) || null);
    setPortAdapter(savePersonaPort, mockSavePersonaPort);
    setPortAdapter(saveChatPort, mockSaveChatPort);
    setPortAdapter(saveMessagePort, mockSaveMessagePort);
    setPortAdapter(messageSentOutPort, mockMessageSentOutPort);
  });

  it('should create a new Persona and Chat for a first-time message', async () => {
    // Arrange: База данных пуста
    const input = {
      chatId: 'telegram:chat-123',
      personaId: 'telegram:persona-456',
      personaName: 'John Doe',
      text: 'Hello, world!',
    };

    // Act: Получаем первое сообщение
    await receiveIncomingMessageUseCase(input);

    // Assert
    // 1. Были вызваны сохранения для новой Персоны и нового Чата
    expect(mockSavePersonaPort).toHaveBeenCalledTimes(1);
    expect(mockSaveChatPort).toHaveBeenCalledTimes(1);

    // 2. В "базе данных" появились нужные записи
    expect(memoryPersonas.has('telegram:persona-456')).toBe(true);
    expect(memoryChats.has('telegram:chat-123')).toBe(true);
    const chatInDb = memoryChats.get('telegram:chat-123');
    expect(chatInDb?.state.participantIds).toContain('telegram:persona-456');

    // 3. Сообщение было сохранено и отправлено в порт вывода
    expect(mockSaveMessagePort).toHaveBeenCalledTimes(1);
    expect(mockMessageSentOutPort).toHaveBeenCalledTimes(1);
    expect(mockMessageSentOutPort).toHaveBeenCalledWith(expect.objectContaining({
      content: 'Hello, world!',
      senderId: 'telegram:persona-456',
    }));
  });

  it('should use existing Persona and Chat for a subsequent message', async () => {
    // Arrange: Предварительно создаем Персону и Чат
    const personaId = 'telegram:persona-789';
    const chatId = 'telegram:chat-101';
    await createPersonaUseCase({ id: personaId, name: 'Jane Doe' });
    await createChatUseCase({ id: chatId, title: 'Existing Chat', participantIds: [personaId] });

    // Очищаем моки после аранжировки, чтобы проверять только основной вызов
    mockSavePersonaPort.mockClear();
    mockSaveChatPort.mockClear();

    const input = {
      chatId: chatId,
      personaId: personaId,
      personaName: 'Jane Doe',
      text: 'Hello again!',
    };

    // Act: Получаем второе сообщение
    await receiveIncomingMessageUseCase(input);

    // Assert
    // 1. НЕ были вызваны сохранения для Персоны и Чата
    expect(mockSavePersonaPort).not.toHaveBeenCalled();
    expect(mockSaveChatPort).not.toHaveBeenCalled();

    // 2. Сообщение было обработано и отправлено
    expect(mockSaveMessagePort).toHaveBeenCalledTimes(1);
    expect(mockMessageSentOutPort).toHaveBeenCalledTimes(1);
    expect(mockMessageSentOutPort).toHaveBeenCalledWith(expect.objectContaining({
      content: 'Hello again!',
    }));
  });
});
