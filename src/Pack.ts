import * as indexFile from "./indexFile.ts";
import * as metaFile from "./metaFile.ts";
import * as packFile from "./packFile.ts";
import { cmd } from "./utils/cmd.ts";

import type { IndexFile } from "./indexFile.ts";
import type {
  CurseForgeMetaFile,
  MetaFile,
  ModrinthMetaFile,
} from "./metaFile.ts";
import type { PackFile } from "./packFile.ts";
import type { ModLoader } from "./shared/types.ts";

const METAFILE_EXTENSION_LENGTH = ".pw.toml".length;

function slug(filePath: string) {
  return filePath.split("/")[1]
    .slice(0, -METAFILE_EXTENSION_LENGTH);
}

async function run(rootDir: string, command: string) {
  const result = await cmd(rootDir, command);

  if (!result.success) throw new Error(result.stdout);
}

type BaseExportOptions = {
  /** @default "." */
  dir?: string;
  /**
   * Do not include the file extension.
   *
   * @default `${pack.name}-${pack.version}` // in the pack directory
   */
  fileName?: string;
};

type CurseForgeExportOptions = BaseExportOptions & {
  /** @default "client" */
  side?: "client" | "server";
};

type ModrinthExportOptions = BaseExportOptions & {
  /**
   * Restricts domains to those allowed by modrinth.com
   *
   * @default true
   */
  restrictDomains?: boolean;
};

export type ExportOptions = CurseForgeExportOptions | ModrinthExportOptions;

type CurseforgeAddOptions = {
  category?: string;
  fileID?: number;
};

type ModrinthAddOptions = {
  projectID?: string;
  versionFilename?: string;
  versionID?: string;
};

export type AddOptions = CurseforgeAddOptions | ModrinthAddOptions;

export declare namespace Pack {
  export {
    AddOptions,
    CurseforgeAddOptions,
    CurseForgeExportOptions,
    CurseForgeMetaFile,
    ExportOptions,
    IndexFile,
    MetaFile,
    ModLoader,
    ModrinthAddOptions,
    ModrinthExportOptions,
    ModrinthMetaFile,
    PackFile,
  };
}

export class Pack {
  readonly packFilePath: string;
  readonly indexFilePath: string;
  #file: PackFile;
  #index: IndexFile;
  #metaFiles: Map<string, MetaFile> = new Map();
  #otherFiles: Set<string> = new Set();

  /**
   * Instantiate a packwiz modpack.
   *
   * **Warning**: during initialization, this will synchronously read the pack.
   * toml, index.toml, and all metafiles from disk.
   */
  constructor(
    readonly rootDir: string = Deno.cwd(),
  ) {
    this.packFilePath = `${rootDir}/pack.toml`;
    this.#file = packFile.readSync(this.packFilePath);

    this.indexFilePath = `${rootDir}/${this.#file.index.file}`;
    this.#index = indexFile.readSync(this.indexFilePath);

    for (const entry of this.#index.files) {
      if (entry.metafile) {
        this.#metaFiles.set(
          entry.file,
          metaFile.readSync(`${rootDir}/${entry.file}`),
        );
      } else {
        this.#otherFiles.add(entry.file);
      }
    }
  }

  get file(): PackFile {
    return { ...this.#file };
  }

  get index(): IndexFile {
    return { ...this.#index };
  }

  get metaFiles() {
    const result = {} as Record<string, MetaFile>;

    for (const [filePath, metaFile] of this.#metaFiles) {
      result[filePath] = { ...metaFile };
    }

    return result;
  }

  get mods() {
    const result = {} as Record<string, MetaFile>;

    for (const [filePath, metaFile] of this.#metaFiles) {
      if (filePath.startsWith("mods/")) {
        result[slug(filePath)] = { ...metaFile };
      }
    }

    return result;
  }

  get modSlugs() {
    const result = [] as string[];

    for (const filePath of this.#metaFiles.keys()) {
      if (filePath.startsWith("mods/")) {
        result.push(slug(filePath));
      }
    }

    return result;
  }

  get resourcePacks() {
    const result = {} as Record<string, MetaFile>;

    for (const [filePath, metaFile] of this.#metaFiles) {
      if (filePath.startsWith("resourcepacks/")) {
        result[slug(filePath)] = { ...metaFile };
      }
    }

    return result;
  }

  get resourcePackSlugs() {
    const result = [] as string[];

    for (const filePath of this.#metaFiles.keys()) {
      if (filePath.startsWith("resourcepacks/")) {
        result.push(slug(filePath));
      }
    }

    return result;
  }

  get otherFiles() {
    return [...this.#otherFiles];
  }

  get name(): string {
    return this.#file.name;
  }

  set name(name: string) {
    this.#file = packFile.writeSync(this.packFilePath, { ...this.#file, name });
  }

  get version(): string {
    return this.#file.version;
  }

  set version(version: string) {
    this.#file = packFile.writeSync(
      this.packFilePath,
      { ...this.#file, version },
    );
  }

  get modLoader(): ModLoader {
    const versions = this.#file.versions;

    return versions.forge
      ? "Forge"
      : versions.fabric
      ? "Fabric"
      : versions.quilt
      ? "Quilt"
      : "LiteLoader";
  }

  get modLoaderVersion(): string {
    const key = this.modLoader.toLowerCase() as Lowercase<ModLoader>;

    return this.#file.versions[key]!;
  }

  /**
   * @param slugOrSearchOrURL slug, search string, or URL. Examples: "jei", "Just Enough Items", "https://www.curseforge.com/minecraft/mc-mods/jei"
   */
  add(
    type: "curseforge",
    slugOrSearchOrURL: string,
    options?: CurseforgeAddOptions,
  ): Promise<void>;
  /**
   * @param slugOrSearchOrURL slug, search string, or URL. Examples: "indium", "Fabric Rendering Sodium", "https://modrinth.com/mod/indium"
   */
  add(
    type: "modrinth",
    slugOrSearchOrURL: string,
    options?: ModrinthAddOptions,
  ): Promise<void>;
  async add(
    type: "curseforge" | "modrinth",
    slugOrSearchOrURL: string,
    options: AddOptions = {},
  ): Promise<void> {
    if (type === "curseforge") {
      const { category, fileID } = options as CurseforgeAddOptions;

      const cat = category ? `--category ${category}` : "";
      const file = fileID ? `--file-id ${fileID}` : "";

      await run(
        this.rootDir,
        `packwiz curseforge add "${slugOrSearchOrURL}" ${cat} ${file} -y`,
      );
    } else {
      const { versionID, projectID, versionFilename } =
        options as ModrinthAddOptions;

      const ver = versionID ? `--version ${versionID}` : "";
      const proj = projectID ? `--project ${projectID}` : "";
      const file = versionFilename
        ? `--version-filename ${versionFilename}`
        : "";

      await run(
        this.rootDir,
        `packwiz modrinth add "${slugOrSearchOrURL}" ${ver} ${proj} ${file} -y`,
      );
    }

    await this.#refresh();
  }

  async addExternal(name: string, url: string) {
    await run(this.rootDir, `packwiz url add "${name}" ${url}`);
    await this.#refresh();
  }

  /** @example pack.update("quark") */
  async update(slug: string) {
    await run(this.rootDir, `packwiz update ${slug}`);
    await this.#refresh();
  }

  async updateAll() {
    await run(this.rootDir, `packwiz update -a`);
    await this.#refresh();
  }

  export(type: "curseforge", options?: CurseForgeExportOptions): Promise<void>;
  export(type: "modrinth", options?: ModrinthExportOptions): Promise<void>;
  async export(type: "curseforge" | "modrinth", options: ExportOptions = {}) {
    const {
      dir = ".",
      fileName = `${this.name}-${this.version}`,
    } = options;

    const ext = type === "curseforge" ? ".zip" : ".mrpack";
    const filePath = `${dir}/${fileName}${ext}`;

    if (type === "curseforge") {
      const { side = "client" } = options as CurseForgeExportOptions;

      await run(
        this.rootDir,
        `packwiz curseforge export -o "${filePath}" --side ${side}`,
      );
    } else {
      const { restrictDomains = true } = options as ModrinthExportOptions;

      const flag = !restrictDomains ? "--restrictDomains=false" : "";

      await run(
        this.rootDir,
        `packwiz modrinth export -o "${filePath}" ${flag}`,
      );
    }
  }

  /** CurseForge only. */
  async importModpack(zipFilePath: string) {
    await run(this.rootDir, `packwiz curseforge import ${zipFilePath}`);
    await this.#refresh();
  }

  /** CurseForge only. */
  async refresh() {
    await run(this.rootDir, `packwiz refresh`);
    await this.#refresh();
  }

  /**
   * @example pack.remove("quark") // remove mods/quark.pw.toml
   * @example pack.remove("kubejs/client_scripts/foo.js")
   *
   * @param slugOrFilePath A metafile slug, or the filepath of a non-metafile. Refer to `pack.metaFiles` and `pack.otherFiles` for valid inputs.
   */
  async remove(slugOrFilePath: string) {
    if (this.#otherFiles.has(slugOrFilePath)) {
      await Deno.remove(`${this.rootDir}/${slugOrFilePath}`);
      await this.refresh();
    } else if (this.#metaFiles.has(slugOrFilePath)) {
      await run(this.rootDir, `packwiz remove ${slug}`);
      await this.#refresh();
    } else {
      throw new Error(
        `Invalid input "${slugOrFilePath}". Expected a metafile slug or the filepath of a non-metafile.`,
      );
    }
  }

  /** CurseForge only. Detects `.jar`s and creates metafiles for them. */
  async detect() {
    await run(this.rootDir, `packwiz curseforge detect`);
    await this.#refresh();
  }

  async #refresh() {
    const beforeIndexHash = this.#file.index.hash;
    this.#file = packFile.readSync(this.packFilePath);
    const afterIndexHash = this.#file.index.hash;

    if (beforeIndexHash !== afterIndexHash) {
      const beforeFiles = Object.fromEntries(this.#index.files
        .map((entry) => [entry.file, entry]));

      this.#index = indexFile.readSync(this.indexFilePath);
      const afterFiles = new Set<string>();

      await Promise.all(this.#index.files
        .map(async ({ file: filePath, hash, metafile }) => {
          afterFiles.add(filePath);

          const beforeHash = beforeFiles[filePath]?.hash as string | undefined;
          const created = !beforeHash;
          const updated = beforeHash && beforeHash !== hash;
          const otherFile = !metafile;

          if (!created && !updated) return;
          if (updated && otherFile) return;

          if (created && otherFile) {
            this.#otherFiles.add(filePath);
          } else {
            const metaFilePath = `${this.rootDir}/${filePath}`;
            this.#metaFiles.set(filePath, await metaFile.read(metaFilePath));
          }
        }));

      for (const filePath in beforeFiles) {
        if (afterFiles.has(filePath)) continue;

        if (beforeFiles[filePath].metafile) {
          this.#metaFiles.delete(filePath);
        } else {
          this.#otherFiles.delete(filePath);
        }
      }
    }
  }
}
