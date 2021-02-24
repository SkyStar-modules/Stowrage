import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "fetchByRange",
});

data.add("something", "string");
data.add("something2", "string");

Deno.test({
  name: "fetchByRange",
  fn: () => {
    const fetched = [data.fetchByID(0), data.fetchByID(1)];
    assertEquals(fetched, data.fetchByRange(0, 2));
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
