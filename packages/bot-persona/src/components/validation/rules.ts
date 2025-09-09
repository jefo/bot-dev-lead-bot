import { ValidationResult, ValidationRule } from '../core/types';

export class RequiredRule implements ValidationRule {
  validate(value: any): ValidationResult {
    const isValid = value !== undefined && value !== null && value !== '';
    return {
      isValid,
      message: isValid ? undefined : 'This field is required',
      ruleName: 'REQUIRED'
    };
  }
}

export class MinLengthRule implements ValidationRule {
  constructor(private minLength: number) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'MIN_LENGTH' };
    }
    
    const str = String(value);
    const isValid = str.length >= this.minLength;
    return {
      isValid,
      message: isValid ? undefined : `Minimum length is ${this.minLength} characters`,
      ruleName: 'MIN_LENGTH'
    };
  }
}

export class MaxLengthRule implements ValidationRule {
  constructor(private maxLength: number) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'MAX_LENGTH' };
    }
    
    const str = String(value);
    const isValid = str.length <= this.maxLength;
    return {
      isValid,
      message: isValid ? undefined : `Maximum length is ${this.maxLength} characters`,
      ruleName: 'MAX_LENGTH'
    };
  }
}

export class MinSelectionRule implements ValidationRule {
  constructor(private minSelection: number) {}
  
  validate(value: any): ValidationResult {
    if (!Array.isArray(value)) {
      return { isValid: true, ruleName: 'MIN_SELECTION' };
    }
    
    const isValid = value.length >= this.minSelection;
    return {
      isValid,
      message: isValid ? undefined : `Minimum selection is ${this.minSelection} items`,
      ruleName: 'MIN_SELECTION'
    };
  }
}

export class MaxSelectionRule implements ValidationRule {
  constructor(private maxSelection: number) {}
  
  validate(value: any): ValidationResult {
    if (!Array.isArray(value)) {
      return { isValid: true, ruleName: 'MAX_SELECTION' };
    }
    
    const isValid = value.length <= this.maxSelection;
    return {
      isValid,
      message: isValid ? undefined : `Maximum selection is ${this.maxSelection} items`,
      ruleName: 'MAX_SELECTION'
    };
  }
}

export class PatternRule implements ValidationRule {
  constructor(private pattern: string | RegExp) {}
  
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'PATTERN' };
    }
    
    const regex = typeof this.pattern === 'string' ? new RegExp(this.pattern) : this.pattern;
    const isValid = regex.test(String(value));
    return {
      isValid,
      message: isValid ? undefined : `Value does not match required pattern`,
      ruleName: 'PATTERN'
    };
  }
}

export class EmailRule implements ValidationRule {
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'EMAIL' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(String(value));
    return {
      isValid,
      message: isValid ? undefined : `Please enter a valid email address`,
      ruleName: 'EMAIL'
    };
  }
}

export class NumberRule implements ValidationRule {
  validate(value: any): ValidationResult {
    if (value === undefined || value === null) {
      return { isValid: true, ruleName: 'NUMBER' };
    }
    
    const isValid = !isNaN(Number(value));
    return {
      isValid,
      message: isValid ? undefined : `Please enter a valid number`,
      ruleName: 'NUMBER'
    };
  }
}