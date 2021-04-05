# Stowrage

![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fstowrage%2Fmod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fstowrage%2Fmod.ts)\
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fx%2Fstowrage%2Fmod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fx%2Fstowrage%2Fmod.ts)

## Why use stowrage?

- Easy to use
- Fastest memory DB
- Reliable
- Good introduction to better solution's

## Quick Example

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>({
  name: "some name", // name of the Stowrage
  persistent: true, // allow's you to save to disk
  maxEntries: 5, // max entries allowed in the Stowrage, automatically discard the oldest entry
});

await data.ensure("coolname", "sumstring");
```

## Documentation

All the docs for stable can be found
[here](https://deno.land/x/stowrage/docs/docs.md)\
If some of the types are unclear, I highly recommend checking out
[doc.deno.land](https://doc.deno.land/https/deno.land/x/stowrage/mod.ts) If you
want doc's for the github branch, that can be found
[here](https://github.com/SkyStar-modules/Stowrage/blob/main/docs/docs.md)

## Releases

All stable releases will be uploaded to [/x](https://deno.land/x/stowrage).\
The [main github branch](https://github.com/SkyStar-modules/Stowrage) will be
like a beta for new features.\
The [dev github branch](https://github.com/SkyStar-modules/Stowrage/tree/dev)
will be an alpha/dev built which get's alot of changes which might break and be
buggy.\
The [dev github branch](https://github.com/SkyStar-modules/Stowrage/tree/dev)
and has some benchmark results in it

## Authors & Acknowledgments

- [Skyler "MierenMans" van Boheemen](https://github.com/MierenManz) - Author
- [TheForgottenOne](https://github.com/ZiomaleQ) - Added types

## Contributing

if you want to contribute you can always make an
[issue](https://github.com/SkyStar-modules/Stowrage/issues) or
[PR](https://github.com/SkyStar-modules/Stowrage/pulls)).\
[click here for more info](CONTRIBUTING.md)
