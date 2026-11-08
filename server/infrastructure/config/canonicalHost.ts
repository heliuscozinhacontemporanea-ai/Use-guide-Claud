/**
 * Acesso direto ao endereço `*.run.app` do Cloud Run, sem passar pelo domínio oficial: as páginas
 * redirecionam para `useguide.com.br` (AGENTS.md §7.9). Pelo Hosting, o host é o domínio oficial.
 */
export function isDirectCloudRunHost(host: string): boolean {
  const name = host.split(',')[0]?.trim().toLowerCase().replace(/:\d+$/, '') ?? '';
  return name.endsWith('.run.app');
}
