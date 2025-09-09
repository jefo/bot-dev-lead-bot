import { describe, it, expect } from "bun:test";
import './../index'; // Импортируем index для регистрации компонентов
import { TextInputComponent } from "./../input/text-input";

describe("TextInputComponent Test", () => {
  it("should create TextInputComponent with correct properties", () => {
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        placeholder: "Enter your name",
        required: true,
        minLength: 2,
        maxLength: 50
      }
    });
    
    expect(component.id).toBe("test-input");
    expect(component.type).toBe("TEXT_INPUT");
    expect(component.props.label).toBe("Name");
    expect(component.props.placeholder).toBe("Enter your name");
    expect(component.props.required).toBe(true);
    expect(component.props.minLength).toBe(2);
    expect(component.props.maxLength).toBe(50);
  });
  
  it("should render correctly", async () => {
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        placeholder: "Enter your name"
      }
    });
    
    const renderResult = await component.render();
    expect(renderResult.elementId).toBe("test-input");
    expect(renderResult.platformSpecificData.type).toBe("TEXT_INPUT");
    expect(renderResult.platformSpecificData.props.label).toBe("Name");
    expect(renderResult.platformSpecificData.props.placeholder).toBe("Enter your name");
  });
  
  it("should handle input and emit events", async () => {
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        required: true
      }
    });
    
    let changeEventReceived = false;
    let submitEventReceived = false;
    
    component.on('CHANGE', (event) => {
      changeEventReceived = true;
      expect(event.payload.value).toBe("John");
      expect(event.payload.isValid).toBe(true);
    });
    
    component.on('SUBMIT', (event) => {
      submitEventReceived = true;
      expect(event.payload.value).toBe("John");
    });
    
    await component.handleInput("John");
    
    expect(changeEventReceived).toBe(true);
    expect(submitEventReceived).toBe(true);
    expect(component.getValue()).toBe("John");
  });
  
  it("should validate required field", async () => {
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        required: true
      }
    });
    
    // Пустое значение должно быть невалидным
    await component.handleInput("");
    expect(component.isValid()).toBe(false);
    
    // Непустое значение должно быть валидным
    await component.handleInput("John");
    expect(component.isValid()).toBe(true);
  });
  
  it("should validate min/max length", async () => {
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        minLength: 3,
        maxLength: 10
      }
    });
    
    // Слишком короткое значение
    await component.handleInput("Hi");
    expect(component.isValid()).toBe(false);
    
    // Слишком длинное значение
    await component.handleInput("This is a very long name");
    expect(component.isValid()).toBe(false);
    
    // Валидное значение
    await component.handleInput("John");
    expect(component.isValid()).toBe(true);
  });
});