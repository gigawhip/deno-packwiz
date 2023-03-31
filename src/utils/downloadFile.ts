import { writeAll } from "https://deno.land/std@0.181.0/streams/write_all.ts";

export async function downloadFile(url: string, filePath: string) {
  const buffer = await fetch(url).then((response) => response.arrayBuffer());
  const file = await Deno.open(
    filePath,
    { write: true, create: true, truncate: true },
  );

  await writeAll(file, new Uint8Array(buffer));

  file.close();
}
