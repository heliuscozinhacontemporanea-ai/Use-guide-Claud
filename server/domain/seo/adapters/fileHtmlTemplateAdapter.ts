import fs from 'node:fs/promises';
import path from 'node:path';
import type { HtmlTemplatePort } from '../ports/htmlTemplatePort';

/** Lê dist/index.html uma vez por instância; o arquivo só muda a cada deploy. */
export class FileHtmlTemplateAdapter implements HtmlTemplatePort {
  private cached: Promise<string> | null = null;

  getTemplate(): Promise<string> {
    if (!this.cached) {
      this.cached = fs
        .readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8')
        .catch((error: unknown) => {
          this.cached = null;
          throw error;
        });
    }
    return this.cached;
  }
}
