// Экспорт всех компонентов и утилит

// Core
export { Component, ComponentConfig, ComponentEvent, RenderResult, ValidationResult } from './core/types';
export { BaseComponent } from './core/base-component';
export { ComponentFactory } from './core/factory';

// Input Components
export { TextInputComponent, TextInputProps } from './components/input/text-input';
export { MultiSelectComponent, MultiSelectProps, MultiSelectOption } from './components/input/multi-select';

// Output Components
export { TextMessageComponent, TextMessageProps } from './components/output/text-message';

// Validation
export { 
  RequiredRule, 
  MinLengthRule, 
  MaxLengthRule, 
  MinSelectionRule, 
  MaxSelectionRule, 
  PatternRule, 
  EmailRule, 
  NumberRule 
} from './components/validation/rules';

// Renderer
export { ComponentRenderer, DefaultComponentRenderer, PlatformAdapter } from './components/renderer/renderer';
export { ConsolePlatformAdapter } from './components/adapters/console-adapter';

// Initialize
import './index';