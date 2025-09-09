import { describe, it, expect } from "bun:test";
import './../index'; // Импортируем index для регистрации компонентов
import { ComponentFactory } from "./../core/factory";
import { TextInputComponent } from "./../input/text-input";
import { MultiSelectComponent } from "./../input/multi-select";
import { TextMessageComponent } from "./../output/text-message";

describe("Component Factory Test", () => {
  it("should register and create TextInputComponent", () => {
    const component = ComponentFactory.create({
      id: "test-text-input",
      type: "TEXT_INPUT",
      props: {
        label: "Enter your name",
        placeholder: "John Doe",
        required: true
      }
    });
    
    expect(component).toBeInstanceOf(TextInputComponent);
    expect(component.id).toBe("test-text-input");
    expect(component.type).toBe("TEXT_INPUT");
  });
  
  it("should register and create MultiSelectComponent", () => {
    const component = ComponentFactory.create({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" }
        ],
        label: "Select options",
        minSelection: 1
      }
    });
    
    expect(component).toBeInstanceOf(MultiSelectComponent);
    expect(component.id).toBe("test-multi-select");
    expect(component.type).toBe("MULTI_SELECT");
  });
  
  it("should register and create TextMessageComponent", () => {
    const component = ComponentFactory.create({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: "Hello, world!",
        format: "plain"
      }
    });
    
    expect(component).toBeInstanceOf(TextMessageComponent);
    expect(component.id).toBe("test-text-message");
    expect(component.type).toBe("TEXT_MESSAGE");
  });
  
  it("should throw error for unknown component type", () => {
    expect(() => {
      ComponentFactory.create({
        id: "test-unknown",
        type: "UNKNOWN_COMPONENT",
        props: {}
      });
    }).toThrow("Unknown component type: UNKNOWN_COMPONENT");
  });
});