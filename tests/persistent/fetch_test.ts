import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "fetch Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "fetch",
      persistent: true,
    });
    
    await data.init();
    
    data.add("something2", "string");
    
    assertEquals(data.fetchByID(0), data.fetch("something2"));
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
