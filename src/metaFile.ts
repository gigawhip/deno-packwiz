import * as toml from "https://deno.land/std@0.181.0/toml/mod.ts";

import type { Mutable } from "./utils/Mutable.ts";

export type CurseForgeMetaFile = {
  /** The filepath to the meta file. */
  readonly path: string;
  readonly name: string;
  readonly filename: string;
  readonly side: "server" | "client" | "both";
  readonly download: {
    readonly "hash-format": "sha1" | "md5";
    readonly hash: string;
    readonly mode: "metadata:curseforge";
  };
  readonly update: {
    readonly curseforge: {
      readonly "file-id": number;
      readonly "project-id": number;
    };
  };
};

export type ModrinthMetaFile = {
  /** The filepath to the meta file. */
  readonly path: string;
  readonly name: string;
  readonly filename: string;
  readonly side: "server" | "client" | "both";
  readonly download: {
    readonly url: string;
    readonly "hash-format": "sha1" | "md5";
    readonly hash: string;
  };
  readonly update: {
    readonly modrinth: {
      readonly "mod-id": number;
      readonly "version": number;
    };
  };
};

export type MetaFile = CurseForgeMetaFile | ModrinthMetaFile;

export async function read(filePath: string) {
  const data = toml
    .parse(await Deno.readTextFile(filePath)) as Mutable<MetaFile>;

  data.path = filePath;

  return data as MetaFile;
}

export function readSync(filePath: string) {
  const data = toml
    .parse(Deno.readTextFileSync(filePath)) as Mutable<MetaFile>;

  data.path = filePath;

  return data as MetaFile;
}
