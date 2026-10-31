import { describe, expect, it } from 'vitest';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';
import { normalizeUsername, usernameBaseFromName } from '../utils/username';
import { UsernameService } from './usernameService';

class InMemoryUsernames implements UsernamePort {
  reservations = new Map<string, { uid: string; releasedAt?: string }>();
  users = new Map<string, { username: string | null; changedAt: string | null }>();

  async getCurrent(uid: string) {
    return this.users.get(uid) ?? { username: null, changedAt: null };
  }
  async isAvailable(username: string, uid: string, nowIso: string) {
    const found = this.reservations.get(username);
    return !found || found.uid === uid || (!!found.releasedAt && found.releasedAt <= nowIso);
  }
  async claim(uid: string, username: string, nowIso: string, releaseAtIso: string) {
    const previous = this.users.get(uid)?.username;
    if (previous) this.reservations.set(previous, { uid, releasedAt: releaseAtIso });
    this.reservations.set(username, { uid });
    this.users.set(uid, { username, changedAt: nowIso });
  }
  async findOwner(username: string): Promise<UsernameOwner | null> {
    const found = this.reservations.get(username);
    if (!found || found.releasedAt) return null;
    return {
      uid: found.uid,
      username,
      displayName: 'Ana Souza',
      photoURL: null,
      email: 'ana@exemplo.com',
      emailVerified: true,
    };
  }
  async releaseAll(uid: string, releaseAtIso: string) {
    for (const [name, value] of this.reservations) {
      if (value.uid === uid)
        this.reservations.set(name, { uid: 'deleted', releasedAt: releaseAtIso });
    }
  }
}

function setup(nowIso = '2026-11-01T12:00:00.000Z') {
  const port = new InMemoryUsernames();
  let now = new Date(nowIso);
  const service = new UsernameService(
    port,
    () => now,
    () => 0.5
  );
  return { port, service, setNow: (iso: string) => (now = new Date(iso)) };
}

describe('@usuário (D21)', () => {
  it('normaliza e recusa formatos inválidos e nomes bloqueados', () => {
    expect(normalizeUsername('@Ana.Souza')).toBe('ana.souza');
    expect(normalizeUsername('ab')).toBeNull();
    expect(normalizeUsername('.ana')).toBeNull();
    expect(normalizeUsername('ana..souza')).toBeNull();
    expect(normalizeUsername('ana souza')).toBeNull();
    expect(normalizeUsername('suporte')).toBeNull();
    expect(normalizeUsername('useguide_oficial')).toBeNull();
    expect(usernameBaseFromName('Ana Sôuza')).toBe('anasouza');
  });

  it('sugere a partir do nome e acrescenta números quando já existe', async () => {
    const { service, port } = setup();
    expect(await service.suggest('u1', 'Ana Souza')).toBe('anasouza');
    port.reservations.set('anasouza', { uid: 'u9' });
    expect(await service.suggest('u1', 'Ana Souza')).toBe('anasouza550');
  });

  it('o @ é único; troca uma vez a cada 30 dias; o antigo fica reservado 14 dias', async () => {
    const { service, port, setNow } = setup();
    await service.claim('u1', 'ana');
    await expect(service.claim('u2', 'ANA')).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
    setNow('2026-11-20T12:00:00.000Z');
    await expect(service.claim('u1', 'ana.s')).rejects.toMatchObject({
      code: 'USERNAME_CHANGE_TOO_SOON',
    });
    setNow('2026-12-02T12:00:00.000Z');
    await service.claim('u1', 'ana.s');
    await expect(service.claim('u2', 'ana')).rejects.toMatchObject({ code: 'USERNAME_TAKEN' });
    expect(port.reservations.get('ana')?.releasedAt).toBe('2026-12-16T12:00:00.000Z');
    setNow('2026-12-17T12:00:00.000Z');
    await expect(service.claim('u2', 'ana')).resolves.toBe('ana');
  });

  it('busca devolve só o perfil público; @ antigo ou de conta excluída não é achado', async () => {
    const { service } = setup();
    await service.claim('u1', 'ana');
    expect(await service.findProfile('@ana')).toEqual({
      username: 'ana',
      displayName: 'Ana Souza',
      photoURL: null,
    });
    await service.releaseAll('u1');
    await expect(service.findProfile('ana')).rejects.toMatchObject({ code: 'USERNAME_NOT_FOUND' });
  });
});
