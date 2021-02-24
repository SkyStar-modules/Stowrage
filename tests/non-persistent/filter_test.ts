import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "filter",
});

data.add("something", "string");

Deno.test({
  name: "filter",
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
