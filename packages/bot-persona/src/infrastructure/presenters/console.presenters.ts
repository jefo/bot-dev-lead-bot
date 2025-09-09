import type { ComponentRenderDto, FailureDto } from "../../application/dtos";

export const consoleComponentRenderAdapter = async (dto: ComponentRenderDto): Promise<void> => {
  console.log("--- RENDERING COMPONENT ---");
  console.log(`Chat ID: ${dto.chatId}`);
  console.log(`Component: ${dto.componentName}`);
  console.log("Props:", dto.props);
  console.log("---------------------------");
};

export const consoleFailurePresenter = async (dto: FailureDto): Promise<void> => {
    console.error("--- OPERATION FAILED ---");
    console.error(`Chat ID: ${dto.chatId}`);
    console.error(`Reason: ${dto.reason}`);
    console.error(`Timestamp: ${dto.timestamp.toISOString()}`);
    console.error("------------------------");
}
