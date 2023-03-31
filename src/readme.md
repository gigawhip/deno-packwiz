# Packwiz for Deno

An ergonomic Deno wrapper around the CLI tool [packwiz](https://packwiz.infra.link/), used to create and manage Minecraft modpacks.

## Table of Contents

- [Getting Started](#getting-started)
  - [Project Initialization](#project-initialization)
- [Scripts](#scripts)
  - [Install Packwiz Executable](#install-packwiz-executable)
  - [Development and Playtesting with MultiMC](#development-and-playtesting-with-multimc)
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

See the [API docs](https://deno.land/x/packwiz@0.1.0/mod.ts) for more information.

### Project Initialization

Generally you will want to initialize a new project with `packwiz` CLI, which guides you through the process:

```sh
packwiz init
```

This library also provides a standalone function to use the CLI programmatically:

```ts
import { initialize } from "https://deno.land/x/packwiz@0.1.0/mod.ts";

initialize({
  author: "me",
  name: "my modpack",
  minecraftVersion: "1.18.2",
  modLoader: "Forge",
  rootDir: "./temp",
  exePath: "./packwiz",
});
```

## Scripts

### Install Packwiz Executable

To download the latest version of `packwiz`, run this in your project directory:

```sh
deno run -A https://deno.land/x/packwiz@0.1.0/install.ts
```

You can also provide a directory path install elsewhere:

```sh
deno run -A https://deno.land/x/packwiz@0.1.0/install.ts /path/to/directory
```

### Development and Playtesting with MultiMC

Packwiz provides a unique method of playtesting modpacks by creating a MultiMC instance that is automatically updated with the latest version of your modpack, allowing you to test your modpack without having to manually update it every time you make a change.

A script is provided to streamline and walk you through the process. In your project directory, run:

```sh
deno run -A https://deno.land/x/packwiz@0.1.0/dev.ts
```

You can also provide a path to a packwiz project as an argument:

```sh
deno run -A https://deno.land/x/packwiz@0.1.0/dev.ts /path/to/packwiz/project
```

## Type Definitions

```ts
import type { MetaFile } from "https://deno.land/x/packwiz@0.1.0/mod.ts";
```

Types are also re-exported under the `Pack` namespace, which is merged with the main `Pack` class. This allows you to keep your imports very clean, and in more complex files it contextualizes type names for ease of comprehension.

```ts
import { Pack } from "https://deno.land/x/packwiz@0.1.0/mod.ts";

const pack = new Pack("path/to/pack");

const curseForgeMods = Object.values(pack.mods)
  .filter((file): file is Pack.CurseForgeMetaFile =>
    "curseforge" in file.update
  );
```

## Project Scope

Given `const pack = new Pack()` for brevity:

| CLI Command                 | Deno API                                   |
| --------------------------- | ------------------------------------------ |
| `packwiz completion`        | Not supported directly                     |
| `packwiz curseforge add`    | `pack.add("curseforge", slug, options)`    |
| `packwiz curseforge detect` | `pack.detect()`                            |
| `packwiz curseforge export` | `pack.export("curseforge", options)`       |
| `packwiz curseforge import` | `pack.importModpack()`                     |
| `packwiz curseforge open`   | Not supported directly                     |
| `packwiz init`              | Standalone function `initialize(options)`  |
| `packwiz list`              | Use `pack.metaFiles` and `pack.otherFiles` |
| `packwiz modrinth add`      | `pack.add("modrinth", slug, options)`      |
| `packwiz modrinth export`   | `pack.export("modrinth", options)`         |
| `packwiz refresh`           | `pack.refresh()`                           |
| `packwiz remove`            | `pack.remove(slug)`                        |
| `packwiz serve`             | Part of the `dev` script                   |
| `packwiz update`            | `pack.update(slug)` and `pack.updateAll()` |
| `packwiz url add`           | `pack.addExternal(name, url)`              |
| `packwiz utils`             | Not supported directly                     |
