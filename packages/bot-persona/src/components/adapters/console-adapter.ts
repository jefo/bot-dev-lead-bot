import { PlatformAdapter, UserInput, UserInputResult } from '../renderer/renderer';
import { RenderResult } from '../core/types';

export class ConsolePlatformAdapter implements PlatformAdapter {
  readonly type = 'CONSOLE';
  
  async renderElement(element: RenderResult): Promise<void> {
    console.log('--- RENDERING COMPONENT ---');
    console.log(`Element ID: ${element.elementId}`);
    console.log(`Type: ${element.platformSpecificData.type}`);
    console.log('Props:', element.platformSpecificData.props);
    console.log('---------------------------');
  }
  
  async updateElement(element: RenderResult): Promise<void> {
    console.log('--- UPDATING COMPONENT ---');
    console.log(`Element ID: ${element.elementId}`);
    console.log(`Type: ${element.platformSpecificData.type}`);
    console.log('Props:', element.platformSpecificData.props);
    console.log('---------------------------');
  }
  
  async removeElement(elementId: string): Promise<void> {
    console.log(`--- REMOVING COMPONENT ${elementId} ---`);
  }
  
  async handleUserInput(input: UserInput): Promise<UserInputResult> {
    console.log('--- HANDLING USER INPUT ---');
    console.log(`Component ID: ${input.componentId}`);
    console.log(`Type: ${input.type}`);
    console.log('Payload:', input.payload);
    console.log('---------------------------');
    
    return {
      processed: true
    };
  }
}