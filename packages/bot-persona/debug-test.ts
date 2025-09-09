import { createAggregate } from "@maxdev1/sotajs";
import { z } from "zod";

const TestSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const TestAggregate = createAggregate({
  name: "Test",
  schema: TestSchema,
  invariants: [],
  actions: {},
});

console.log("TestAggregate created successfully");