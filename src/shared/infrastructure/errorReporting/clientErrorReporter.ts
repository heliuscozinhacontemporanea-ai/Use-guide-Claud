import { scrubStack, scrubText } from '../../utils/scrubPersonalData';
import { firebaseApiFetch } from '../firebase/firebaseApiFetch';

export type ClientErrorKind = 'error' | 'unhandledrejection' | 'react';

export interface ClientErrorReport {
  kind: ClientErrorKind;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  route: string;
}

export type ReportClientError = (
  kind: ClientErrorKind,
  error: unknown,
  componentStack?: string
) => void;

// Por página aberta: um erro em laço não vira centenas de envios.
const MAX_REPORTS = 10;
// Avisos do navegador que não são erro do app.
const IGNORED = [/ResizeObserver loop/i, /^Script error\.?$/i];

function normalize(error: unknown): { name: string; message: string; stack?: string } {
  if (error instanceof Error) {
    return { name: error.name || 'Error', message: error.message, stack: error.stack };
  }
  if (typeof error === 'string') return { name: 'Error', message: error };
  if (error && typeof error === 'object' && 'message' in error) {
    return { name: 'Error', message: String((error as { message: unknown }).message) };
  }
  return { name: 'Error', message: String(error) };
}

function firstFrame(stack?: string): string {
  return (
    stack
      ?.split('\n')
      .find((line) => /^\s+at\s|@/.test(line))
      ?.trim() ?? ''
  );
}

/**
 * Erros do navegador para o Error Reporting (decisão de 2026-11-24), já sem dado pessoal: o mesmo
 * erro vai uma vez por página, até 10 por página, e uma falha no envio nunca vira outro erro.
 */
export function createClientErrorReporter(
  send: (report: ClientErrorReport) => Promise<unknown>,
  currentRoute: () => string
): ReportClientError {
  const seen = new Set<string>();
  return (kind, error, componentStack) => {
    try {
      const { name, message, stack } = normalize(error);
      if (IGNORED.some((pattern) => pattern.test(message))) return;
      const key = `${name}|${message}|${firstFrame(stack)}`;
      if (seen.has(key) || seen.size >= MAX_REPORTS) return;
      seen.add(key);
      const report: ClientErrorReport = {
        kind,
        name: scrubText(name).slice(0, 100),
        message: scrubText(message).slice(0, 500),
        ...(stack ? { stack: scrubStack(stack).slice(0, 4000) } : {}),
        ...(componentStack ? { componentStack: scrubStack(componentStack).slice(0, 2000) } : {}),
        route: currentRoute().slice(0, 200) || '/',
      };
      void send(report).catch(() => undefined);
    } catch {
      // O coletor nunca derruba a tela nem gera erro novo.
    }
  };
}

function sendToServer(report: ClientErrorReport): Promise<Response> {
  return firebaseApiFetch(
    '/api/client-errors',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      // Chega ao servidor mesmo se a pessoa fechar a página logo depois do erro.
      keepalive: true,
    },
    { requireAppCheck: true }
  );
}

/** Liga a coleta na janela; o `ReportClientError` devolvido serve também para o React. */
export function installClientErrorReporting(): ReportClientError {
  const report = createClientErrorReporter(sendToServer, () => window.location.pathname);
  window.addEventListener('error', (event) => {
    // Script de outra origem (extensão, anúncio) chega sem detalhe e não é do app.
    if (event.filename && !event.filename.startsWith(window.location.origin)) return;
    report('error', event.error ?? event.message);
  });
  window.addEventListener('unhandledrejection', (event) => {
    report('unhandledrejection', event.reason);
  });
  return report;
}
