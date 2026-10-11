const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/** Serializa JSON-LD sem permitir que `</script>` ou `<!--` no texto encerrem a tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export function truncateDescription(value: string, maxLength = 160): string {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}
