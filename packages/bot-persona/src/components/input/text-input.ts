import { ComponentConfig, RenderResult } from '../core/types';
import { BaseComponent } from '../core/base-component';
import { RequiredRule, MinLengthRule, MaxLengthRule, PatternRule } from '../validation/rules';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
}

export class TextInputComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
    
    // Добавляем правила валидации по умолчанию
    if (this.props.required) {
      this.validationRules.push(new RequiredRule());
    }
    if (this.props.minLength) {
      this.validationRules.push(new MinLengthRule(this.props.minLength));
    }
    if (this.props.maxLength) {
      this.validationRules.push(new MaxLengthRule(this.props.maxLength));
    }
    if (this.props.pattern) {
      this.validationRules.push(new PatternRule(this.props.pattern));
    }
    if (this.props.type === 'email') {
      this.validationRules.push(new RequiredRule()); // Email всегда required если указан
      this.validationRules.push(new PatternRule(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));
    }
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'TEXT_INPUT',
        props: this.props
      }
    };
  }
  
  async handleInput(input: string): Promise<void> {
    await this.setState({ value: input });
    
    // Валидируем ввод
    const validationResults = this.validate(input);
    const isValid = validationResults.every(result => result.isValid);
    
    // Эмитируем событие изменения
    this.emit({
      type: 'CHANGE',
      payload: { value: input, isValid, validationResults },
      sourceComponentId: this.id,
      timestamp: new Date()
    });
    
    // Если ввод валиден и это submit, эмитируем событие submit
    if (isValid && input && input.trim()) {
      this.emit({
        type: 'SUBMIT',
        payload: { value: input },
        sourceComponentId: this.id,
        timestamp: new Date()
      });
    }
  }
  
  getValue(): string | undefined {
    return this.state.value;
  }
  
  isValid(): boolean {
    // Для проверки валидности учитываем текущее значение
    const currentValue = this.state.value;
    const validationResults = this.validate(currentValue);
    return validationResults.every(result => result.isValid);
  }
}