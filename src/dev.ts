import { compress as zipFile } from "https://deno.land/x/zip@v1.2.5/mod.ts";

import type { PackFile } from "./packFile.ts";
import type { ModLoader } from "./shared/types.ts";

import { Pack } from "./Pack.ts";
import { downloadFile } from "./utils/downloadFile.ts";

async function createCfgFile(devModpackDir: string, packName: string) {
  const filePath = "instance.cfg";

  await Deno.writeTextFileSync(
    `${devModpackDir}/${filePath}`,
    "iconKey=default\n" +
      "OverrideCommands=true\n" +
      `PreLaunchCommand="$INST_JAVA" -jar packwiz-installer-bootstrap.jar http://localhost:8080/pack.toml -g\n` +
      `name=${packName} Dev Modpack`,
  );

  return filePath;
}

function createMmcPackData(
  minecraftVersion: string,
  modLoader: ModLoader,
  modLoaderVersion: string,
): Record<string, unknown> {
  const minecraftDetails = {
    "important": true,
    "uid": "net.minecraft",
    "version": minecraftVersion,
  };

  const modLoaderDetails = {
    uid: modLoader === "Forge"
      ? "net.minecraftforge"
      : modLoader === "Fabric"
      ? "net.fabricmc.fabric-loader"
      : modLoader === "Quilt"
      ? "org.quiltmc.quilt-loader"
      : "com.mumfrey.liteloader",
    version: modLoaderVersion,
  };

  return {
    "components": [
      minecraftDetails,
      modLoaderDetails,
    ],
    "formatVersion": 1,
  };
}

async function createMmcPackJson(
  devModpackDir: string,
  minecraftVersion: string,
  modLoader: ModLoader,
  modLoaderVersion: string,
) {
  const filePath = "mmc-pack.json";

  await Deno.writeTextFileSync(
    `${devModpackDir}/${filePath}`,
    JSON.stringify(
      createMmcPackData(minecraftVersion, modLoader, modLoaderVersion),
      null,
      2,
    ),
  );

  return filePath;
}

async function downloadBootstrapper(devModpackDir: string) {
  const url =
    "https://api.github.com/repos/packwiz/packwiz-installer-bootstrap/releases/latest";

  const response = await fetch(url);
  const data = await response.json();

  const downloadUrl = data.assets[0].browser_download_url;
  const filePath = ".minecraft/packwiz-installer-bootstrap.jar";

  await downloadFile(downloadUrl, `${devModpackDir}/${filePath}`);

  return filePath;
}

export async function createDevModpack(
  rootDir: string,
  packFile: PackFile,
  modLoader: ModLoader,
) {
  const mcVersion = packFile.versions.minecraft;
  const key = modLoader.toLowerCase() as Lowercase<ModLoader>;
  const mlVersion = packFile.versions[key]!;
  const devPackSlug = `devpack-${mcVersion}-${modLoader}-${mlVersion}`;

  Deno.chdir(rootDir);

  await Deno.mkdir(`${devPackSlug}/.minecraft`, { recursive: true });

  const cfgFilePath = await createCfgFile(devPackSlug, packFile.name);
  const mmcPackFilePath = await createMmcPackJson(
    devPackSlug,
    mcVersion,
    modLoader,
    mlVersion,
  );
  const bootstrapperFilePath = await downloadBootstrapper(devPackSlug);

  await Deno.chdir(devPackSlug);

  const zipFileName = `${devPackSlug}.zip`;
  await zipFile(
    [cfgFilePath, mmcPackFilePath, bootstrapperFilePath],
    `${devPackSlug}.zip`,
    { overwrite: true, flags: [] },
  );

  await Deno.chdir("..");
  await Deno.rename(
    `${devPackSlug}/${zipFileName}`,
    zipFileName,
  );

  await Deno.remove(devPackSlug, { recursive: true });

  return zipFileName;
}

if (import.meta.main) {
  const [rootDir = Deno.cwd()] = Deno.args;

  console.log(`Creating modpack zip file...`);

  const pack = new Pack(rootDir);
  const zip = await createDevModpack(pack.rootDir, pack.file, pack.modLoader);

  await Deno.run({ cmd: ["clear"] }).status();

  console.log(`
Created ${rootDir}/${zip}

In MultiMC or one of its forks, create a new Minecraft instance by importing 
the zip file.

As long as \`packwiz serve\` is running, each time you launch the instance it
will update its mods, scripts, and configs to match your packwiz project.

Running \`packwiz serve\` now:
`);

  const process = Deno.run({
    cmd: ["packwiz", "serve"],
    cwd: pack.rootDir,
  });
  await process.status();
}
