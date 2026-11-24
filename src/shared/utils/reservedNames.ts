// Espelho de server/shared/kernel/reservedNames.ts (o teste de paridade garante que são iguais): a tela
// avisa antes de enviar; quem decide é o servidor (D35, item 10).
const LOOKALIKES: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  $: 's',
  '!': 'i',
};

/**
 * Forma de comparar um nome com os nomes reservados (D35, item 10): minúsculas, sem acento, com os
 * disfarces desfeitos, só letras e números, e letras repetidas juntas ("instaaa.gram" → "instagram").
 * Serve só para comparar; o nome gravado continua o que a pessoa escreveu.
 */
export function comparableName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[0-9@$!]/g, (char) => LOOKALIKES[char] ?? char)
    .replace(/[^a-z0-9]/g, '')
    .replace(/(.)\1+/g, '$1');
}

const USE_GUIDE_NAME = comparableName('useguide');

/** O nome usa "Use Guide", mesmo disfarçado ("Us3 Guide", "use.guide.oficial"). */
export function mentionsUseGuide(text: string): boolean {
  return comparableName(text).includes(USE_GUIDE_NAME);
}
