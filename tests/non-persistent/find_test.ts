import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "find",
});

Deno.test({
  name: "find",
  fn: () => {
    const ensure = data.ensure("coolEntry", "string");

    assertEquals(
      ensure,
      data.find((value) => value.name === "coolEntry"),
    );
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
