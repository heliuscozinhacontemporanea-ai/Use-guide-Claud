# Prompt 22.2 — 404 em tela cheia com o hamster na roda

> Lote 19, gerado dos commits de referência `b850241..98511bd` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3, 23.4, 23.5), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 22.2 — 404 em tela cheia com o hamster na roda

Versão aprovada em 2026-11-02: o hamster da primeira versão, só correndo, em tela cheia. Créditos do autor ficam em Sobre › Licenças (prompt 22.6).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D24 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) O "0" do 404 vira o hamster correndo na roda (componente HamsterWheel com CSS próprio e prefixo ug-, isolado).
2) Página não encontrada em tela cheia (NotFoundView). Respeita prefers-reduced-motion.

ARQUIVOS (crie, altere ou apague exatamente estes):
- src/ui/components/HamsterWheel.css (criar)
- src/ui/components/HamsterWheel.tsx (criar)
- src/ui/components/NotFoundView.tsx (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== src/ui/components/HamsterWheel.css — ARQUIVO NOVO, conteúdo completo ===
/*
 * Hamster na roda da página não encontrada. Classes com prefixo `ug-` para não colidir; a roda usa a
 * cor das linhas do tema; o hamster é ilustração e mantém as cores próprias. O tamanho todo é em `em`:
 * o componente define o tamanho pelo `font-size`.
 */
.ug-hamster-wheel {
  --dur: 1s;
  --ug-wheel-color: color-mix(in srgb, var(--ug-ink) 40%, transparent);
  position: relative;
  /* Os z-index 1 e 2 das peças ficam só dentro da roda, sem disputar camada com o resto do app. */
  isolation: isolate;
  width: 12em;
  height: 12em;
}

.ug-hamster-wheel__wheel,
.ug-hamster,
.ug-hamster div,
.ug-hamster-wheel__spoke {
  position: absolute;
}

.ug-hamster-wheel__wheel,
.ug-hamster-wheel__spoke {
  border-radius: 50%;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.ug-hamster-wheel__wheel {
  background: radial-gradient(100% 100% at center, transparent 47.8%, var(--ug-wheel-color) 48%);
  z-index: 2;
}

.ug-hamster {
  animation: ug-hamster var(--dur) ease-in-out infinite;
  top: 50%;
  left: calc(50% - 3.5em);
  width: 7em;
  height: 3.75em;
  transform: rotate(4deg) translate(-0.8em, 1.85em);
  transform-origin: 50% 0;
  z-index: 1;
}

.ug-hamster__head {
  animation: ug-hamster-head var(--dur) ease-in-out infinite;
  background: hsl(30, 90%, 55%);
  border-radius: 70% 30% 0 100% / 40% 25% 25% 60%;
  box-shadow:
    0 -0.25em 0 hsl(30, 90%, 80%) inset,
    0.75em -1.55em 0 hsl(30, 90%, 90%) inset;
  top: 0;
  left: -2em;
  width: 2.75em;
  height: 2.5em;
  transform-origin: 100% 50%;
}

.ug-hamster__ear {
  animation: ug-hamster-ear var(--dur) ease-in-out infinite;
  background: hsl(0, 90%, 85%);
  border-radius: 50%;
  box-shadow: -0.25em 0 hsl(30, 90%, 55%) inset;
  top: -0.25em;
  right: -0.25em;
  width: 0.75em;
  height: 0.75em;
  transform-origin: 50% 75%;
}

.ug-hamster__eye {
  animation: ug-hamster-eye var(--dur) linear infinite;
  background-color: hsl(0, 0%, 0%);
  border-radius: 50%;
  top: 0.375em;
  left: 1.25em;
  width: 0.5em;
  height: 0.5em;
}

.ug-hamster__nose {
  background: hsl(0, 90%, 75%);
  border-radius: 35% 65% 85% 15% / 70% 50% 50% 30%;
  top: 0.75em;
  left: 0;
  width: 0.2em;
  height: 0.25em;
}

.ug-hamster__body {
  animation: ug-hamster-body var(--dur) ease-in-out infinite;
  background: hsl(30, 90%, 90%);
  border-radius: 50% 30% 50% 30% / 15% 60% 40% 40%;
  box-shadow:
    0.1em 0.75em 0 hsl(30, 90%, 55%) inset,
    0.15em -0.5em 0 hsl(30, 90%, 80%) inset;
  top: 0.25em;
  left: 2em;
  width: 4.5em;
  height: 3em;
  transform-origin: 17% 50%;
  transform-style: preserve-3d;
}

.ug-hamster__limb--fr,
.ug-hamster__limb--fl {
  clip-path: polygon(0 0, 100% 0, 70% 80%, 60% 100%, 0% 100%, 40% 80%);
  top: 2em;
  left: 0.5em;
  width: 1em;
  height: 1.5em;
  transform-origin: 50% 0;
}

.ug-hamster__limb--fr {
  animation: ug-hamster-fr-limb var(--dur) linear infinite;
  background: linear-gradient(hsl(30, 90%, 80%) 80%, hsl(0, 90%, 75%) 80%);
  transform: rotate(15deg) translateZ(-1px);
}

.ug-hamster__limb--fl {
  animation: ug-hamster-fl-limb var(--dur) linear infinite;
  background: linear-gradient(hsl(30, 90%, 90%) 80%, hsl(0, 90%, 85%) 80%);
  transform: rotate(15deg);
}

.ug-hamster__limb--br,
.ug-hamster__limb--bl {
  border-radius: 0.75em 0.75em 0 0;
  clip-path: polygon(0 0, 100% 0, 100% 30%, 70% 90%, 70% 100%, 30% 100%, 40% 90%, 0% 30%);
  top: 1em;
  left: 2.8em;
  width: 1.5em;
  height: 2.5em;
  transform-origin: 50% 30%;
}

.ug-hamster__limb--br {
  animation: ug-hamster-br-limb var(--dur) linear infinite;
  background: linear-gradient(hsl(30, 90%, 80%) 90%, hsl(0, 90%, 75%) 90%);
  transform: rotate(-25deg) translateZ(-1px);
}

.ug-hamster__limb--bl {
  animation: ug-hamster-bl-limb var(--dur) linear infinite;
  background: linear-gradient(hsl(30, 90%, 90%) 90%, hsl(0, 90%, 85%) 90%);
  transform: rotate(-25deg);
}

.ug-hamster__tail {
  animation: ug-hamster-tail var(--dur) linear infinite;
  background: hsl(0, 90%, 85%);
  border-radius: 0.25em 50% 50% 0.25em;
  box-shadow: 0 -0.2em 0 hsl(0, 90%, 75%) inset;
  top: 1.5em;
  right: -0.5em;
  width: 1em;
  height: 0.5em;
  transform: rotate(30deg) translateZ(-1px);
  transform-origin: 0.25em 0.25em;
}

.ug-hamster-wheel__spoke {
  animation: ug-hamster-spoke var(--dur) linear infinite;
  background:
    radial-gradient(100% 100% at center, var(--ug-wheel-color) 4.8%, transparent 5%),
    linear-gradient(transparent 46.9%, var(--ug-wheel-color) 47% 52.9%, transparent 53%) 50% 50% /
    99% 99% no-repeat;
}

/* Movimento reduzido: o hamster fica parado na roda (AGENTS.md §11.7). Vem depois das regras acima
   e tem a mesma especificidade, por isso vence sem !important. */
@media (prefers-reduced-motion: reduce) {
  .ug-hamster-wheel,
  .ug-hamster-wheel * {
    animation: none;
  }
}

@keyframes ug-hamster {
  from,
  to {
    transform: rotate(4deg) translate(-0.8em, 1.85em);
  }
  50% {
    transform: rotate(0) translate(-0.8em, 1.85em);
  }
}

@keyframes ug-hamster-head {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(0);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(8deg);
  }
}

@keyframes ug-hamster-eye {
  from,
  90%,
  to {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0);
  }
}

@keyframes ug-hamster-ear {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(0);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(12deg);
  }
}

@keyframes ug-hamster-body {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(0);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(-2deg);
  }
}

@keyframes ug-hamster-fr-limb {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(50deg) translateZ(-1px);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(-30deg) translateZ(-1px);
  }
}

@keyframes ug-hamster-fl-limb {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(-30deg);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(50deg);
  }
}

@keyframes ug-hamster-br-limb {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(-60deg) translateZ(-1px);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(20deg) translateZ(-1px);
  }
}

@keyframes ug-hamster-bl-limb {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(20deg);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(-60deg);
  }
}

@keyframes ug-hamster-tail {
  from,
  25%,
  50%,
  75%,
  to {
    transform: rotate(30deg) translateZ(-1px);
  }
  12.5%,
  37.5%,
  62.5%,
  87.5% {
    transform: rotate(10deg) translateZ(-1px);
  }
}

@keyframes ug-hamster-spoke {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(-1turn);
  }
}

=== src/ui/components/HamsterWheel.tsx — ARQUIVO NOVO, conteúdo completo ===
import { cn } from '../../shared/utils/cn';
import './HamsterWheel.css';

/**
 * Hamster correndo na roda (ilustração da página não encontrada). Decorativo: o texto da página diz
 * o que aconteceu. O tamanho vem do `font-size` (a roda tem 12em).
 */
export function HamsterWheel({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn('ug-hamster-wheel shrink-0', className)}>
      <div className="ug-hamster-wheel__wheel" />
      <div className="ug-hamster">
        <div className="ug-hamster__body">
          <div className="ug-hamster__head">
            <div className="ug-hamster__ear" />
            <div className="ug-hamster__eye" />
            <div className="ug-hamster__nose" />
          </div>
          <div className="ug-hamster__limb--fr" />
          <div className="ug-hamster__limb--fl" />
          <div className="ug-hamster__limb--br" />
          <div className="ug-hamster__limb--bl" />
          <div className="ug-hamster__tail" />
        </div>
      </div>
      <div className="ug-hamster-wheel__spoke" />
    </div>
  );
}

=== src/ui/components/NotFoundView.tsx — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
import { useTranslation } from 'react-i18next';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';
import { cn } from '../../shared/utils/cn';
import { BUTTON_PRIMARY } from '../styles/controls';
import { HamsterWheel } from './HamsterWheel';

/** Página não encontrada em tela cheia: "404" com o hamster na roda no lugar do zero. */
export function NotFoundView() {
  const { t } = useTranslation();
  const { goTo } = useLocalizedRouting();
  return (
    <main
      className="fixed inset-0 bg-app text-ink flex flex-col items-center justify-center gap-5 px-6 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center overflow-y-auto"
      style={{ zIndex: Z_INDEX.overlay }}
    >
      <p className="flex items-center justify-center gap-1 font-display font-black leading-none text-ink text-[96px] sm:text-[140px]">
        <span className="sr-only">404</span>
        <span aria-hidden="true">4</span>
        <HamsterWheel className="text-[7px] sm:text-[10px]" />
        <span aria-hidden="true">4</span>
      </p>
      <h1 className="text-[22px] sm:text-[28px] font-display font-bold">
        {t('pages.notFoundTitle')}
      </h1>
      <p className="max-w-sm text-[15px] text-ink/70 leading-relaxed">
        {t('pages.notFoundDescription')}
      </p>
      <button
        type="button"
        onClick={() => goTo('explore')}
        className={cn(BUTTON_PRIMARY, 'min-h-12 px-6 mt-2')}
      >
        {t('pages.backHome')}
      </button>
    </main>
  );
}

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run src/ui/components/HamsterWheel.tsx src/ui/components/NotFoundView.tsx` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique o Hosting.
