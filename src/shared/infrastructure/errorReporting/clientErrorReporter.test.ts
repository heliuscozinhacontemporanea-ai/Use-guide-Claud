import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type ClientErrorReport, createClientErrorReporter } from './clientErrorReporter';

describe('createClientErrorReporter (erros do navegador)', () => {
  let sent: ClientErrorReport[];
  let send: ReturnType<typeof vi.fn<(report: ClientErrorReport) => Promise<void>>>;

  beforeEach(() => {
    sent = [];
    send = vi.fn(async (report: ClientErrorReport) => {
      sent.push(report);
    });
  });

  it('manda o erro sem dado pessoal, com o caminho da tela', () => {
    const report = createClientErrorReporter(send, () => '/eventos');
    const error = new TypeError('Falha no pedido 123456789 de ana@exemplo.com');
    error.stack = `${error.name}: ${error.message}\n    at pay (https://useguide.com.br/a.js?x=1:1:2345)`;
    report('error', error);
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      kind: 'error',
      name: 'TypeError',
      message: 'Falha no pedido [num] de [email]',
      route: '/eventos',
    });
    expect(sent[0]?.stack).toContain('a.js:1:2345');
    expect(JSON.stringify(sent)).not.toMatch(/ana@|123456789|x=1/);
  });

  it('o mesmo erro vai uma vez; no máximo 10 erros diferentes por página', () => {
    const report = createClientErrorReporter(send, () => '/');
    // Criado sempre no mesmo lugar, como um erro que se repete num laço.
    const same = () => new Error('igual');
    report('error', same());
    report('error', same());
    for (let i = 0; i < 20; i += 1)
      report('unhandledrejection', `rejeição ${String.fromCharCode(97 + i)}`);
    expect(sent).toHaveLength(10);
    expect(sent.filter((item) => item.message === 'igual')).toHaveLength(1);
  });

  it('ignora avisos do navegador que não são erro do app', () => {
    const report = createClientErrorReporter(send, () => '/');
    report('error', 'ResizeObserver loop completed with undelivered notifications.');
    report('error', 'Script error.');
    expect(send).not.toHaveBeenCalled();
  });

  it('tela que quebrou leva a árvore de componentes', () => {
    const report = createClientErrorReporter(send, () => '/menu');
    report('react', new Error('quebrou'), '\n    at List\n    at Menu');
    expect(sent[0]).toMatchObject({ kind: 'react', componentStack: '\n    at List\n    at Menu' });
  });

  it('falha no envio não vira outro erro', async () => {
    const report = createClientErrorReporter(
      () => Promise.reject(new Error('sem rede')),
      () => '/'
    );
    expect(() => report('error', new Error('x'))).not.toThrow();
    await Promise.resolve();
  });
});
