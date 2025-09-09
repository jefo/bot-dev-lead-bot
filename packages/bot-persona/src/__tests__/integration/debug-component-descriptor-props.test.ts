import { describe, it, expect } from "bun:test";
import { ComponentDescriptorSchema } from "../../domain/bot-persona/view-map.vo";

describe("ComponentDescriptorSchema Props Test", () => {
  it("should validate component descriptor with string props", () => {
    const descriptor = {
      id: "welcome",
      component: "WelcomeMessage",
      props: { text: "Hello" },
    };
    
    console.log("Validating component descriptor with string props:", JSON.stringify(descriptor, null, 2));
    
    try {
      const result = ComponentDescriptorSchema.parse(descriptor);
      console.log("Component descriptor validation passed");
      expect(result).toEqual(descriptor);
    } catch (error) {
      console.error("Error validating component descriptor:", error);
      throw error;
    }
  });

  it("should validate component descriptor with different prop types", () => {
    const descriptor = {
      id: "welcome",
      component: "WelcomeMessage",
      props: { 
        text: "Hello",
        count: 42,
        enabled: true,
        data: { key: "value" }
      },
    };
    
    console.log("Validating component descriptor with different prop types:", JSON.stringify(descriptor, null, 2));
    
    try {
      const result = ComponentDescriptorSchema.parse(descriptor);
      console.log("Component descriptor validation passed");
      expect(result).toEqual(descriptor);
    } catch (error) {
      console.error("Error validating component descriptor:", error);
      throw error;
    }
  });

  it("should validate component descriptor with empty props", () => {
    const descriptor = {
      id: "welcome",
      component: "WelcomeMessage",
      props: {},
    };
    
    console.log("Validating component descriptor with empty props:", JSON.stringify(descriptor, null, 2));
    
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