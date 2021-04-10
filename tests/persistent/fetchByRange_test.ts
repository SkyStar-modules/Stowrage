import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

Deno.test({
  name: "fetchByRange Save",
  fn: async () => {
    const data = new Stowrage<string>({
      name: "fetchByRange",
      persistent: true,
    });

    await data.init();

    data.add("something", "string");
    data.add("something2", "string");

    const fetched = [data.fetchByID(0), data.fetchByID(1)];
    assertEquals(fetched, data.fetchByRange(0, 2));
    data.close();
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
