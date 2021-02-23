import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "fetch",
  isPersistent: true,
});

await data.init();

data.add("something2", "string");

Deno.test({
  name: "fetch Save",
  fn: () => {
    assertEquals(data.fetchByID(0), data.fetch("something2"));
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
