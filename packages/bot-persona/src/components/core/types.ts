import { z } from 'zod';

// Базовые типы и интерфейсы для компонентов

export type ComponentType = 
  | 'TEXT_MESSAGE'
  | 'TEXT_INPUT' 
  | 'MULTI_SELECT'
  | 'SINGLE_SELECT'
  | 'NUMBER_INPUT'
  | 'DATE_PICKER'
  | 'BUTTON_GROUP'
  | string; // Для кастомных компонентов

export interface ComponentEvent {
  type: string;
  payload?: any;
  timestamp: Date;
  sourceComponentId: string;
}

export interface ComponentConfig {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  validationRules?: ValidationRuleConfig[];
}

export interface Component {
  readonly id: string;
  readonly type: ComponentType;
  readonly props: Record<string, any>;
  
  // Методы жизненного цикла
  mount(): Promise<void>;
  unmount(): Promise<void>;
  update(props: Record<string, any>): Promise<void>;
  
  // Методы рендеринга
  render(): Promise<RenderResult>;
  
  // Методы событий
  on(event: string, handler: (event: ComponentEvent) => void): void;
  off(event: string, handler: (event: ComponentEvent) => void): void;
  emit(event: ComponentEvent): void;
  
  // Методы валидации
  validate(): ValidationResult[];
  
  // Методы состояния
  setState(state: any): Promise<void>;
  getState(): any;
}

export interface RenderResult {
  elementId: string;
  platformSpecificData: any;
  metadata?: Record<string, any>;
}

// Валидация
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  ruleName: string;
}

export interface ValidationRuleConfig {
  type: string;
  params?: Record<string, any>;
}

export interface ValidationRule {
  validate(value: any): ValidationResult;
}

// Zod схемы для валидации
export const ComponentConfigSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.any()),
  validationRules: z.array(z.object({
    type: z.string(),
    params: z.record(z.string(), z.any()).optional()
  })).optional()
});

export const ComponentEventSchema = z.object({
  type: z.string(),
  payload: z.any().optional(),
  timestamp: z.date(),
  sourceComponentId: z.string()
});

export const RenderResultSchema = z.object({
  elementId: z.string(),
  platformSpecificData: z.any(),
  metadata: z.record(z.string(), z.any()).optional()
});