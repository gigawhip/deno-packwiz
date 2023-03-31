import { exists } from "https://deno.land/std@0.181.0/fs/exists.ts";
import { resolve } from "https://deno.land/std@0.181.0/path/mod.ts";
import { Pack } from "../src/mod.ts";
import { install } from "../src/install.ts";
import { initialize } from "../src/initialize.ts";

const __dirname = new URL(".", import.meta.url).pathname;
const projectDir = resolve(__dirname, "..", "my-project");

console.log(`Creating example project in ${projectDir}...`);

if (!await exists(projectDir)) {
  await Deno.mkdir(projectDir, { recursive: true });
}

console.log();
console.log(`Downloading latest packwiz executable...`);

await install(projectDir);

Deno.chdir(projectDir);

console.log();
console.log(`Initializing project...`);

await initialize({
  name: "My Project",
  author: "My Name",
  minecraftVersion: "1.19.2",
  modLoader: "Forge",
});

const pack = new Pack();

console.log();
console.log(`Adding a mod...`);
pack.add("curseforge", "supplementaries");

console.log();
console.log("Modpack created!");
