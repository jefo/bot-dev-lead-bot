import { describe, it, expect } from "bun:test";
import { 
  RequiredRule, 
  MinLengthRule, 
  MaxLengthRule, 
  MinSelectionRule, 
  MaxSelectionRule, 
  PatternRule, 
  EmailRule, 
  NumberRule 
} from "./../validation/rules";

describe("Validation Rules Test", () => {
  it("should validate required field", () => {
    const rule = new RequiredRule();
    
    // Пустые значения должны быть невалидными
    expect(rule.validate(undefined).isValid).toBe(false);
    expect(rule.validate(null).isValid).toBe(false);
    expect(rule.validate("").isValid).toBe(false);
    expect(rule.validate("   ").isValid).toBe(true); // Пробелы считаются значением
    
    // Непустые значения должны быть валидными
    expect(rule.validate("value").isValid).toBe(true);
    expect(rule.validate(0).isValid).toBe(true);
    expect(rule.validate(false).isValid).toBe(true);
  });
  
  it("should validate minimum length", () => {
    const rule = new MinLengthRule(3);
    
    // undefined и null должны быть валидными (не имеют длины)
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    
    // Строки короче минимальной длины должны быть невалидными
    expect(rule.validate("hi").isValid).toBe(false);
    expect(rule.validate("hey").isValid).toBe(true);
    expect(rule.validate("hello").isValid).toBe(true);
    
    // Числа должны преобразовываться в строки
    expect(rule.validate(12).isValid).toBe(false); // "12" = 2 символа
    expect(rule.validate(123).isValid).toBe(true); // "123" = 3 символа
  });
  
  it("should validate maximum length", () => {
    const rule = new MaxLengthRule(5);
    
    // undefined и null должны быть валидными (не имеют длины)
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    
    // Строки длиннее максимальной длины должны быть невалидными
    expect(rule.validate("hello world").isValid).toBe(false); // 11 символов
    expect(rule.validate("hello").isValid).toBe(true); // 5 символов
    expect(rule.validate("hi").isValid).toBe(true); // 2 символа
    
    // Числа должны преобразовываться в строки
    expect(rule.validate(123456).isValid).toBe(false); // "123456" = 6 символов
    expect(rule.validate(12345).isValid).toBe(true); // "12345" = 5 символов
  });
  
  it("should validate minimum selection", () => {
    const rule = new MinSelectionRule(2);
    
    // Не массивы должны быть валидными
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    expect(rule.validate("not an array").isValid).toBe(true);
    
    // Массивы с недостаточным количеством элементов должны быть невалидными
    expect(rule.validate([]).isValid).toBe(false);
    expect(rule.validate(["one"]).isValid).toBe(false);
    expect(rule.validate(["one", "two"]).isValid).toBe(true);
    expect(rule.validate(["one", "two", "three"]).isValid).toBe(true);
  });
  
  it("should validate maximum selection", () => {
    const rule = new MaxSelectionRule(3);
    
    // Не массивы должны быть валидными
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    expect(rule.validate("not an array").isValid).toBe(true);
    
    // Массивы с избыточным количеством элементов должны быть невалидными
    expect(rule.validate(["one", "two", "three", "four"]).isValid).toBe(false);
    expect(rule.validate(["one", "two", "three"]).isValid).toBe(true);
    expect(rule.validate(["one", "two"]).isValid).toBe(true);
    expect(rule.validate([]).isValid).toBe(true);
  });
  
  it("should validate pattern", () => {
    const rule = new PatternRule(/^\d{3}-\d{3}-\d{4}$/); // Формат телефона XXX-XXX-XXXX
    
    // undefined и null должны быть валидными
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    
    // Строки, не соответствующие паттерну, должны быть невалидными
    expect(rule.validate("123-456-789").isValid).toBe(false); // Недостаточно цифр
    expect(rule.validate("123-456-7890").isValid).toBe(true); // Правильный формат
    expect(rule.validate("abc-def-ghij").isValid).toBe(false); // Не цифры
    
    // Числа должны преобразовываться в строки
    expect(rule.validate(1234567890).isValid).toBe(false); // Нет дефисов
  });
  
  it("should validate email", () => {
    const rule = new EmailRule();
    
    // undefined и null должны быть валидными
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    
    // Невалидные email адреса
    expect(rule.validate("invalid-email").isValid).toBe(false);
    expect(rule.validate("@domain.com").isValid).toBe(false);
    expect(rule.validate("user@").isValid).toBe(false);
    expect(rule.validate("user@domain").isValid).toBe(false);
    
    // Валидные email адреса
    expect(rule.validate("user@example.com").isValid).toBe(true);
    expect(rule.validate("test.email@domain.co.uk").isValid).toBe(true);
    expect(rule.validate("user+tag@example.org").isValid).toBe(true);
  });
  
  it("should validate number", () => {
    const rule = new NumberRule();
    
    // undefined и null должны быть валидными
    expect(rule.validate(undefined).isValid).toBe(true);
    expect(rule.validate(null).isValid).toBe(true);
    
    // Невалидные числа
    expect(rule.validate("not-a-number").isValid).toBe(false);
    expect(rule.validate("123abc").isValid).toBe(false);
    expect(rule.validate("abc123").isValid).toBe(false);
    
    // Валидные числа
    expect(rule.validate("123").isValid).toBe(true);
    expect(rule.validate("-456").isValid).toBe(true);
    expect(rule.validate("12.34").isValid).toBe(true);
    expect(rule.validate("-56.78").isValid).toBe(true);
    expect(rule.validate(123).isValid).toBe(true);
    expect(rule.validate(-456).isValid).toBe(true);
    expect(rule.validate(12.34).isValid).toBe(true);
  });
});