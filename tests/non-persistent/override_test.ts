import { Stowrage } from "../../mod.ts";
import { assertNotEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "override",
});

data.add("something", "string");
data.add("something2", "string2");

Deno.test({
  name: "override",
  fn: () => {
    const before = data.fetch("something");
    data.override("something", "notstring");
    assertNotEquals(before, data.fetch("something"));

    const test = data.fetch("something2").data;
    data.overrideByID(1, "notstring");
    assertNotEquals(test, data.fetch("something2").data);
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
