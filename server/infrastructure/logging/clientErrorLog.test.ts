import { describe, expect, it } from 'vitest';
import { formatClientErrorEntry } from './clientErrorLog';

const V8 = [
  "TypeError: Cannot read properties of undefined (reading 'map')",
  '    at List (https://useguide.com.br/assets/index-abc.js:1:2345)',
  '    at div',
].join('\n');

describe('formatClientErrorEntry (erros do navegador)', () => {
  it('pilha do V8: vai inteira na mensagem, como evento do Error Reporting do serviço web', () => {
    const entry = formatClientErrorEntry(
      {
        kind: 'error',
        name: 'TypeError',
        message: "Cannot read properties of undefined (reading 'map')",
        stack: V8,
        route: '/eventos',
        userAgent: 'Mozilla/5.0',
      },
      'use-guide-00042'
    );
    expect(entry).toMatchObject({
      severity: 'ERROR',
      '@type': expect.stringContaining('ReportedErrorEvent'),
      message: V8,
      serviceContext: { service: 'use-guide-web', version: 'use-guide-00042' },
      context: { httpRequest: { url: '/eventos', userAgent: 'Mozilla/5.0' } },
      'logging.googleapis.com/labels': { source: 'browser', kind: 'error' },
    });
    expect(entry.context).not.toHaveProperty('reportLocation');
  });

  it('sem pilha do V8 (Safari, Firefox, rejeição com texto): agrupa pelo lugar', () => {
    const entry = formatClientErrorEntry(
      { kind: 'unhandledrejection', name: 'Error', message: 'Falhou', route: '/' },
      'local'
    );
    expect(entry.message).toBe('Error: Falhou');
    expect(entry.context).toMatchObject({
      reportLocation: { filePath: '/', lineNumber: 0, functionName: 'unhandledrejection' },
    });
  });

  it('tela que quebrou leva a árvore de componentes junto', () => {
    const entry = formatClientErrorEntry(
      {
        kind: 'react',
        name: 'Error',
        message: 'x',
        stack: V8,
        componentStack: '\n    at List',
        route: '/',
      },
      'local'
    );
    expect(entry.componentStack).toBe('\n    at List');
  });
});
