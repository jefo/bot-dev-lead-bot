import { describe, it, expect } from "bun:test";
import './../index'; // Импортируем index для регистрации компонентов
import { TextMessageComponent } from "./../output/text-message";

describe("TextMessageComponent Test", () => {
  it("should create TextMessageComponent with correct properties", () => {
    const component = new TextMessageComponent({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: "Hello, world!",
        format: "plain"
      }
    });
    
    expect(component.id).toBe("test-text-message");
    expect(component.type).toBe("TEXT_MESSAGE");
    expect(component.props.text).toBe("Hello, world!");
    expect(component.props.format).toBe("plain");
  });
  
  it("should render correctly", async () => {
    const component = new TextMessageComponent({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: "Hello, world!",
        format: "markdown"
      }
    });
    
    const renderResult = await component.render();
    expect(renderResult.elementId).toBe("test-text-message");
    expect(renderResult.platformSpecificData.type).toBe("TEXT_MESSAGE");
    expect(renderResult.platformSpecificData.props.text).toBe("Hello, world!");
    expect(renderResult.platformSpecificData.props.format).toBe("markdown");
  });
  
  it("should get text and format", () => {
    const component = new TextMessageComponent({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: "Hello, world!",
        format: "html"
      }
    });
    
    expect(component.getText()).toBe("Hello, world!");
    expect(component.getFormat()).toBe("html");
  });
  
  it("should default to plain format", () => {
    const component = new TextMessageComponent({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: "Hello, world!"
        // format не указан, должен быть по умолчанию "plain"
      }
    });
    
    expect(component.getFormat()).toBe("plain");
  });
  
  it("should handle empty text", () => {
    const component = new TextMessageComponent({
      id: "test-text-message",
      type: "TEXT_MESSAGE",
      props: {
        text: ""
      }
    });
    
    expect(component.getText()).toBe("");
  });
});