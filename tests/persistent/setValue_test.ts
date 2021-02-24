import { Stowrage } from "../../mod.ts";
import { assertNotEquals } from "../devdeps.ts";

const startOBJ = {
  ree: 12,
};

Deno.test({
  name: "setValue Save",
  fn: async() => {
    const data = new Stowrage<Record<string, number>>({
      name: "setValue",
      persistent: true,
    });
    
    await data.init();
    
    data.add("something", startOBJ);
    data.add("something2", startOBJ);
    
    let before = data.fetch("something").data.ree;
    data.setValue("something", { key: "ree", value: -7 });
    assertNotEquals(before, data.fetch("something").data.ree);

    before = data.fetch("something2").data.ree;
    data.setValue("something2", { key: "ree", value: 242 });
    assertNotEquals(before, data.fetch("something2").data.ree);
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
