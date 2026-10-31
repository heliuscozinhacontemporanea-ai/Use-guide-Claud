import { useEffect, useState } from 'react';

type BatteryManager = EventTarget & { level: number; charging: boolean };
type BatteryNavigator = Navigator & { getBattery?: () => Promise<BatteryManager> };

const LOW_LEVEL = 0.2;

/**
 * Bateria em 20% ou menos e sem carregar. Só o Chrome Android informa a bateria; nos outros
 * navegadores fica sempre false.
 */
export function useLowBattery(active: boolean): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const getBattery = (navigator as BatteryNavigator).getBattery;
    if (!active || !getBattery) return;
    let battery: BatteryManager | null = null;
    const update = () => setLow(!!battery && !battery.charging && battery.level <= LOW_LEVEL);
    void getBattery
      .call(navigator)
      .then((manager) => {
        battery = manager;
        update();
        manager.addEventListener('levelchange', update);
        manager.addEventListener('chargingchange', update);
      })
      .catch(() => undefined);
    return () => {
      battery?.removeEventListener('levelchange', update);
      battery?.removeEventListener('chargingchange', update);
    };
  }, [active]);
  return low;
}
