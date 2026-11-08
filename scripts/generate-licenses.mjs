// Gera src/domain/content/data/licenses.generated.json a partir das dependências de produção do
// package.json: nome, versão, licença, autoria, página do projeto e o texto da licença de cada uma.
// Rode `npm run licenses` depois de adicionar ou atualizar dependências (um teste confere).
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const LICENSE_FILE = /^(licen[cs]e|copying)(\.(md|txt))?$/i;

function repositoryUrl(meta) {
  const raw = typeof meta.repository === 'string' ? meta.repository : meta.repository?.url;
  const url = meta.homepage || raw || '';
  return url.replace(/^git\+/, '').replace(/\.git$/, '').replace(/^git:\/\//, 'https://');
}

function author(meta) {
  if (typeof meta.author === 'string') return meta.author.replace(/\s*[<(].*$/, '');
  return meta.author?.name ?? '';
}

const entries = Object.keys(pkg.dependencies)
  .sort()
  .map((name) => {
    const dir = path.join(root, 'node_modules', name);
    const meta = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'));
    const file = readdirSync(dir).find((f) => LICENSE_FILE.test(f));
    const text = file ? readFileSync(path.join(dir, file), 'utf8').trim() : '';
    const license = typeof meta.license === 'string' ? meta.license : (meta.license?.type ?? '');
    return {
      name,
      version: meta.version,
      license,
      author: author(meta),
      url: repositoryUrl(meta),
      text,
    };
  });

// Pacotes publicados sem o arquivo de licença: Apache-2.0 tem texto único (vale o de outro pacote);
// MIT recebe o texto padrão com o autor do pacote.
const MIT_TEMPLATE = (holder) => `MIT License

Copyright (c) ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

for (const entry of entries) {
  if (entry.text) continue;
  if (entry.license === 'MIT') {
    entry.text = MIT_TEMPLATE(entry.author || entry.name);
  } else {
    entry.text = entries.find((other) => other.license === entry.license && other.text)?.text ?? '';
  }
  if (!entry.text) throw new Error(`Sem texto de licença para ${entry.name} (${entry.license})`);
}

const out = path.join(root, 'src/domain/content/data/licenses.generated.json');
writeFileSync(out, `${JSON.stringify(entries, null, 2)}\n`);
console.log(`${entries.length} licenças em ${path.relative(root, out)}`);
