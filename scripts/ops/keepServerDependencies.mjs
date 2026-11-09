// Usado no build da imagem (Dockerfile): deixa no package.json só as dependências que o servidor
// empacotado (dist/server.cjs) carrega, para o `npm prune` tirar as do navegador (B41). As versões
// continuam as do package-lock.json. Falha se o servidor pedir um pacote fora de `dependencies`.
import { readFileSync, writeFileSync } from 'node:fs';
import { builtinModules } from 'node:module';

const bundle = readFileSync('dist/server.cjs', 'utf8');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const builtins = new Set(builtinModules);

const packageName = (spec) => {
  const parts = spec.split('/');
  return spec.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
};

const required = new Set();
for (const [, spec] of bundle.matchAll(/\brequire\("([^"./][^"]*)"\)/g)) {
  if (spec.startsWith('node:') || builtins.has(spec)) continue;
  required.add(packageName(spec));
}

const missing = [...required].filter((name) => !pkg.dependencies?.[name]);
if (missing.length > 0) {
  throw new Error(`O servidor usa pacotes fora de "dependencies": ${missing.join(', ')}`);
}

pkg.dependencies = Object.fromEntries([...required].sort().map((name) => [name, pkg.dependencies[name]]));
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`dependências do servidor: ${Object.keys(pkg.dependencies).join(', ')}`);
