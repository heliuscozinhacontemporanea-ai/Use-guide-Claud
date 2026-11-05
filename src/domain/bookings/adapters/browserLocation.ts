import type { ArrivalLocation } from '../types/bookings';

/** Localização só no toque do "Cheguei" (D20); recusada ou sem resposta em 8 s, segue sem ela. */
export function currentLocation(): Promise<ArrivalLocation | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM: Math.round(position.coords.accuracy),
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  });
}
