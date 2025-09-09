import { describe, it, expect } from "bun:test";
import { ViewMapSchema } from "../../domain/bot-persona/view-map.vo";

describe("ViewMapSchema Test", () => {
  it("should validate view map with empty props", () => {
    const viewMap = {
      nodes: [
        {
          id: "welcome",
          component: "WelcomeMessage",
          props: {},
        },
        {
          id: "end",
          component: "GoodbyeMessage",
        },
      ],
    };
    
    console.log("Validating view map with empty props:", JSON.stringify(viewMap, null, 2));
    
    try {
      const result = ViewMapSchema.parse(viewMap);
      console.log("ViewMap validation passed");
      expect(result).toEqual(viewMap);
    } catch (error) {
      console.error("Error validating view map:", error);
      throw error;
    }
  });

  it("should validate view map without props", () => {
    const viewMap = {
      nodes: [
        {
          id: "welcome",
          component: "WelcomeMessage",
        },
        {
          id: "end",
          component: "GoodbyeMessage",
        },
      ],
    };
    
    console.log("Validating view map without props:", JSON.stringify(viewMap, null, 2));
    
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