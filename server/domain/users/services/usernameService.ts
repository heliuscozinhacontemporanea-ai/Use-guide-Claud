import { UsernameError } from '../errors/usernameError';
import type { UsernameOwner, UsernamePort } from '../ports/usernamePort';
import {
  USERNAME_CHANGE_INTERVAL_DAYS,
  USERNAME_RELEASE_DAYS,
  normalizeUsername,
  usernameBaseFromName,
} from '../utils/username';

const DAY_MS = 24 * 60 * 60_000;
const SUGGESTION_ATTEMPTS = 8;

/** Perfil público do @, sem e-mail: é o que a tela mostra para confirmar a transferência. */
export interface UsernameProfile {
  username: string;
  displayName: string | null;
  photoURL: string | null;
}

/** @usuário (D21): sugestão, escolha, troca a cada 30 dias e busca. */
export class UsernameService {
  constructor(
    private readonly port: UsernamePort,
    private readonly now: () => Date = () => new Date(),
    private readonly random: () => number = Math.random
  ) {}

  async suggest(uid: string, name: string): Promise<string> {
    const base = usernameBaseFromName(name);
    const nowIso = this.now().toISOString();
    for (let attempt = 0; attempt < SUGGESTION_ATTEMPTS; attempt += 1) {
      const candidate =
        attempt === 0 ? base : `${base}${Math.floor(this.random() * 900 + 100)}`.slice(0, 30);
      const normalized = normalizeUsername(candidate);
      if (normalized && (await this.port.isAvailable(normalized, uid, nowIso))) return normalized;
    }
    return `${base.slice(0, 20)}${Date.now().toString(36).slice(-6)}`;
  }

  async claim(uid: string, rawUsername: string): Promise<string> {
    const username = normalizeUsername(rawUsername);
    if (!username) throw new UsernameError('USERNAME_INVALID', 'Nome de usuário inválido.');
    const now = this.now();
    const current = await this.port.getCurrent(uid);
    if (current.username === username) return username;
    if (
      current.username &&
      current.changedAt &&
      now.getTime() - new Date(current.changedAt).getTime() < USERNAME_CHANGE_INTERVAL_DAYS * DAY_MS
    ) {
      throw new UsernameError(
        'USERNAME_CHANGE_TOO_SOON',
        'O nome de usuário só pode ser trocado uma vez a cada 30 dias.'
      );
    }
    const nowIso = now.toISOString();
    if (!(await this.port.isAvailable(username, uid, nowIso))) {
      throw new UsernameError('USERNAME_TAKEN', 'Este nome de usuário já está em uso.');
    }
    await this.port.claim(
      uid,
      username,
      nowIso,
      new Date(now.getTime() + USERNAME_RELEASE_DAYS * DAY_MS).toISOString()
    );
    return username;
  }

  async findProfile(rawUsername: string): Promise<UsernameProfile> {
    const { username, displayName, photoURL } = await this.findOwner(rawUsername);
    return { username, displayName, photoURL };
  }

  async findOwner(rawUsername: string): Promise<UsernameOwner> {
    const username = normalizeUsername(rawUsername);
    const owner = username ? await this.port.findOwner(username) : null;
    if (!owner) throw new UsernameError('USERNAME_NOT_FOUND', 'Usuário não encontrado.');
    return owner;
  }

  async releaseAll(uid: string): Promise<void> {
    const releaseAt = new Date(this.now().getTime() + USERNAME_RELEASE_DAYS * DAY_MS);
    await this.port.releaseAll(uid, releaseAt.toISOString());
  }
}
