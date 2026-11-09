// Sobe o app local contra os emuladores do Firebase (Auth, Firestore e Storage), sem tocar no projeto
// real (AGENTS.md §2.2 item 6). Uso: `npm run dev:emulators`; depois, `npm run dev:seed`.
// Os dados e as chaves de teste ficam em .emulator-data/, fora do git.
import { spawn } from 'node:child_process';
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const dataDir = path.join(root, '.emulator-data');
const exportDir = path.join(dataDir, 'firebase');
const keysFile = path.join(dataDir, 'dev-keys.json');
const PROJECT = 'demo-useguide';
const DATABASE = 'ai-studio-3b61db50-1942-4c81-9044-7e5c7c930e12';
// O mesmo bucket do firebase.json, para o emulador carregar o storage.rules.
const BUCKET = 'gen-lang-client-0788355965.firebasestorage.app';

// Chaves só deste computador, geradas na primeira vez: nunca as de produção (§7.8 regra 1).
function devKeys() {
  if (existsSync(keysFile)) return JSON.parse(readFileSync(keysFile, 'utf8'));
  const secret = () => randomBytes(32).toString('base64url');
  const ed25519 = () =>
    generateKeyPairSync('ed25519').privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
  const keys = {
    TICKET_QR_SECRET: secret(),
    TICKET_CHECKIN_CODE_SECRET: secret(),
    BOOKING_CHECKIN_CODE_SECRET: secret(),
    INTERNAL_JOB_KEY: secret(),
    INSIGHTS_VIEWER_KEY: secret(),
    PII_BLIND_INDEX_KEY: secret(),
    FIELD_ENCRYPTION_DEV_KEY: randomBytes(32).toString('base64'),
    TICKET_QR_PRIVATE_KEY_PEM: ed25519(),
    TICKET_QR_KEY_ID: 'dev-ticket-1',
    BOOKING_ENTRY_QR_PRIVATE_KEY_PEM: ed25519(),
    BOOKING_ENTRY_QR_KEY_ID: 'dev-entry-1',
  };
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(keysFile, JSON.stringify(keys, null, 2), { mode: 0o600 });
  return keys;
}

const env = {
  ...devKeys(),
  VITE_USE_EMULATORS: 'true',
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: `${PROJECT}.firebaseapp.com`,
  VITE_FIREBASE_PROJECT_ID: PROJECT,
  VITE_FIREBASE_STORAGE_BUCKET: BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: '0',
  VITE_FIREBASE_APP_ID: '1:0:web:demo',
  VITE_FIREBASE_FIRESTORE_DATABASE_ID: DATABASE,
  VITE_SUPPORT_WHATSAPP: '5588999999999',
  FIREBASE_PROJECT_ID: PROJECT,
  FIRESTORE_DATABASE_ID: DATABASE,
  FIREBASE_STORAGE_BUCKET: BUCKET,
  APP_CHECK_REQUIRED: 'false',
  APP_URL: 'http://localhost:3000',
  // O que já estiver no ambiente (ex.: chaves de teste do Stripe) vale mais que o padrão acima.
  ...process.env,
};
// Estas nunca vêm do ambiente: o app local não pode falar com o App Check nem com o projeto real.
env.VITE_FIREBASE_RECAPTCHA_SITE_KEY = '';
env.GOOGLE_CLOUD_PROJECT = PROJECT;

const args = [
  'firebase',
  'emulators:exec',
  // Arquivo próprio dos emuladores: o de Storage não aceita a lista de buckets do firebase.json.
  '--config',
  'firebase.emulators.json',
  '--only',
  'auth,firestore,storage',
  '--project',
  PROJECT,
  '--export-on-exit',
  exportDir,
];
if (existsSync(path.join(exportDir, 'firebase-export-metadata.json'))) {
  args.push('--import', exportDir);
}
args.push('npm run dev');

const child = spawn('npx', args, { cwd: root, env, stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
