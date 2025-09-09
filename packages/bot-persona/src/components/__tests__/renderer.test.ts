import { describe, it, expect } from "bun:test";
import './../index'; // Импортируем index для регистрации компонентов
import { DefaultComponentRenderer } from "./../renderer/renderer";
import { ConsolePlatformAdapter } from "./../adapters/console-adapter";
import { TextInputComponent } from "./../input/text-input";

describe("Component Renderer Test", () => {
  it("should render component using platform adapter", async () => {
    const renderer = new DefaultComponentRenderer();
    const platformAdapter = new ConsolePlatformAdapter();
    
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name",
        placeholder: "Enter your name"
      }
    });
    
    // Проверяем, что рендеринг не вызывает ошибок
    await expect(renderer.render(component, platformAdapter)).resolves.toBeUndefined();
  });
  
  it("should update component using platform adapter", async () => {
    const renderer = new DefaultComponentRenderer();
    const platformAdapter = new ConsolePlatformAdapter();
    
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name"
      }
    });
    
    // Проверяем, что обновление не вызывает ошибок
    await expect(renderer.update(component, platformAdapter)).resolves.toBeUndefined();
  });
  
  it("should destroy component using platform adapter", async () => {
    const renderer = new DefaultComponentRenderer();
    const platformAdapter = new ConsolePlatformAdapter();
    
    const component = new TextInputComponent({
      id: "test-input",
      type: "TEXT_INPUT",
      props: {
        label: "Name"
      }
    });
    
    // Проверяем, что удаление не вызывает ошибок
    await expect(renderer.destroy(component, platformAdapter)).resolves.toBeUndefined();
  });
});