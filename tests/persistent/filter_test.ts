import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "filter Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "filter",
      persistent: true,
    });
    
    await data.init();
    
    data.add("something", "string");    
    const fetch = data.fetchByRange(0, 1);
    assertEquals(
      fetch,
      data.filter((value: any) => value.name === "something"),
    );
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
