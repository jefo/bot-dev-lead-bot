import { describe, it, expect } from "bun:test";
import { ViewMapSchema } from "../../domain/bot-persona/view-map.vo";

describe("ViewMapSchema With Props Test", () => {
  it("should validate view map with string props", () => {
    const viewMap = {
      nodes: [
        {
          id: "welcome",
          component: "WelcomeMessage",
          props: { text: "Hello" },
        },
        {
          id: "end",
          component: "GoodbyeMessage",
        },
      ],
    };
    
    console.log("Validating view map with string props:", JSON.stringify(viewMap, null, 2));
    
    try {
      const result = ViewMapSchema.parse(viewMap);
      console.log("ViewMap validation passed");
      expect(result).toEqual(viewMap);
    } catch (error) {
      console.error("Error validating view map:", error);
      throw error;
    }
  });
});