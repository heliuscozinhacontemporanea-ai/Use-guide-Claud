import { describe, expect, it } from 'vitest';
import { escapeHtml, serializeJsonLd, truncateDescription } from './htmlEscape';

describe('htmlEscape', () => {
  it('escapa tags e aspas', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml("Bar d'Ana & Cia")).toBe('Bar d&#39;Ana &amp; Cia');
  });

  it('serializa JSON-LD sem permitir fechar a tag script', () => {
    const json = serializeJsonLd({ name: '</script><script>alert(1)</script><!--' });
    expect(json).not.toContain('</script>');
    expect(json).not.toContain('<!--');
    expect(JSON.parse(json)).toEqual({ name: '</script><script>alert(1)</script><!--' });
  });

  it('trunca descrições longas e normaliza espaços', () => {
    expect(truncateDescription('  a   b \n c ')).toBe('a b c');
    const result = truncateDescription('x'.repeat(300));
    expect(result).toHaveLength(160);
    expect(result.endsWith('…')).toBe(true);
  });
});
