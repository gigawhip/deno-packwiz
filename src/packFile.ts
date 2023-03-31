import * as toml from "https://deno.land/std@0.181.0/toml/mod.ts";

import type { ModLoader } from "./shared/types.ts";

export type PackFile = {
  readonly name: string;
  readonly version: string;
  readonly "pack-format": string;
  readonly index: {
    readonly file: string;
    readonly "hash-format": string;
    readonly hash: string;
  };
  versions: Partial<Readonly<Record<Lowercase<ModLoader>, string>>> & {
    readonly minecraft: string;
  };
};

export function readSync(filePath: string) {
  return toml.parse(Deno.readTextFileSync(filePath)) as PackFile;
}

/** Write pack.toml in the same shape as the original. */
export function writeSync(filePath: string, pack: PackFile) {
  const _pack: PackFile = {
    name: pack.name,
    version: pack.version,
    "pack-format": pack["pack-format"],
    index: {
      file: pack.index.file,
      "hash-format": pack.index["hash-format"],
      hash: pack.index.hash,
    },
    versions: {
      fabric: pack.versions.fabric,
      forge: pack.versions.forge,
      liteloader: pack.versions.liteloader,
      minecraft: pack.versions.minecraft,
      quilt: pack.versions.quilt,
    },
  };

  Deno.writeTextFileSync(filePath, toml.stringify(_pack));

  return _pack;
}
