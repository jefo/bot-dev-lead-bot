import type { FSM } from "../bot-persona/fsm.vo";
import { createRuntimeEntity } from "../runtime-entity.factory";
import type {
	IEntityDescriptor,
	InstanceTypeFromDescriptor,
} from "../runtime-entity.factory";

export const createConversation = <const TDescriptor extends IEntityDescriptor>(
	formDescriptor: TDescriptor,
) => {
	// 1. Используем новую, типобезопасную фабрику
	const FormEntity = createRuntimeEntity(formDescriptor);
	// 2. Выводим тип формы автоматически
	type FormInstance = InstanceTypeFromDescriptor<TDescriptor>;

	// 3. Убираем context и history из props
	interface ConversationProps {
		id: string;
		botPersonaId: string;
		chatId: string;
		status: "active" | "finished" | "cancelled";
		currentStateId: string;
		createdAt: Date;
		updatedAt: Date;
		// 4. Используем выведенный тип для form
		form: FormInstance;
	}

	return class ConversationAggregate {
		public readonly props: ConversationProps;

		constructor(props: ConversationProps) {
			this.props = props;
		}

		// 5. Упрощаем метод create
		static create(
			props: Omit<ConversationProps, "form" | "status"> & {
				form?: Partial<FormInstance>;
			},
		) {
			const formInstance = FormEntity.create(props.form);

			return new ConversationAggregate({
				...props,
				status: "active",
				form: formInstance,
			});
		}

		get id() {
			return this.props.id;
		}
		get botPersonaId() {
			return this.props.botPersonaId;
		}
		get chatId() {
			return this.props.chatId;
		}
		get status() {
			return this.props.status;
		}
		get currentStateId() {
			return this.props.currentStateId;
		}
		get createdAt() {
			return this.props.createdAt;
		}
		get updatedAt() {
			return this.props.updatedAt;
		}

		// 6. Типобезопасный геттер для формы
		get form(): FormInstance {
			return this.props.form;
		}

		// 7. Упрощаем processInput
		processInput(fsm: FSM, event: string, payload: any) {
			if (this.props.status !== "active") {
				throw new Error("Cannot process input in a non-active conversation.");
			}

			const transition = fsm.findTransition(this.props.currentStateId, event);
			if (!transition) {
				return;
			}

			this.props.currentStateId = transition.target;

			// Обновляем только форму
			if (transition.assign) {
				for (const [key, valueExpr] of Object.entries(transition.assign)) {
					let value: any;
					if (
						typeof valueExpr === "string" &&
						valueExpr.startsWith("payload.")
					) {
						const path = valueExpr.substring("payload.".length);
						value = payload?.[path];
					} else {
						value = valueExpr;
					}

					if (Object.prototype.hasOwnProperty.call(this.form, key)) {
						// Вызываем новый, типобезопасный метод .set().
						// Утверждение типа `as keyof FormInstance` все еще нужно, т.к. `key` - это строка,
						// но теперь мы вызываем строго типизированный метод, а не мутируем `any`.
						this.form.set(key as keyof FormInstance, value);
					}
				}
			}

			this.props.updatedAt = new Date();
		}

		finish() {
			if (this.props.status !== "active") {
				throw new Error("Only active conversations can be finished.");
			}
			this.props.status = "finished";
			this.props.updatedAt = new Date();
		}

		cancel() {
			if (this.props.status !== "active") {
				throw new Error("Only active conversations can be cancelled.");
			}
			this.props.status = "cancelled";
			this.props.updatedAt = new Date();
		}

		// 8. Геттеры для context, history и state удалены
	};
};
