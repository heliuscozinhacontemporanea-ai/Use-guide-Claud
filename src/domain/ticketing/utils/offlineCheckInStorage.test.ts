import { describe, expect, it } from 'vitest';
import { applyOfflineChanges, type StoredOfflineManifestBundle } from './offlineCheckInStorage';

const BUNDLE: StoredOfflineManifestBundle = {
  occurrenceId: 'occ_1',
  eventListingId: 'ev_1',
  sessionId: 'sess_1',
  stationId: 'st_1',
  issuedAt: '2026-12-20T21:00:00.000Z',
  expiresAt: '2026-12-21T11:00:00.000Z',
  keys: [],
  tickets: [
    { ticketIdHash: 'a', qrVersion: 1 },
    { ticketIdHash: 'b', qrVersion: 1 },
  ],
  changesSince: '2026-12-20T21:00:00.000Z',
};

describe('atualização da lista sem internet (D21)', () => {
  it('troca de QR atualiza a versão, ingresso novo entra e o que não vale sai', () => {
    const next = applyOfflineChanges(
      BUNDLE,
      [
        { ticketIdHash: 'a', qrVersion: 2, usable: true },
        { ticketIdHash: 'b', qrVersion: 2, usable: false },
        { ticketIdHash: 'c', qrVersion: 2, usable: true },
      ],
      '2026-12-20T22:00:00.000Z'
    );
    expect(next.tickets).toEqual([
      { ticketIdHash: 'a', qrVersion: 2 },
      { ticketIdHash: 'c', qrVersion: 2 },
    ]);
    expect(next.changesSince).toBe('2026-12-20T22:00:00.000Z');
  });
});
