import { usePort } from "@maxdev1/sotajs";
import { randomUUID } from "crypto";
import { BotPersona } from "../../domain/bot-persona/bot-persona.aggregate";
import {
	DefineBotPersonaCommand,
	DefineBotPersonaCommandSchema,
} from "../dtos";
import { operationFailedOutPort } from "../ports";
import { saveBotPersonaPort } from "../../domain/ports";

/**
 * Use Case для определения нового шаблона бота (BotPersona).
 */
export async function defineBotPersonaUseCase(
	command: DefineBotPersonaCommand,
): Promise<void> {
	console.log("DefineBotPersonaUseCase called with command:", command);
	const { name, fsm, viewMap } = DefineBotPersonaCommandSchema.parse(command);
	console.log("Parsed command:", { name, fsm, viewMap });

	const saveBotPersona = usePort(saveBotPersonaPort);
	const operationFailed = usePort(operationFailedOutPort);

	try {
		console.log("Creating BotPersona");
		const botPersona = BotPersona.create({
			id: randomUUID(),
			name,
			fsm,
			viewMap,
		});

		console.log("BotPersona created successfully");
		await saveBotPersona(botPersona);
		console.log("BotPersona saved successfully");

		// В SotaJS use cases не возвращают значения, но для удобства можно добавить выходной порт `botPersonaDefinedOutPort`
	} catch (error: any) {
		console.error("Error in defineBotPersonaUseCase:", error);
		await operationFailed({
			chatId: "N/A", // В данном use case нет chatId
			reason: `Failed to define bot persona: ${error.message}`,
			timestamp: new Date(),
		});
	}
}