import fs from 'node:fs';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
export interface OSSPlugin {
  id: string;
  name: string;
  version: string;
  init?: (server: FastifyInstance) => Promise<void> | void;
}

export async function loadOSSPlugins(basePath?: string): Promise<OSSPlugin[]> {
  const pluginPath = basePath ?? './plugins';
  if (!fs.existsSync(pluginPath)) return [];

  const files = fs
    .readdirSync(pluginPath)
    .filter((fileName: string) => fileName.endsWith('.js') || fileName.endsWith('.ts'));

  const plugins: OSSPlugin[] = [];
  for (const fileName of files) {
    try {
      // Resolve and import dynamically
      const modPath = path.resolve(pluginPath, fileName);
      const mod = await import(modPath);
      const p = (mod.default as OSSPlugin) || (mod as OSSPlugin);
      if (p?.id && p?.name) plugins.push(p as OSSPlugin);
    } catch {
      // skip broken plugin
      continue;
    }
  }
  return plugins;
}

export default { loadOSSPlugins };
