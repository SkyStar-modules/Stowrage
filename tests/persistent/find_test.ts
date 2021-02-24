import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "find Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "find",
      persistent: true,
    });
    
    await data.init();
        
    const ensure = data.ensure("coolEntry", "string");

    assertEquals(
      ensure,
      data.find((value: any) => value.name === "coolEntry"),
    );
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
