import { composeApp } from "./src/composition";
import { defineBotPersonaUseCase } from "./src/application/use-cases/define-bot-persona.use-case";
import { startConversationUseCase } from "./src/application/use-cases/start-conversation.use-case";

// 1. Собираем наше приложение: связываем порты с адаптерами
composeApp();

// 2. Определяем простого бота
const simpleBotDefinition = {
  name: "Welcome Bot",
  fsm: {
    initialState: "welcome",
    states: [
      {
        id: "welcome",
        on: [{ event: "NEXT", target: "end" }],
      },
      {
        id: "end",
        on: [],
      },
    ],
  },
  viewMap: {
    nodes: [
      {
        id: "welcome",
        component: "WelcomeMessage",
        props: { text: "Hello from SotaJS Bot!" },
      },
      {
        id: "end",
        component: "GoodbyeMessage",
        props: { text: "Bye!" },
      },
    ],
  },
};

// 3. Запускаем use cases для симуляции работы
async function run() {
  console.log("--- Running E2E test script ---");

  // Определяем бота
  // В реальном приложении ID будет возвращаться через выходной порт
  // Здесь мы его "угадываем", так как in-memory адаптер предсказуем
  await defineBotPersonaUseCase(simpleBotDefinition);
  console.log("Bot Persona defined.");

  // Предполагаем, что мы знаем ID. В реальном приложении мы бы его получили.
  // Для простоты теста, мы можем модифицировать in-memory адаптер, чтобы он возвращал ID,
  // но пока оставим так.
  // Давайте найдем его!
  const { inMemoryFindBotPersonaByIdAdapter } = await import("./src/infrastructure/persistence/in-memory.adapters");
  const persona = await inMemoryFindBotPersonaByIdAdapter(
      // @ts-ignore - небольшой хак, чтобы найти ID
      Array.from((await import("./src/infrastructure/persistence/in-memory.adapters")).botPersonas.keys())[0]
  );

  if (!persona) {
      console.error("Could not find defined persona!");
      return;
  }

  console.log(`Found persona with ID: ${persona.state.id}`);

  // Запускаем диалог
  await startConversationUseCase({
    botPersonaId: persona.state.id,
    chatId: "chat-123",
  });

  console.log("--- E2E test script finished ---");
}

run();