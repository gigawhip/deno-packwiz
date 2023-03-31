import * as toml from "https://deno.land/std@0.181.0/toml/mod.ts";
import { Mutable } from "./utils/Mutable.ts";

export type IndexEntry = {
  readonly file: string;
  readonly hash: string;
  readonly metafile?: true;
};

export type IndexFile = {
  readonly "hash-format": string;
  readonly files: IndexEntry[];
};

export function readSync(filePath: string) {
  const data = toml
    .parse(Deno.readTextFileSync(filePath)) as Mutable<IndexFile>;

  if (!data.files) data.files = [];

  return data as IndexFile;
}
