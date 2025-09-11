/**
 * @file Этот файл содержит "магию" TypeScript для создания динамических,
 * но полностью типизированных классов сущностей из декларативного описания.
 */

// Вспомогательный тип для преобразования конструкторов (String) в примитивы (string)
type Primitive<T> = T extends StringConstructor
	? string
	: T extends NumberConstructor
		? number
		: T extends BooleanConstructor
			? boolean
			: T extends DateConstructor
				? Date
				: any;

// Тип, который ВЫВОДИТ тип свойств из дескриптора
type PropertiesType<TDescriptor extends IEntityDescriptor> = {
	[K in keyof TDescriptor["properties"]]: Primitive<
		TDescriptor["properties"][K]["type"]
	>;
};

// Тип, который ВЫВОДИТ тип методов из дескриптора
type MethodsType<TDescriptor extends IEntityDescriptor> = {
	[K in keyof TDescriptor["methods"]]: TDescriptor["methods"][K];
};

// Финальный тип экземпляра, который мы выводим из дескриптора
// `this` в методах будет корректно выведен как сам экземпляр
export type InstanceTypeFromDescriptor<TDescriptor extends IEntityDescriptor> =
	PropertiesType<TDescriptor> & MethodsType<TDescriptor>;

// Интерфейс дескриптора, который будет описывать сущность
export interface IEntityDescriptor {
	properties: Record<string, { type: any; default?: any }>;
	// Мы используем `any` для `this` здесь, но он будет корректно заменен в экземпляре
	methods: Record<string, (this: any, ...args: any[]) => any>;
}

/**
 * Создает класс сущности на основе декларативного дескриптора.
 * @param descriptor Описание свойств и методов сущности.
 * @returns Класс, который можно инстанциировать.
 */
export const createRuntimeEntity = <
	const TDescriptor extends IEntityDescriptor,
>(
	descriptor: TDescriptor,
) => {
	type EntityInstance = InstanceTypeFromDescriptor<TDescriptor>;

	class RuntimeEntity {
		private _props: Record<string, any> = {};

		constructor(initialData?: Partial<EntityInstance>) {
			// 1. Устанавливаем значения по умолчанию
			for (const key in descriptor.properties) {
				this._props[key] = descriptor.properties[key].default;
			}

			// 2. Перезаписываем начальными данными, если они есть
			if (initialData) {
				for (const key in initialData) {
					if (
						Object.prototype.hasOwnProperty.call(initialData, key) &&
						key in this._props
					) {
						const k = key as keyof EntityInstance;
						this._props[k] = initialData[k];
					}
				}
			}

			// 3. Создаем геттеры и сеттеры для прямого доступа (instance.name)
			for (const key in descriptor.properties) {
				Object.defineProperty(this, key, {
					get: () => this._props[key],
					set: (value: any) => (this._props[key] = value),
					enumerable: true,
					configurable: true,
				});
			}

			// 4. Привязываем методы к экземпляру, `this` становится корректным
			for (const key in descriptor.methods) {
				(this as any)[key] = descriptor.methods[key].bind(this);
			}
		}

		static create(initialData?: Partial<EntityInstance>): EntityInstance {
			return new RuntimeEntity(initialData) as unknown as EntityInstance;
		}
	}

	return RuntimeEntity;
};
