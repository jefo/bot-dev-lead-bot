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

// Типы для новых методов get/set
type EntityMethods<TProps> = {
    set<K extends keyof TProps>(key: K, value: TProps[K]): void;
    get<K extends keyof TProps>(key: K): TProps[K];
};

// Финальный тип экземпляра: объединение свойств и методов
export type InstanceTypeFromDescriptor<TDescriptor extends IEntityDescriptor> =
	PropertiesType<TDescriptor> & EntityMethods<PropertiesType<TDescriptor>>;

// Обновленный интерфейс дескриптора
export interface IEntityDescriptor {
	properties: Record<string, { type: any; default?: any; }>;
	guards?: { [key: string]: (newValue: any, oldValue: any, props: Record<string, any>) => boolean | string; };
}

/**
 * Создает класс сущности на основе декларативного дескриптора.
 * @param descriptor Описание свойств и методов сущности.
 * @returns Класс, который можно инстанциировать.
 */
export const createRuntimeEntity = <const TDescriptor extends IEntityDescriptor>(
	descriptor: TDescriptor,
) => {
	type Props = PropertiesType<TDescriptor>;
	type EntityInstance = InstanceTypeFromDescriptor<TDescriptor>;

	class RuntimeEntity {
		private _props: Record<string, any> = {};

		constructor(initialData?: Partial<Props>) {
			// 1. Создаем геттеры и сеттеры для свойств с валидацией
			for (const key in descriptor.properties) {
				Object.defineProperty(this, key, {
					get: () => this._props[key],
					set: (value: any) => {
                        const guard = descriptor.guards?.[key];
                        if (guard) {
                            const oldValue = this._props[key];
                            const validationResult = guard(value, oldValue, this._props);
                            if (validationResult === false) throw new Error(`Validation failed for property '${key}'.`);
                            if (typeof validationResult === 'string') throw new Error(validationResult);
                        }
						this._props[key] = value;
					},
					enumerable: true,
					configurable: true,
				});
			}

            // 2. Устанавливаем значения по умолчанию (ЧЕРЕЗ СЕТТЕРЫ)
            for (const key in descriptor.properties) {
				const defaultValue = descriptor.properties[key].default;
				if (defaultValue !== undefined) {
					(this as any)[key] = defaultValue;
				}
			}

            // 3. Устанавливаем начальные данные (ТАКЖЕ ЧЕРЕЗ СЕТТЕРЫ)
			if (initialData) {
				for (const key in initialData) {
					if (Object.prototype.hasOwnProperty.call(initialData, key) && key in descriptor.properties) {
						(this as any)[key] = initialData[key as keyof typeof initialData];
					}
				}
			}
		}

        // Новый публичный метод для установки значений
        public set<K extends keyof Props>(key: K, value: Props[K]): void {
            // Этот вызов инициирует нативный сеттер, определенный выше, со всей логикой guard'ов
            (this as any)[key] = value;
        }

        // Новый публичный метод для получения значений
        public get<K extends keyof Props>(key: K): Props[K] {
            return (this as any)[key];
        }

		static create(initialData?: Partial<Props>): EntityInstance {
			return new RuntimeEntity(initialData) as unknown as EntityInstance;
		}
	}

	return RuntimeEntity;
};