import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "delete",
  isPersistent: true,
});

await data.init();

data.add("something", "string");

Deno.test({
  name: "delete Save",
  fn: () => {
    const before = data.totalEntries();
    data.delete("something");
    assertEquals(before - 1, data.totalEntries());
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
