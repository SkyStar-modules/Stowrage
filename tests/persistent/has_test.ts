import { Stowrage } from "../../mod.ts";

const data = new Stowrage<string>({
  name: "has",
  isPersistent: true,
});

await data.init();

Deno.test({
  name: "has Save",
  fn: () => {
    data.add("coolEntry", "string");
    if (!data.has("coolEntry")) throw "Cool entry not found";
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
