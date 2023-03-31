export async function cmd(rootDir: string, command: string) {
  const process = await Deno.run({
    cmd: command.trim()
      .split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((arg) => arg.replaceAll('"', "")),
    stdout: "piped",
    stderr: "piped",
    cwd: rootDir,
  });

  const { success } = await process.status();
  const stdout = new TextDecoder().decode(await process.output()).trim();
  const stderr = new TextDecoder().decode(await process.stderrOutput());

  return { success, stdout, stderr };
}
