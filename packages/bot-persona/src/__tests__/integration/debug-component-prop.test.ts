import { describe, it, expect } from "bun:test";
import { ComponentPropSchema } from "../../domain/bot-persona/view-map.vo";

describe("ComponentPropSchema Test", () => {
  it("should validate string props", () => {
    const prop = "test string";
    console.log("Validating string prop:", prop);
    
    try {
      const result = ComponentPropSchema.parse(prop);
      console.log("String prop validation passed");
      expect(result).toBe(prop);
    } catch (error) {
      console.error("Error validating string prop:", error);
      throw error;
    }
  });

  it("should validate number props", () => {
    const prop = 42;
    console.log("Validating number prop:", prop);
    
    try {
      const result = ComponentPropSchema.parse(prop);
      console.log("Number prop validation passed");
      expect(result).toBe(prop);
    } catch (error) {
      console.error("Error validating number prop:", error);
      throw error;
    }
  });

  it("should validate boolean props", () => {
    const prop = true;
    console.log("Validating boolean prop:", prop);
    
    try {
      const result = ComponentPropSchema.parse(prop);
      console.log("Boolean prop validation passed");
      expect(result).toBe(prop);
    } catch (error) {
      console.error("Error validating boolean prop:", error);
      throw error;
    }
  });

  it("should validate object props", () => {
    const prop = { key: "value" };
    console.log("Validating object prop:", JSON.stringify(prop, null, 2));
    
    try {
      const result = ComponentPropSchema.parse(prop);
      console.log("Object prop validation passed");
      expect(result).toEqual(prop);
    } catch (error) {
      console.error("Error validating object prop:", error);
      throw error;
    }
  });
});