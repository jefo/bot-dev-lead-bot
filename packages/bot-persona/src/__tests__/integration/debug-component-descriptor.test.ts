import { describe, it, expect } from "bun:test";
import { ComponentDescriptorSchema } from "../../domain/bot-persona/view-map.vo";

describe("ComponentDescriptorSchema Test", () => {
  it("should validate component descriptor with props", () => {
    const descriptor = {
      id: "welcome",
      component: "WelcomeMessage",
      props: { text: "Hello from SotaJS Bot!" },
    };
    
    console.log("Validating component descriptor:", JSON.stringify(descriptor, null, 2));
    
    try {
      const result = ComponentDescriptorSchema.parse(descriptor);
      console.log("Component descriptor validation passed");
      expect(result).toEqual(descriptor);
    } catch (error) {
      console.error("Error validating component descriptor:", error);
      throw error;
    }
  });

  it("should validate component descriptor without props", () => {
    const descriptor = {
      id: "end",
      component: "GoodbyeMessage",
    };
    
    console.log("Validating component descriptor without props:", JSON.stringify(descriptor, null, 2));
    
    try {
      const result = ComponentDescriptorSchema.parse(descriptor);
      console.log("Component descriptor validation passed");
      expect(result).toEqual(descriptor);
    } catch (error) {
      console.error("Error validating component descriptor:", error);
      throw error;
    }
  });
});