import { cancelFrame, frame } from 'motion/react';

/** Um quadro a 60 Hz, em ms: o primeiro quadro desenhado já mostra esse tanto de movimento. */
const ONE_FRAME_MS = 1000 / 60;

export interface FramePlayback {
  /** Termina quando `step` diz que acabou, ou quando a reprodução é parada. */
  finished: Promise<void>;
  stop: () => void;
}

/**
 * Roda `step` a cada quadro do Motion, contando o tempo a partir do primeiro quadro em que ele
 * desenha (já com um quadro andado), e não da criação. O `animate` do Motion conta desde a criação
 * quando o primeiro quadro chega em até 40 ms: logo depois de montar uma tela pesada, a animação
 * aparecia já ~40% andada (foto do anúncio, 2026-11-15). `step` recebe o tempo em ms e devolve
 * `true` quando acabou.
 */
export function playFromFirstFrame(step: (elapsedMs: number) => boolean): FramePlayback {
  let start: number | undefined;
  let resolve: () => void = () => {};
  const finished = new Promise<void>((done) => {
    resolve = done;
  });
  const stop = () => {
    cancelFrame(tick);
    resolve();
  };
  function tick({ timestamp }: { timestamp: number }) {
    if (start === undefined) start = timestamp - ONE_FRAME_MS;
    if (step(timestamp - start)) stop();
  }
  frame.update(tick, true);
  return { finished, stop };
}
