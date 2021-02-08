# Documentation

## Create a new Stowrage

### Basic

the most basic example of creating an Stowrage

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage();
```

### typesafe Stowrage

A typesafe Stowrage only allow's user listed types to be used  
The example shown below only allow's string's to be used

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
```

### Stowrage Options

Stowrage allow's for a few options to be used which are all optional

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage({
  name: "some name", // name of the Stowrage
  saveToDisk: true, // allow's you to save to disk
  maxEntries: 5, // max entries allowed in the Stowrage, automatically discard the oldest entry
});
```

## Return types

`fetch` & `ensure` will always return the following object

```ts
interface DataBase {
  id: number;
  name: string;
  data: userDefined;
}
```

`fetchByRange` will return an array of this object

## Methods

### ensure(name: string, data: userDefinedType)

Ensure allow's the user to add data and immediately return it

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
console.log(await data.ensure("name", "string"));
/** expected output:
{
    id: 0,
    name: "name",
    data: "string"
}
*/
```

### add(name: string, data: userDefinedType)

Add is the same as ensure, but it does not return the data

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("name", "string");
```

### fetch(IDName: number|string)

get 1 entry by id or name

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");

console.log(await fetch("somename"));
// these give the same results
console.log(await fetch(0));
/** expected output:
{
    id: 0,
    name: "name",
    data: "string"
}
```

### fetchByRange(begin: number, length: number)

fetch all entries from a range

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");
await data.add("somename1", "string");

console.log(await fetchByRange(0, 2));
/** expected output:
[
    {
        id: 0,
        name: "somename",
        data: "string"
    },
    {
        id: 1,
        name: "somename1",
        data: "string"
    }

]
```

### override(IDName: number|string, data: userDefinedType, newName?: string)

override an entry by searching for it's name or id

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

await data.add("name", "string"));

await data.override("name", "other string", "newname");
console.log(await data.fetch("newname"));
/** expected output:
{
    id: 0,
    name: "newname"
    data: "other string"
}
*/
```

### setValue(IDName: number|string, value: unknown, extraOptions?: SetValueOptions)

set a value of an entry(or key of the entry)

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

await data.add("name", "string");

await data.setValue("name", "newValue");
```

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<Record<string, string>>();

const obj = {
  thing: "value",
};

console.log(await data.ensure("name", obj));
/** expected output:
{
    id: 0,
    name: "name",
    data: {
        thing: "value"
    }
}
*/

await data.setValue("name", "new value", { key: "thing" });
console.log(await data.fetch("name"));
/** expected output:
{
    id: 0,
    name: "name",
    data: {
        thing: "new value"
    }
}
*/
```

### incValue(IDName: number|string, key?: string)

this has the same idea as setValue but it only increments a number

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<Record<string, number>>();
const obj = {
  thing: 12,
};
console.log(await data.ensure("name", obj));
/** expected output: 
{
  thing: 12
}
*/

await data.incValue("name", "key");
console.log(await data.fetch("name"));
/** expected output: 
{
  thing: 13
}
*/
```

or for just numbers

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<number>();

console.log(await data.ensure("name", 17);
/** expected output:
{
    id: 0,
    name: "name",
    data: 17
}
*/
await data.incValue("name");
console.log(await data.fetch("name"));
/**
{
    id: 0,
    name: "name",
    data: 18
}
*/
```

### delete(IDName: string|number)

Delete 1 entry from the map via a name or id

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();

await data.ensure("name", "string");

await data.delete(0);
// these do the same thing
await data.delete("name");
```

### DeleteByRange(begin: number, length: number)

Same as fetchByRange but it deletes the entries instead of fetching them

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");
await data.add("somename1", "string");

await data.deleteByRange(0, 1);
```

### deleteStowrage()

delete everything in the Stowrage  
and also the stowrage file if `saveToDisk` is used

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");
await data.add("somename1", "string");

await data.deleteStowrage();
// Stowrage is now cleared
```

### stowrageSize()

Get the size of the Stowrage

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");
await data.add("somename1", "string");

console.log(data.stowrageSize());
```

### totalEntries()

gives the amount of total entries

```ts
import { Stowrage } from "https://deno.land/x/stowrage/mod.ts";

const data = new Stowrage<string>();
await data.add("somename", "string");
await data.add("somename1", "string");

console.log(data.totalEntries());
// expected output: 2
```
