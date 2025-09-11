// Domain type for Conversation Model
export interface FormEntityType {
	id: string;
	name: string;
	schema: Record<string, any>;
	guards: Array<{
		propertyName: string;
		condition: {
			operator: string;
			value: any;
		};
		errorMessage: string;
	}>;
	defaults?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
}