import { Component, ComponentConfig } from '../core/types';
import { BaseComponent } from '../core/base-component';

// Интерфейс для регистрации компонентов
export interface ComponentRegistration {
  type: string;
  class: new (config: ComponentConfig) => Component;
}

// Фабрика компонентов
export class ComponentFactory {
  private static registry: Map<string, new (config: ComponentConfig) => Component> = new Map();
  
  static register(type: string, componentClass: new (config: ComponentConfig) => Component): void {
    this.registry.set(type, componentClass);
  }
  
  static create(config: ComponentConfig): Component {
    const componentClass = this.registry.get(config.type);
    if (!componentClass) {
      throw new Error(`Unknown component type: ${config.type}`);
    }
    
    return new componentClass(config);
  }
  
  static unregister(type: string): void {
    this.registry.delete(type);
  }
  
  static isRegistered(type: string): boolean {
    return this.registry.has(type);
  }
  
  static getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}

// Регистрация стандартных компонентов (будет заполнена позже)
export function registerStandardComponents(): void {
  // Пока пусто - будет заполнено при реализации компонентов
}