import { describe, it, expect } from "bun:test";
import './../index'; // Импортируем index для регистрации компонентов
import { MultiSelectComponent } from "./../input/multi-select";

describe("MultiSelectComponent Test", () => {
  it("should create MultiSelectComponent with correct properties", () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
          { value: "opt3", label: "Option 3" }
        ],
        label: "Select options",
        minSelection: 1,
        maxSelection: 2
      }
    });
    
    expect(component.id).toBe("test-multi-select");
    expect(component.type).toBe("MULTI_SELECT");
    expect(component.props.options).toHaveLength(3);
    expect(component.props.label).toBe("Select options");
    expect(component.props.minSelection).toBe(1);
    expect(component.props.maxSelection).toBe(2);
  });
  
  it("should render correctly", async () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" }
        ],
        label: "Select options"
      }
    });
    
    const renderResult = await component.render();
    expect(renderResult.elementId).toBe("test-multi-select");
    expect(renderResult.platformSpecificData.type).toBe("MULTI_SELECT");
    expect(renderResult.platformSpecificData.props.options).toHaveLength(2);
    expect(renderResult.platformSpecificData.props.label).toBe("Select options");
  });
  
  it("should handle option selection and emit events", async () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" }
        ],
        label: "Select options"
      }
    });
    
    let changeEventReceived = false;
    
    component.on('CHANGE', (event) => {
      changeEventReceived = true;
      expect(event.payload.selected).toEqual(["opt1"]);
      expect(event.payload.isValid).toBe(true);
    });
    
    await component.selectOption("opt1");
    
    expect(changeEventReceived).toBe(true);
    expect(component.getSelectedValues()).toEqual(["opt1"]);
    expect(component.getSelectedOptions()).toEqual([{ value: "opt1", label: "Option 1" }]);
  });
  
  it("should handle multiple selections", async () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
          { value: "opt3", label: "Option 3" }
        ],
        label: "Select options"
      }
    });
    
    await component.selectOption("opt1");
    await component.selectOption("opt3");
    
    expect(component.getSelectedValues()).toEqual(["opt1", "opt3"]);
    expect(component.getSelectedOptions()).toEqual([
      { value: "opt1", label: "Option 1" },
      { value: "opt3", label: "Option 3" }
    ]);
  });
  
  it("should handle deselection", async () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" }
        ],
        label: "Select options"
      }
    });
    
    // Сначала выбираем опции
    await component.selectOption("opt1");
    await component.selectOption("opt2");
    
    expect(component.getSelectedValues()).toEqual(["opt1", "opt2"]);
    
    // Затем отменяем выбор одной из них
    await component.selectOption("opt1");
    
    expect(component.getSelectedValues()).toEqual(["opt2"]);
  });
  
  it("should validate min/max selection", async () => {
    const component = new MultiSelectComponent({
      id: "test-multi-select",
      type: "MULTI_SELECT",
      props: {
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
          { value: "opt3", label: "Option 3" }
        ],
        label: "Select options",
        minSelection: 1,
        maxSelection: 2
      }
    });
    
    // Пустой выбор должен быть невалидным
    expect(component.isValid()).toBe(false);
    
    // Выбор одной опции должен быть валидным
    await component.selectOption("opt1");
    expect(component.isValid()).toBe(true);
    
    // Выбор двух опций должен быть валидным
    await component.selectOption("opt2");
    expect(component.isValid()).toBe(true);
    
    // Выбор трех опций должен быть невалидным
    await component.selectOption("opt3");
    expect(component.isValid()).toBe(false);
  });
});