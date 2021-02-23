import { Stowrage } from "../../mod.ts";
import { assertEquals } from "../devdeps.ts";

const data = new Stowrage<string>({
  name: "find",
  isPersistent: true,
});

await data.init();

Deno.test({
  name: "find Save",
  fn: () => {
    const ensure = data.ensure("coolEntry", "string");

    assertEquals(
      ensure,
      data.find((value: any) => value.name === "coolEntry"),
    );
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
