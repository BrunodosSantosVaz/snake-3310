import { existsSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

async function dependencies(environment, filename, root, visited) {
  if (visited.has(filename)) return;
  visited.add(filename);
  // Nonliteral imports cannot prove a dependency set; the caller falls back to the complete suite.
  if (/import\s*\(\s*[^'"`\s]/.test(readFileSync(filename, 'utf8'))) {
    throw new Error('Dynamic source dependency');
  }
  const transformed = await environment.transformRequest(filename);
  if (!transformed) throw new Error(`Unable to transform ${filename}`);
  for (const dependency of [...transformed.deps ?? [], ...transformed.dynamicDeps ?? []]) {
    const target = dependency.startsWith('/@fs/') ? dependency.slice(4) : join(root, dependency);
    if (target.includes('/node_modules/') || !existsSync(target) || !/\.(ts|js|mjs)$/.test(target)) continue;
    await dependencies(environment, target, root, visited);
  }
}

export async function affectedGraph(files, root) {
  const { createVitest } = await import('vitest/node');
  const context = await createVitest('test', { root, related: files, watch: false });
  try {
    const specifications = await context.getRelevantTestSpecifications();
    const visited = new Set();
    const environment = context.getRootProject().vite.environments.ssr;
    for (const file of files.filter((file) => /\.(ts|js|mjs)$/.test(file))) {
      await dependencies(environment, resolve(root, file), root, visited);
    }
    return {
      files: specifications.map((specification) => relative(root, specification.moduleId)),
      coverage: [...visited].map((file) => relative(root, file))
        .filter((file) => /^src\/(dominio|aplicacao)\//.test(file) && !file.includes('.test.')).sort(),
    };
  } finally {
    await context.close();
  }
}
