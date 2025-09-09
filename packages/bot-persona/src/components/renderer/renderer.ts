import { Component, RenderResult } from '../core/types';

export interface PlatformAdapter {
  readonly type: string;
  
  renderElement(element: RenderResult): Promise<void>;
  updateElement(element: RenderResult): Promise<void>;
  removeElement(elementId: string): Promise<void>;
  handleUserInput(input: UserInput): Promise<UserInputResult>;
}

export interface UserInput {
  type: string;
  payload: any;
  componentId: string;
  timestamp: Date;
}

export interface UserInputResult {
  processed: boolean;
  error?: string;
  transformedInput?: any;
}

export interface ComponentRenderer {
  render(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
  update(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
  destroy(component: Component, platformAdapter: PlatformAdapter): Promise<void>;
}

export class DefaultComponentRenderer implements ComponentRenderer {
  async render(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    const renderResult = await component.render();
    await platformAdapter.renderElement(renderResult);
  }
  
  async update(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    const renderResult = await component.render();
    await platformAdapter.updateElement(renderResult);
  }
  
  async destroy(component: Component, platformAdapter: PlatformAdapter): Promise<void> {
    await platformAdapter.removeElement(component.id);
  }
}