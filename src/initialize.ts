import type { ModLoader } from "./shared/types.ts";

type InitializeOptions = {
  /**
   * Path to the packwiz executable. Defaults to `"./packwiz"`
   *
   * If `rootDir` option is provided, `exePath` will be resolved relative to
   * `rootDir`.
   */
  exePath?: string;
  /** @default "." */
  rootDir?: string;
  author: string;
  /** Name of your modpack */
  name: string;
  /**
   * Version of your modpack.
   * @default "1.0.0"
   */
  version?: string;
  /** @example "1.19.2" */
  minecraftVersion: string;
  modLoader: ModLoader;
};

/**
 * Initialize a new Packwiz modpack using the latest version of your chosen
 * mod loader. If you need to use a specific version of a mod loader, use the
 * packwiz CLI directly.
 */
export async function initialize(details: InitializeOptions) {
  const {
    author,
    name,
    version = "1.0.0",
    modLoader,
    minecraftVersion,
    exePath = "./packwiz",
    rootDir = ".",
  } = details;

  const modLoaderFlag = modLoader === "Forge"
    ? "--forge-latest"
    : modLoader === "Fabric"
    ? "--fabric-latest"
    : modLoader === "Quilt"
    ? "--quilt-latest"
    : "--liteloader-latest";

  const process = Deno.run({
    cmd: [
      exePath,
      "init",
      "--name",
      name,
      "--author",
      author,
      "--version",
      version,
      "--mc-version",
      minecraftVersion,
      "--modloader",
      modLoader,
      modLoaderFlag,
    ],
    cwd: rootDir,
  });

  await process.status().then(({ success }) => {
    if (!success) {
      console.error("Failed to initialize modpack");
      Deno.exit(1);
    }
  });
}
