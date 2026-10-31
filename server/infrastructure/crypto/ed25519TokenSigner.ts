import crypto from 'crypto';

/** Nomes das variáveis de cada QR assinado; cada uso tem a própria chave (§7.8). */
export interface Ed25519TokenSignerConfig {
  /** Prefixo do token: separa um QR de outro e permite trocar o formato depois. */
  prefix: string;
  privateKeyEnv: string;
  keyIdEnv: string;
  previousPublicKeyEnv: string;
  previousKeyIdEnv: string;
}

interface LoadedKeys {
  kid: string;
  privateKey: crypto.KeyObject;
  verifiers: Array<{ kid: string; publicKey: crypto.KeyObject }>;
}

/**
 * QR assinado com Ed25519 (AGENTS.md §7.7): `<prefixo>.<payload base64url>.<assinatura>`, com o
 * `kid` dentro do payload para a rotação. A assinatura é determinística, então o mesmo QR pode ser
 * reemitido sem gravar nada. As chaves são lidas na primeira chamada; sem elas, falha.
 */
export class Ed25519TokenSigner {
  private loaded: LoadedKeys | null = null;

  constructor(
    private readonly config: Ed25519TokenSignerConfig,
    private readonly env: NodeJS.ProcessEnv = process.env
  ) {}

  sign(payload: Record<string, unknown>): string {
    const { kid, privateKey } = this.keys();
    const body = Buffer.from(JSON.stringify({ ...payload, kid }), 'utf8').toString('base64url');
    const signature = crypto.sign(null, Buffer.from(body, 'utf8'), privateKey);
    return `${this.config.prefix}.${body}.${signature.toString('base64url')}`;
  }

  /** Payload com assinatura válida de uma chave aceita, ainda sem conferir os campos; ou null. */
  verify(token: string): (Record<string, unknown> & { kid: string }) | null {
    const [prefix, body, signature, extra] = token.trim().split('.');
    if (prefix !== this.config.prefix || !body || !signature || extra !== undefined) return null;
    try {
      const payload: unknown = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
      const kid = (payload as { kid?: unknown }).kid;
      if (typeof kid !== 'string') return null;
      const verifier = this.keys().verifiers.find((candidate) => candidate.kid === kid);
      if (!verifier) return null;
      const valid = crypto.verify(
        null,
        Buffer.from(body, 'utf8'),
        verifier.publicKey,
        Buffer.from(signature, 'base64url')
      );
      return valid ? (payload as Record<string, unknown> & { kid: string }) : null;
    } catch {
      return null;
    }
  }

  /** Chaves públicas aceitas, para conferir o QR no aparelho sem internet. */
  publicKeys(): Array<{ kid: string; publicKeyJwk: JsonWebKey }> {
    return this.keys().verifiers.map(({ kid, publicKey }) => ({
      kid,
      publicKeyJwk: publicKey.export({ format: 'jwk' }) as JsonWebKey,
    }));
  }

  /** Só testes: esquece as chaves lidas para trocar as variáveis de ambiente. */
  reset(): void {
    this.loaded = null;
  }

  private readPem(name: string): string | null {
    const value = this.env[name]?.trim();
    return value ? value.replace(/\\n/g, '\n') : null;
  }

  // Sem chave configurada o QR não funciona: nunca gerar chave na hora (§7.7).
  private keys(): LoadedKeys {
    if (this.loaded) return this.loaded;
    const { privateKeyEnv, keyIdEnv, previousPublicKeyEnv, previousKeyIdEnv } = this.config;
    const pem = this.readPem(privateKeyEnv);
    const kid = this.env[keyIdEnv]?.trim();
    if (!pem || !kid) throw new Error(`${privateKeyEnv} ou ${keyIdEnv} ausente.`);
    const privateKey = crypto.createPrivateKey(pem);
    if (privateKey.asymmetricKeyType !== 'ed25519') {
      throw new Error(`${privateKeyEnv} precisa ser uma chave Ed25519.`);
    }
    const verifiers = [{ kid, publicKey: crypto.createPublicKey(privateKey) }];
    // Rotação (§7.8): a chave pública anterior vale até o fim dos QRs já emitidos com ela.
    const previousPem = this.readPem(previousPublicKeyEnv);
    const previousKid = this.env[previousKeyIdEnv]?.trim();
    if (previousPem && previousKid) {
      verifiers.push({ kid: previousKid, publicKey: crypto.createPublicKey(previousPem) });
    }
    this.loaded = { kid, privateKey, verifiers };
    return this.loaded;
  }
}
