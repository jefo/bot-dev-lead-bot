import { ComponentFactory } from './core/factory';
import { TextInputComponent } from './input/text-input';
import { MultiSelectComponent } from './input/multi-select';
import { TextMessageComponent } from './output/text-message';

// Регистрация стандартных компонентов
export function registerStandardComponents(): void {
  ComponentFactory.register('TEXT_INPUT', TextInputComponent);
  ComponentFactory.register('MULTI_SELECT', MultiSelectComponent);
  ComponentFactory.register('TEXT_MESSAGE', TextMessageComponent);
}

// Автоматическая регистрация при импорте
registerStandardComponents();