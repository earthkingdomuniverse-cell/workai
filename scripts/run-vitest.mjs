import { spawn } from 'node:child_process';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourceDbPath = path.join(repoRoot, 'dev.db');
const testDbDir = path.join(repoRoot, '.cache', 'vitest');
const testDbPath = path.join(testDbDir, 'test.db');
const databaseUrl = `file:${testDbPath}`;
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const vitestArgs = process.argv.slice(2);
const resolvedVitestArgs = vitestArgs.length > 0 ? vitestArgs : ['watch'];

const run = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });

const resetTestDatabase = async () => {
  await mkdir(testDbDir, { recursive: true });
  await Promise.all([
    rm(testDbPath, { force: true }),
    rm(`${testDbPath}-shm`, { force: true }),
    rm(`${testDbPath}-wal`, { force: true }),
  ]);
  await copyFile(sourceDbPath, testDbPath);
};

const sharedEnv = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: databaseUrl,
};

await resetTestDatabase();
const vitestExitCode = await run(npxCommand, ['vitest', ...resolvedVitestArgs], sharedEnv);
process.exit(vitestExitCode);
