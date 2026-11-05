import { useEffect, useState } from 'react';

/** Hora atual, relida a cada 30 s: para telas que mudam pelo relógio (ex.: "Agora" do painel). */
export function useMinuteClock(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
