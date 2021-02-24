import { Stowrage } from "../../mod.ts";

Deno.test({
  name: "has Save",
  fn: async() => {
    const data = new Stowrage<string>({
      name: "has",
      persistent: true,
    });
    
    await data.init();
        
    data.add("coolEntry", "string");
    if (!data.has("coolEntry")) throw "Cool entry not found";
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
