import { z } from 'zod';

// Утилита для создания branded ID (упрощенная версия)
export const createBrandedId = <Brand extends string>(brand: Brand) => {
  const BrandedIdSchema = z.string().uuid().brand(brand);
  
  class BrandedId {
    public readonly value: string;

    private constructor(value: string) {
      this.value = value;
    }

    public static create(value: string): BrandedId {
      // В реальной реализации здесь будет валидация через zod
      return new BrandedId(value);
    }

    public equals(other: BrandedId): boolean {
      return this.value === other.value;
    }

    public toString(): string {
      return this.value;
    }

    public static readonly schema = BrandedIdSchema;
  }

  return BrandedId;
};

// Создаем branded IDs для наших сущностей
export const UserId = createBrandedId('UserId');
export type UserId = InstanceType<typeof UserId>;

export const DialogSessionId = createBrandedId('DialogSessionId');
export type DialogSessionId = InstanceType<typeof DialogSessionId>;

export const MessageId = createBrandedId('MessageId');
export type MessageId = InstanceType<typeof MessageId>;