import { Component, ComponentConfig, ComponentEvent, RenderResult, ValidationResult, ValidationRule } from './types';

export class EventEmitter {
  private listeners: Map<string, Array<(event: ComponentEvent) => void>> = new Map();
  
  on(event: string, listener: (event: ComponentEvent) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  off(event: string, listener: (event: ComponentEvent) => void): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event: ComponentEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}

export abstract class BaseComponent implements Component {
  protected readonly id: string;
  protected readonly type: string;
  protected props: Record<string, any>;
  protected state: any;
  protected eventEmitter: EventEmitter;
  protected validationRules: ValidationRule[];
  
  constructor(config: ComponentConfig) {
    this.id = config.id;
    this.type = config.type;
    this.props = config.props || {};
    this.state = {};
    this.validationRules = [];
    this.eventEmitter = new EventEmitter();
  }
  
  async mount(): Promise<void> {
    // Базовая реализация - ничего не делает
  }
  
  async unmount(): Promise<void> {
    // Очищаем слушателей событий
    this.eventEmitter = new EventEmitter();
  }
  
  async update(props: Record<string, any>): Promise<void> {
    this.props = { ...this.props, ...props };
    // Эмитируем событие обновления
    this.emit({
      type: 'UPDATE',
      sourceComponentId: this.id,
      timestamp: new Date()
    });
  }
  
  abstract render(): Promise<RenderResult>;
  
  on(event: string, handler: (event: ComponentEvent) => void): void {
    this.eventEmitter.on(event, handler);
  }
  
  off(event: string, handler: (event: ComponentEvent) => void): void {
    this.eventEmitter.off(event, handler);
  }
  
  emit(event: ComponentEvent): void {
    this.eventEmitter.emit(event);
  }
  
  validate(value?: any): ValidationResult[] {
    const results: ValidationResult[] = [];
    const actualValue = value !== undefined ? value : this.state.value;
    
    for (const rule of this.validationRules) {
      const result = rule.validate(actualValue);
      if (!result.isValid) {
        results.push(result);
      }
    }
    
    return results;
  }
  
  async setState(state: any): Promise<void> {
    this.state = { ...this.state, ...state };
  }
  
  getState(): any {
    return { ...this.state };
  }
}