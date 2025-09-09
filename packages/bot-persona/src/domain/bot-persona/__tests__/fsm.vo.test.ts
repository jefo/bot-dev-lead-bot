import { describe, it, expect } from "bun:test";
import { FSM, type FsmDefinition } from "../fsm.vo";

describe("FSM (Finite State Machine)", () => {
  const validFsmDefinition: FsmDefinition = {
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
  };

  it("should create an FSM instance with valid definition", () => {
    const fsm = new FSM(validFsmDefinition);
    expect(fsm).toBeInstanceOf(FSM);
    expect(fsm.initialState).toBe("state1");
  });

  it("should throw an error if initialState is not found in states", () => {
    const invalidDefinition: FsmDefinition = {
      initialState: "nonexistent",
      states: [
        { id: "state1", on: [] }
      ]
    };
    
    expect(() => new FSM(invalidDefinition)).toThrow(
      "FSM invariant failed: initialState 'nonexistent' not found."
    );
  });

  it("should throw an error if transition target is not found in states", () => {
    const invalidDefinition: FsmDefinition = {
      initialState: "state1",
      states: [
        {
          id: "state1",
          on: [{ event: "EVENT1", target: "nonexistent" }]
        }
      ]
    };
    
    expect(() => new FSM(invalidDefinition)).toThrow(
      "FSM invariant failed: transition target 'nonexistent' from state 'state1' not found."
    );
  });

  it("should find a transition by event", () => {
    const fsm = new FSM(validFsmDefinition);
    const transition = fsm.findTransition("state1", "EVENT1");
    
    expect(transition).toEqual({
      event: "EVENT1",
      target: "state2"
    });
  });

  it("should return null if transition is not found", () => {
    const fsm = new FSM(validFsmDefinition);
    const transition = fsm.findTransition("state1", "NONEXISTENT_EVENT");
    
    expect(transition).toBeNull();
  });

  it("should return null if fromStateId is not found", () => {
    const fsm = new FSM(validFsmDefinition);
    const transition = fsm.findTransition("nonexistent", "EVENT1");
    
    expect(transition).toBeNull();
  });

  it("should handle transitions with assign", () => {
    const fsmDefinitionWithAssign: FsmDefinition = {
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
    };
    
    const fsm = new FSM(fsmDefinitionWithAssign);
    const transition = fsm.findTransition("state1", "EVENT1");
    
    expect(transition).toEqual({
      event: "EVENT1",
      target: "state2",
      assign: {
        "key1": "value1",
        "key2": "payload.field"
      }
    });
  });
});