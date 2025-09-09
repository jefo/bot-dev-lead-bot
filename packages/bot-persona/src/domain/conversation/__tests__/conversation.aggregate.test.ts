import { describe, it, expect, beforeEach } from "bun:test";
import { Conversation } from "../conversation.aggregate";
import { FSM } from "../../bot-persona/fsm.vo";

describe("Conversation Aggregate", () => {
  let fsm: FSM;
  
  beforeEach(() => {
    // Создаем простую FSM для тестирования
    fsm = new FSM({
      initialState: "state1",
      states: [
        {
          id: "state1",
          on: [
            { event: "EVENT1", target: "state2" },
            { event: "EVENT2", target: "state3" }
          ]
        },
        {
          id: "state2",
          on: [
            { event: "EVENT3", target: "state1" }
          ]
        },
        {
          id: "state3",
          on: []
        }
      ]
    });
  });

  it("should create a new conversation with correct initial state", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "active",
      currentStateId: "state1",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    expect(conversation.state.id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(conversation.state.botPersonaId).toBe("123e4567-e89b-12d3-a456-426614174001");
    expect(conversation.state.chatId).toBe("chat-123");
    expect(conversation.state.status).toBe("active");
    expect(conversation.state.currentStateId).toBe("state1");
  });

  it("should throw an error when creating non-active empty conversation", () => {
    expect(() => {
      Conversation.create({
        id: "123e4567-e89b-12d3-a456-426614174000",
        botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
        chatId: "chat-123",
        status: "finished",
        currentStateId: "state1",
        history: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }).toThrow("Non-active conversation cannot be empty.");
  });

  it("should process input and transition state correctly", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "active",
      currentStateId: "state1",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Сохраняем время до обновления
    const beforeUpdate = new Date();
    
    // Обрабатываем ввод
    conversation.actions.processInput(fsm, "EVENT1", {});
    
    // Проверяем, что состояние изменилось
    expect(conversation.state.currentStateId).toBe("state2");
    
    // Проверяем, что история обновлена
    expect(conversation.state.history).toHaveLength(1);
    expect(conversation.state.history[0].event).toBe("EVENT1");
    expect(conversation.state.history[0].fromState).toBe("state1");
    expect(conversation.state.history[0].toState).toBe("state2");
    
    // Проверяем, что дата обновления изменилась
    expect(conversation.state.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
  });

  it("should not change state when event is not found in FSM", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "active",
      currentStateId: "state1",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Обрабатываем несуществующее событие
    conversation.actions.processInput(fsm, "NONEXISTENT_EVENT", {});
    
    // Проверяем, что состояние не изменилось
    expect(conversation.state.currentStateId).toBe("state1");
    
    // Проверяем, что история не обновлена
    expect(conversation.state.history).toHaveLength(0);
  });

  it("should throw an error when processing input in non-active conversation", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "finished",
      currentStateId: "state1",
      history: [{
        event: "EVENT1",
        fromState: "state1",
        toState: "state2",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    expect(() => {
      conversation.actions.processInput(fsm, "EVENT1", {});
    }).toThrow("Cannot process input in a non-active conversation.");
  });

  it("should handle assign operations in transitions", () => {
    // Создаем FSM с assign
    const fsmWithAssign = new FSM({
      initialState: "state1",
      states: [
        {
          id: "state1",
          on: [
            { 
              event: "EVENT1", 
              target: "state2",
              assign: {
                "key1": "value1",
                "key2": "payload.field"
              }
            }
          ]
        },
        {
          id: "state2",
          on: []
        }
      ]
    });
    
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "active",
      currentStateId: "state1",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Обрабатываем ввод с payload
    conversation.actions.processInput(fsmWithAssign, "EVENT1", { field: "payloadValue" });
    
    // Проверяем, что контекст обновлен
    expect(conversation.state.context["key1"]).toBe("value1");
    expect(conversation.state.context["key2"]).toBe("payloadValue");
  });

  it("should finish an active conversation", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "active",
      currentStateId: "state1",
      history: [{
        event: "EVENT1",
        fromState: "state1",
        toState: "state2",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    conversation.actions.finish();
    
    expect(conversation.state.status).toBe("finished");
  });

  it("should throw an error when trying to finish a non-active conversation", () => {
    const conversation = Conversation.create({
      id: "123e4567-e89b-12d3-a456-426614174000",
      botPersonaId: "123e4567-e89b-12d3-a456-426614174001",
      chatId: "chat-123",
      status: "finished",
      currentStateId: "state1",
      history: [{
        event: "EVENT1",
        fromState: "state1",
        toState: "state2",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    expect(() => {
      conversation.actions.finish();
    }).toThrow("Only active conversations can be finished.");
  });
});