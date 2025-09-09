import { describe, it, expect } from "bun:test";
import { FsmSchema } from "../../domain/bot-persona/fsm.vo";
import { ViewMapSchema } from "../../domain/bot-persona/view-map.vo";

describe("Schema Validation Test", () => {
  it("should validate FSM schema", () => {
    const fsmData = {
      initialState: "welcome",
      states: [
        {
          id: "welcome",
          on: [{ event: "NEXT", target: "end" }],
        },
        {
          id: "end",
          on: [],
        },
      ],
    };

    console.log("Validating FSM data:", JSON.stringify(fsmData, null, 2));
    
    try {
      const result = FsmSchema.parse(fsmData);
      console.log("FSM schema validation passed");
      expect(result).toBeDefined();
      expect(result.initialState).toBe("welcome");
    } catch (error) {
      console.error("Error validating FSM schema:", error);
      throw error;
    }
  });

  it("should validate ViewMap schema", () => {
    const viewMapData = {
      nodes: [
        {
          id: "welcome",
          component: "WelcomeMessage",
          props: { text: "Hello from SotaJS Bot!" },
        },
        {
          id: "end",
          component: "GoodbyeMessage",
          props: { text: "Bye!" },
        },
      ],
    };

    console.log("Validating ViewMap data:", JSON.stringify(viewMapData, null, 2));
    
    try {
      const result = ViewMapSchema.parse(viewMapData);
      console.log("ViewMap schema validation passed");
      expect(result).toBeDefined();
      expect(result.nodes).toHaveLength(2);
    } catch (error) {
      console.error("Error validating ViewMap schema:", error);
      throw error;
    }
  });
});