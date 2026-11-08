import { describe, expect, it } from 'vitest';
import { formatLogEntry, logContextFromTraceHeader } from './structuredLog';

describe('logs estruturados', () => {
  it('lê o trace do header do Google e monta o caminho do Cloud Trace', () => {
    const context = logContextFromTraceHeader(
      '0123456789abcdef0123456789abcdef/123;o=1',
      'meu-projeto'
    );
    expect(context).toEqual({
      requestId: '0123456789abcdef0123456789abcdef',
      trace: 'projects/meu-projeto/traces/0123456789abcdef0123456789abcdef',
    });
  });

  it('sem header válido, gera um id local e não inventa trace', () => {
    const context = logContextFromTraceHeader('lixo', 'meu-projeto');
    expect(context.trace).toBeUndefined();
    expect(context.requestId.length).toBeGreaterThan(5);
  });

  it('erro sai com gravidade, contexto, tipo do Error Reporting e pilha', () => {
    const error = new Error('falhou');
    const line = JSON.parse(
      formatLogEntry(
        'ERROR',
        ['[Pagamento]', { id: 'x' }, error],
        { requestId: 'r1', trace: 't' },
        'use-guide'
      )
    );
    expect(line.severity).toBe('ERROR');
    expect(line.requestId).toBe('r1');
    expect(line['logging.googleapis.com/trace']).toBe('t');
    expect(line['@type']).toContain('ReportedErrorEvent');
    expect(line.serviceContext).toEqual({ service: 'use-guide' });
    expect(line.message).toContain('[Pagamento]');
    expect(line.message).toContain('Error: falhou');
  });

  it('aviso e informação não viram erro no Error Reporting', () => {
    const line = JSON.parse(formatLogEntry('WARNING', ['cuidado'], undefined, undefined));
    expect(line).toEqual({ severity: 'WARNING', message: 'cuidado' });
  });
});
