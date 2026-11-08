import { AsyncLocalStorage } from 'node:async_hooks';
import { format } from 'node:util';

/**
 * Logs estruturados para o Cloud Logging (AGENTS.md §10.3). Em produção, `console.*` vira uma linha
 * JSON com `severity`, `requestId` e o trace da requisição; erros com pilha vão para o Error Reporting.
 * Referência: https://cloud.google.com/logging/docs/structured-logging
 */

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';

export interface LogContext {
  requestId: string;
  /** `projects/<id>/traces/<traceId>`, a partir do header `X-Cloud-Trace-Context`. */
  trace?: string;
}

const storage = new AsyncLocalStorage<LogContext>();
const REPORTED_ERROR_EVENT =
  'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent';

export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** Contexto da requisição a partir do header do Google Front End; sem ele, um id local. */
export function logContextFromTraceHeader(
  header: string | undefined,
  projectId: string | undefined
): LogContext {
  const traceId = header?.split('/')[0]?.trim();
  if (traceId && /^[0-9a-f]{32}$/i.test(traceId)) {
    return {
      requestId: traceId,
      ...(projectId ? { trace: `projects/${projectId}/traces/${traceId}` } : {}),
    };
  }
  return { requestId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}` };
}

/** Uma linha JSON do Cloud Logging; `Error` entra com a pilha para o Error Reporting agrupar. */
export function formatLogEntry(
  severity: LogSeverity,
  args: unknown[],
  context: LogContext | undefined,
  service: string | undefined
): string {
  const error = args.find((arg): arg is Error => arg instanceof Error);
  const text = format(
    ...args.map((arg) => (arg instanceof Error ? (arg.stack ?? arg.message) : arg))
  );
  const entry: Record<string, unknown> = {
    severity,
    message: text,
    ...(context ? { requestId: context.requestId } : {}),
    ...(context?.trace ? { 'logging.googleapis.com/trace': context.trace } : {}),
  };
  if (severity === 'ERROR') {
    // Sem pilha, o tipo do evento ainda faz o Error Reporting registrar o erro.
    entry['@type'] = REPORTED_ERROR_EVENT;
    if (service) entry.serviceContext = { service };
    if (error && !text.includes(error.stack ?? '')) entry.stack_trace = error.stack;
  }
  return JSON.stringify(entry);
}

/** Troca `console.*` por linhas JSON (só em produção; no desenvolvimento local o texto fica legível). */
export function installStructuredConsole(service: string | undefined): void {
  const write =
    (severity: LogSeverity, stream: NodeJS.WriteStream) =>
    (...args: unknown[]) => {
      stream.write(`${formatLogEntry(severity, args, storage.getStore(), service)}\n`);
    };
  console.debug = write('DEBUG', process.stdout);
  console.log = write('INFO', process.stdout);
  console.info = write('INFO', process.stdout);
  console.warn = write('WARNING', process.stderr);
  console.error = write('ERROR', process.stderr);
}
