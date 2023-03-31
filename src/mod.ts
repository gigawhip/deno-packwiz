/**
 * Programmatically manage a packwiz modpack with Deno.
 *
 * @example
 * ```ts
 * import { Pack } from "https://deno.land/x/packwiz@0.1.0/mod.ts";
 *
 * const pack = new Pack("path/to/pack/directory");
 *
 * await pack.add("curseforge", "quark"); // creates mods/quark.pw.toml
 * console.log(pack.mods.quark); // contents of mods/quark.pw.toml
 * await pack.update("quark"); // updates mods/quark.pw.toml
 * await pack.remove("quark"); // removes mods/quark.pw.toml
 * ```
 *
 * @module
 */

export { Pack } from "./Pack.ts";
export { initialize } from "./initialize.ts";
export * as indexFile from "./indexFile.ts";
export * as metaFile from "./metaFile.ts";
export * as packFile from "./packFile.ts";
export * from "./shared/types.ts";
