import { usePort } from "@maxdev1/sotajs/lib/di.v2";
import { randomUUID } from "crypto";
import { BotPersona } from "../../domain/bot-persona/bot-persona.aggregate";
import {
	DefineBotPersonaCommand,
	DefineBotPersonaCommandSchema,
} from "../application/dtos";
import {
	operationFailedOutPort,
	saveBotPersonaPort,
} from "../application/ports";

/**
 * Use Case для определения нового шаблона бота (BotPersona).
 */
export async function defineBotPersonaUseCase(
	command: DefineBotPersonaCommand,
): Promise<void> {
	const { name, fsm, viewMap } = DefineBotPersonaCommandSchema.parse(command);

	const saveBotPersona = usePort(saveBotPersonaPort);
	const operationFailed = usePort(operationFailedOutPort);

	try {
		const botPersona = BotPersona.create({
			id: randomUUID(),
			name,
			fsm,
			viewMap,
		});

		await saveBotPersona(botPersona);

		// В SotaJS use cases не возвращают значения, но для удобства можно добавить выходной порт `botPersonaDefinedOutPort`
	} catch (error: any) {
		await operationFailed({
			chatId: "N/A", // В данном use case нет chatId
			reason: `Failed to define bot persona: ${error.message}`,
			timestamp: new Date(),
		});
	}
}
