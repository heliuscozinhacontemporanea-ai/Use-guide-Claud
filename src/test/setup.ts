import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll } from 'vitest';
import { i18nReady } from '../shared/i18n/config';

// Como no app (main.tsx), os testes só começam com o idioma inicial carregado. O jsdom se apresenta
// como en-US e o inglês chega sob demanda: sem esperar, ele chegaria no meio de um teste (trocando
// textos e o `t`) ou depois do fim (atualização numa tela já desmontada).
beforeAll(() => i18nReady);

// Limpa o DOM do JSDOM após cada teste para evitar vazamento de estado
afterEach(() => {
  cleanup();
});
