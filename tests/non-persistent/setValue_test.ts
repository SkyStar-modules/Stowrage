import { Stowrage } from "../../mod.ts";
import { assertNotEquals } from "../devdeps.ts";

const startOBJ = {
  ree: 12,
};

const data = new Stowrage<Record<string, number>>({
  name: "setValue",
});

data.add("something", startOBJ);
data.add("something2", startOBJ);

Deno.test({
  name: "setValue",
  fn: () => {
    let before = data.fetch("something").data.ree;
    data.setValue("something", { key: "ree", value: -7 });
    let after = data.fetch("something").data.ree;
    assertNotEquals(before, after);

    before = data.fetch("something2").data.ree;
    data.setValue("something2", { key: "ree", value: 242 });
    after = data.fetch("something2").data.ree;
    assertNotEquals(before, after);
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
