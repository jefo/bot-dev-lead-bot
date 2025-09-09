import { ComponentConfig, RenderResult } from '../core/types';
import { BaseComponent } from '../core/base-component';
import { RequiredRule, MinSelectionRule, MaxSelectionRule } from '../validation/rules';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected?: string[];
  minSelection?: number;
  maxSelection?: number;
  label?: string;
  required?: boolean;
}

export class MultiSelectComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
    
    // Добавляем правила валидации по умолчанию
    if (this.props.required) {
      this.validationRules.push(new RequiredRule());
    }
    if (this.props.minSelection) {
      this.validationRules.push(new MinSelectionRule(this.props.minSelection));
    }
    if (this.props.maxSelection) {
      this.validationRules.push(new MaxSelectionRule(this.props.maxSelection));
    }
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'MULTI_SELECT',
        props: this.props
      }
    };
  }
  
  async selectOption(optionValue: string): Promise<void> {
    const currentSelection = this.state.selected || [];
    let newSelection: string[];
    
    if (currentSelection.includes(optionValue)) {
      // Удаляем из выбора
      newSelection = currentSelection.filter(v => v !== optionValue);
    } else {
      // Добавляем в выбор
      newSelection = [...currentSelection, optionValue];
    }
    
    await this.setState({ selected: newSelection });
    
    // Валидируем выбор
    const validationResults = this.validate(newSelection);
    const isValid = validationResults.every(result => result.isValid);
    
    // Эмитируем событие изменения
    this.emit({
      type: 'CHANGE',
      payload: { selected: newSelection, isValid, validationResults },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
    
    // Если выбор валиден и достигнут минимум, эмитируем событие submit
    if (isValid && this.props.minSelection && newSelection.length >= this.props.minSelection) {
      this.emit({
        type: 'SUBMIT',
        payload: { selected: newSelection },
        sourceComponentId: this.id,
        timestamp: new Date()
      });
    }
  }
  
  getSelectedOptions(): MultiSelectOption[] {
    const selectedValues = this.state.selected || [];
    return this.props.options.filter(option => 
      selectedValues.includes(option.value)
    );
  }
  
  getSelectedValues(): string[] {
    return this.state.selected || [];
  }
  
  isValid(): boolean {
    // Для проверки валидности учитываем текущий выбор
    const currentSelection = this.state.selected || [];
    const validationResults = this.validate(currentSelection);
    return validationResults.every(result => result.isValid);
  }
}