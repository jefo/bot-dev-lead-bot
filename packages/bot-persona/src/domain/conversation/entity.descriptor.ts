// Property definition for the conversation model
export type PropDefinition = {
	type: "string" | "number" | "boolean" | "date" | "array" | "object";
	required?: boolean;
	defaultValue?: any;
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
		min?: number;
		max?: number;
	};
};

export type PredicateOperator =
	| "eq"
	| "neq"
	| "gt"
	| "lt"
	| "in"
	| "notIn"
	| "contains"
	| "notContains";

// Guard rules for property updates
export type PropertyGuardRule = {
	propertyName: string;
	condition: {
		operator: PredicateOperator;
		value: any;
	};
	errorMessage: string;
};

// Entity Descriptor  with AJV schema support
export interface EntityDescriptor {
	// Entity name
	name: string;

	// AJV JSON Schema for validation
	schema: Record<string, any>;

	// Property guard rules
	guards: PropertyGuardRule[];

	// Default values for properties
	defaults?: Record<string, any>;
}
