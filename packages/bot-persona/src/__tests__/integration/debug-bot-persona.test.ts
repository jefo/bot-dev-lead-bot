import { describe, it, expect } from "bun:test";
import { BotPersona } from "../../domain/bot-persona/bot-persona.aggregate";
import { randomUUID } from "crypto";

describe("BotPersona Creation Test", () => {
  it("should create BotPersona with valid data", () => {
    const botPersonaData = {
      id: randomUUID(),
      name: "Test Bot",
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

    console.log("Creating BotPersona with data:", JSON.stringify(botPersonaData, null, 2));
    
    try {
      const botPersona = BotPersona.create({ state: botPersonaData });
      console.log("BotPersona created successfully");
      expect(botPersona).toBeDefined();
      expect(botPersona.state.name).toBe("Test Bot");
    } catch (error) {
      console.error("Error creating BotPersona:", error);
      throw error;
    }
  });
});