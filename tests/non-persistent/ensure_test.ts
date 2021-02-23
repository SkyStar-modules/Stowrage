import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "ensure",
});

Deno.test({
  name: "ensure",
  fn: () => {
    const before = data.totalEntries();
    const ensure = data.ensure("something", "string");
    assertEquals(before + 1, data.totalEntries());
    assertEquals(ensure, data.fetchByID(0));
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
