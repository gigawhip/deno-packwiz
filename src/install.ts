import { exists } from "https://deno.land/std@0.181.0/fs/exists.ts";
import { decompress as unzipFile } from "https://deno.land/x/zip@v1.2.5/mod.ts";

import { downloadFile } from "./utils/downloadFile.ts";

/**
 * Downloads the newest version of Packwiz from GitHub Actions.
 *
 * This module exports the `install` function, or you can run it directly with
 * `deno run https://deno.land/x/packwiz@0.1.0/install.ts`.
 *
 * @module
 */

type WorkflowRunsResponse = {
  workflow_runs: Array<{
    conclusion: string;
    status: string;
    check_suite_id: number;
    artifacts_url: string;
    html_url: string;
  }>;
};

type ArtifactsResponse = {
  artifacts: Array<{
    id: number;
    name: string;
    archive_download_url: string;
  }>;
};

async function isPackwizInstalled(exePath: string) {
  const process = Deno.run({ cmd: [exePath, "-h"], stdout: "null" });
  const { success } = await process.status();

  return success;
}

function getOS() {
  const x86 = Deno.build.arch === "x86_64";
  const os = Deno.build.os === "darwin"
    ? "macOS"
    : Deno.build.os === "linux"
    ? "Linux"
    : Deno.build.os === "windows"
    ? "Windows"
    : undefined;

  if (!os) {
    console.error(
      `Unsupported OS: ${Deno.build.os}. Packwiz only supports Linux, macOS, and Windows.`,
    );
    Deno.exit(1);
  }

  return { os, x86 } as const;
}

const RUNS_URL =
  "https://api.github.com/repos/packwiz/packwiz/actions/workflows/go.yml/runs?event=push";

async function getPackwizArtifactURL() {
  const run = (await fetch(RUNS_URL)
    .then<WorkflowRunsResponse>((response) => response.json()))
    .workflow_runs
    .find((run) => run.status === "completed" && run.conclusion === "success");

  if (!run) throw new Error("No successful workflow runs found");

  const { os, x86 } = getOS();

  const artifact = (await fetch(run.artifacts_url)
    .then<ArtifactsResponse>((response) => response.json()))
    .artifacts
    .find(({ name }) => name.includes(os) && (x86 || name.includes("ARM")));

  if (!artifact) {
    console.error(
      `Could not find a Packwiz artifact from the most recent successful workflow:`,
    );
    console.error(run.html_url);
    Deno.exit(1);
  }

  return `https://nightly.link/packwiz/packwiz/suites/${run.check_suite_id}/artifacts/${artifact.id}`;
}

export async function install(dir: string) {
  const exePath = `${dir}/packwiz`;

  if (await exists(exePath)) {
    console.log("Packwiz is already installed at that location: ", exePath);
    return;
  }

  console.log("Getting URL for the most recent build");
  const url = await getPackwizArtifactURL();

  const zipPath = `${exePath}.zip`;

  console.log("Downloading zip file");
  await downloadFile(url, zipPath);

  console.log("Unzipping file");
  await unzipFile(zipPath, dir, { overwrite: true });

  console.log("Removing zip file");
  await Deno.remove(zipPath);

  if (Deno.build.os !== "windows") await Deno.chmod(exePath, 0o777);

  if (await isPackwizInstalled(exePath)) {
    console.log("Packwiz successfully installed at location:", exePath);
    return;
  }
}

if (import.meta.main) {
  // TODO: global flag to install globally
  const dir = Deno.args.length ? Deno.args[0] : Deno.cwd();

  await install(dir);
}
