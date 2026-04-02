#!/usr/bin/env node

import { Sandbox, Snapshot } from "@vercel/sandbox";
import * as fs from "fs/promises";
import * as path from "path";

async function createSandbox(runtime: string = "python3.13", vcpus: number = 1, timeoutMins: number = 5): Promise<Sandbox> {
  return Sandbox.create({
    runtime,
    resources: {
      vcpus,
    },
    timeout: timeoutMins * 60 * 1000,
  });
}

async function setupDirStructure(sandbox: Sandbox): Promise<void> {
  await sandbox.mkDir("leafcode").catch((err) => {
    console.error("Error creating directory in sandbox:", err);
    throw err;
  });

  await sandbox.mkDir("leafcode/runner").catch((err) => {
    console.error("Error creating directory in sandbox:", err);
    throw err;
  });
}

async function provisionPackages(sandbox: Sandbox, packages: string[]): Promise<void> {
  await sandbox.runCommand({
    cmd: 'dnf',
    args: ['install', '-y'].concat(packages),
    stdout: process.stdout,
    stderr: process.stderr,
    sudo: true,
  }).catch((err) => {
    console.error("Error installing packages in sandbox:", err);
    throw err;
  });
}

async function provisionRunnerFiles(sandbox: Sandbox, rootPath: string = "../runner", targetRoot: string = "leafcode/runner"): Promise<void> {
  console.log(`Provisioning directory ${rootPath}...`);
  const ignoreFiles = [".venv", "__pycache__"];

  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const filesToWrite: { path: string; content: Buffer }[] = [];

  for (const entry of entries) {
    if (ignoreFiles.includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      await sandbox.mkDir(`${targetRoot}/${entry.name}`).catch((err) => {
        console.error("Error creating directory in sandbox:", err);
        throw err;
      });
      console.log(`Created dir ${targetRoot}/${entry.name}.`);
      await provisionRunnerFiles(sandbox, entryPath, `${targetRoot}/${entry.name}`);
    } else if (entry.isFile()) {
      const content = await fs.readFile(entryPath);
      filesToWrite.push({ path: `${targetRoot}/${entry.name}`, content });
      console.log(`Added file ${targetRoot}/${entry.name}.`);
    }
  }

  await sandbox.writeFiles(filesToWrite).catch((err) => {
    console.error("Error writing files to sandbox:", err);
    throw err;
  });
}

async function setupRunnerDeps(sandbox: Sandbox) {await sandbox.runCommand({
    cwd: "/vercel/sandbox/leafcode/runner",
    cmd: "pip",
    args: ["install", "-r", "requirements.txt"],
    stdout: process.stdout,
    stderr: process.stderr,
  });
}

async function saveSnapshot(sandbox: Sandbox, permanent: boolean = true): Promise<Snapshot> {
  return sandbox.snapshot(permanent ? { expiration: 0 } : {});
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === "provision") {
    if (args.length < 2 || !args[1]) {
      console.error("Usage: provision <runner-path>");
      process.exit(1);
    }

    const runnerPath = path.resolve(args[1]);
    
    if (!await fs.stat(runnerPath).catch(() => false)) {
      console.error(`Runner path does not exist: ${runnerPath}`);
      process.exit(1);
    }

    const sandbox = await createSandbox();
    // await provisionPackages(sandbox, ['nodejs', 'gcc', 'gcc-c++']);
    await setupDirStructure(sandbox);
    await provisionRunnerFiles(sandbox, runnerPath);
    await setupRunnerDeps(sandbox);
    const snapshot = await saveSnapshot(sandbox);

    if (snapshot.status !== "created") {
      console.error("Failed to create snapshot:", snapshot);
      process.exit(1);
    }

    console.log("Runner provisioned successfully.");
    console.log("Snapshot ID:", snapshot.snapshotId);

    return;
  }

  console.error("Usage:");
  console.error("  provision <runner-path> - Provisions the runner files onto the sandbox");
  process.exit(1);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});