# Packwiz for Deno

An ergonomic Deno wrapper around the CLI tool [packwiz](https://packwiz.infra.link/), used to create and manage Minecraft modpacks.

## Table of Contents

- [Getting Started](#getting-started)
  - [Packwiz Install Helper](#packwiz-install-helper)
  - [Project Initialization](#project-initialization)
- [Type Definitions](#type-definitions)
- [Project Scope](#project-scope)

## Getting Started

In a Deno project, with `packwiz` available on your `PATH`:

```ts
import { Pack } from "https://deno.land/x/packwiz@0.1.0/mod.ts";

const pack = new Pack("path/to/pack/directory");

await pack.add("curseforge", "quark"); // creates mods/quark.pw.toml
console.log(pack.mods.quark); // contents of mods/quark.pw.toml
await pack.update("quark"); // updates mods/quark.pw.toml
await pack.remove("quark"); // removes mods/quark.pw.toml
```

See the [API docs](https://deno.land/x/packwiz/mod.ts) for more information.

### Packwiz Install Helper

To download the latest version of `packwiz`, run this in your project directory:

```sh
deno run -A https://deno.land/x/packwiz/install.ts
```

You can also provide a directory path as an argument to install elsewhere:

```sh
deno run -A https://deno.land/x/packwiz/install.ts /path/to/directory
```

### Project Initialization

Generally you will want to initialize a new project with `packwiz` CLI, which guides you through the process:

```sh
packwiz init
```

This library also provides a standalone function to do the same thing programmatically:

```ts
import { initialize } from "https://deno.land/x/packwiz/mod.ts";

initialize({
  author: "me",
  name: "my modpack",
  minecraftVersion: "1.18.2",
  modLoader: "Forge",
  rootDir: "./temp",
  exePath: "./packwiz",
});
```

## Type Definitions

```ts
import type { ModFile } from "https://deno.land/x/packwiz@0.1.0/mod.ts";
```

Types are also re-exported under the `Packwiz` namespace, which is merged with the main `Packwiz` class. This allows you to keep your imports very clean, and in more complex files it contextualizes type names for ease of comprehension.

```ts
import { Pack } from "https://deno.land/x/packwiz@0.1.0/mod.ts";

const pack = new Pack("path/to/pack");

function curseForgeFiles(): Pack.ModFile[] {
  return (await pack.modFiles())
    .filter((file) => file.download === "metadata:curseforge");
}
```

## Project Scope

Given `const pack = new Pack()` for brevity:

| CLI Command                 | Deno API                                  |
| --------------------------- | ----------------------------------------- |
| `packwiz completion`        | Not supported                             |
| `packwiz curseforge add`    | `pack.add("curseforge", options)`         |
| `packwiz curseforge detect` | `pack.detect(slug)`                       |
| `packwiz curseforge export` | `pack.export("curseforge", options)`      |
| `packwiz curseforge import` | `pack.importModpack`                      |
| `packwiz curseforge open`   | Not supported                             |
| `packwiz init`              | Standalone function `initialize(options)` |
| `packwiz list`              | Use `pack.files` for this info and more   |
| `packwiz modrinth add`      | `pack.add("modrinth", options)`           |
| `packwiz modrinth export`   | `pack.export("modrinth", options)`        |
| `packwiz refresh`           | `pack.refresh()`                          |
| `packwiz remove`            | `pack.remove(slug)`                       |
| `packwiz serve`             | Planned                                   |
| `packwiz update`            | `pack.update(slug)`                       |
| `packwiz url add`           | `pack.add("external", options)`           |
| `packwiz utils`             | Not supported                             |
