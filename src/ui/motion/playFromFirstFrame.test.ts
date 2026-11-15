import { describe, expect, it } from 'vitest';
import { playFromFirstFrame } from './playFromFirstFrame';

const busyWait = (ms: number) => {
  const end = performance.now() + ms;
  while (performance.now() < end) {
    // Simula a primeira pintura pesada de uma tela recém-montada.
  }
};

describe('playFromFirstFrame', () => {
  it('o primeiro quadro desenhado mostra um quadro de movimento, mesmo se demorar a chegar', async () => {
    const steps: number[] = [];
    const playback = playFromFirstFrame((elapsed) => {
      steps.push(elapsed);
      return steps.length === 3;
    });
    busyWait(35);
    await playback.finished;
    const [first = 0, second = 0, third = 0] = steps;
    expect(first).toBeCloseTo(1000 / 60);
    // Depois do primeiro, o tempo é o real entre os quadros.
    expect(second).toBeGreaterThan(first);
    expect(third).toBeGreaterThan(second);
  });

  it('parar encerra a reprodução sem chamar mais o passo', async () => {
    let calls = 0;
    const playback = playFromFirstFrame(() => {
      calls += 1;
      return false;
    });
    playback.stop();
    await playback.finished;
    await new Promise((done) => setTimeout(done, 50));
    expect(calls).toBe(0);
  });
});
