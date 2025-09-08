// example-usage.ts
import { ConversationDomainFactory } from "./aggregates/conversation.aggregate";
import { z } from "zod";

// Пример использования
const raw = {
  id: "11111111-1111-1111-1111-111111111111",
  participants: ["user:1"],
  fsm: {
    initialState: "start",
    states: [
      { id: "start", on: [{ event: "NEXT", target: "askName", assign: { tmp: "literal" } }] },
      { id: "askName", on: [{ event: "SUBMIT", target: "done", assign: { userName: "payload.name" } }] },
      { id: "done", on: [] },
    ],
  },
  viewMap: {
    nodes: [
      { id: "start", component: "Welcome" },
      { id: "askName", component: "AskName", props: { label: "context.label" } },
      { id: "done", component: "Summary" },
    ],
  },
  context: { label: "Введите имя" }
};

const conv = ConversationDomainFactory(raw);

// initial state set automatically
console.log(conv.currentState); // "start"
console.log(conv.getCurrentComponent()); // node for 'start'

conv.applyEvent("NEXT");
console.log(conv.currentState); // "askName"

conv.applyEvent("SUBMIT", { name: "Ivan" });
console.log(conv.getContext()); // { label: "Введите имя", tmp: "literal", userName: "Ivan" }

console.log(conv.getCurrentComponent()); // resolved props, component = AskName for askName or Summary after done