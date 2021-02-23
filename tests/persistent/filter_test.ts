import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "filter",
  isPersistent: true,
});

await data.init();

data.add("something", "string");

Deno.test({
  name: "filter Save",
  fn: () => {
    const fetch = data.fetchByRange(0, 1);
    assertEquals(
      fetch,
      data.filter((value: any) => value.name === "something"),
    );
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
