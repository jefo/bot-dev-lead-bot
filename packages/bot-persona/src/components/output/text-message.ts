import { ComponentConfig, RenderResult } from '../core/types';
import { BaseComponent } from '../core/base-component';

export interface TextMessageProps {
  text: string;
  format?: 'plain' | 'markdown' | 'html';
}

export class TextMessageComponent extends BaseComponent {
  constructor(config: ComponentConfig) {
    super(config);
  }
  
  async render(): Promise<RenderResult> {
    return {
      elementId: this.id,
      platformSpecificData: {
        type: 'TEXT_MESSAGE',
        props: this.props
      }
    };
  }
  
  getText(): string {
    return this.props.text || '';
  }
  
  getFormat(): 'plain' | 'markdown' | 'html' {
    return this.props.format || 'plain';
  }
}