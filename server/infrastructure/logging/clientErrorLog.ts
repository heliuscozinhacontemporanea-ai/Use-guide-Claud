/**
 * Erro do navegador no Error Reporting, separado do servidor (serviço `use-guide-web`).
 * Referência: https://cloud.google.com/error-reporting/docs/formatting-error-messages
 */

const REPORTED_ERROR_EVENT =
  'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent';
// Pilha no formato do V8 (Chrome, Edge, Android): o Error Reporting agrupa pelas linhas "at ...".
const V8_FRAME = /\n\s+at\s/;

export type ClientErrorKind = 'error' | 'unhandledrejection' | 'react';

/** Erro já validado e limpo de dado pessoal pela rota. */
export interface ClientErrorEvent {
  kind: ClientErrorKind;
  name: string;
  message: string;
  stack?: string;
  componentStack?: string;
  route: string;
  userAgent?: string;
}

export function formatClientErrorEntry(
  event: ClientErrorEvent,
  version: string
): Record<string, unknown> {
  const stack = event.stack ?? '';
  const hasFrames = V8_FRAME.test(`\n${stack}`);
  const header = `${event.name}: ${event.message}`;
  const message = hasFrames
    ? stack.startsWith(event.name)
      ? stack
      : `${header}\n${stack}`
    : stack
      ? `${header}\n${stack}`
      : header;
  return {
    severity: 'ERROR',
    '@type': REPORTED_ERROR_EVENT,
    message,
    serviceContext: { service: 'use-guide-web', version },
    context: {
      httpRequest: {
        url: event.route,
        ...(event.userAgent ? { userAgent: event.userAgent } : {}),
      },
      // Sem linhas "at ..." o Error Reporting precisa de um lugar para agrupar o erro.
      ...(hasFrames
        ? {}
        : { reportLocation: { filePath: event.route, lineNumber: 0, functionName: event.kind } }),
    },
    'logging.googleapis.com/labels': { source: 'browser', kind: event.kind },
    ...(event.componentStack ? { componentStack: event.componentStack } : {}),
  };
}

/** Uma linha JSON no stderr: o Cloud Run manda para o Cloud Logging, e o Error Reporting agrupa. */
export function writeClientError(event: ClientErrorEvent): void {
  const version = process.env.K_REVISION ?? 'local';
  process.stderr.write(`${JSON.stringify(formatClientErrorEntry(event, version))}\n`);
}
