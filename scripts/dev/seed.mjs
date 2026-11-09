// Contas de teste nos emuladores (só desenvolvimento local, AGENTS.md §2.2 item 6). Rode com o app de
// pé (`npm run dev:emulators`). Pode rodar de novo: conta que já existe é mantida.
// Uso: npm run dev:seed
const AUTH = 'http://127.0.0.1:9099';
const PROJECT = 'demo-useguide';
const PASSWORD = 'useguide-dev';

const ACCOUNTS = [
  { email: 'parceiro.novo@useguide.test', name: 'Parceiro Novo', note: 'parceiro recém-cadastrado' },
  { email: 'comprador@useguide.test', name: 'Comprador Teste', note: 'comprador' },
];

async function call(path, body, owner = false) {
  const url = `${AUTH}/identitytoolkit.googleapis.com/v1/${path}${owner ? '' : '?key=demo-api-key'}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(owner ? { Authorization: 'Bearer owner' } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw Object.assign(new Error(json.error?.message ?? response.status), { json });
  return json;
}

async function ensureAccount({ email, name }) {
  let account;
  try {
    account = await call('accounts:signUp', { email, password: PASSWORD, returnSecureToken: true });
  } catch (error) {
    if (!String(error.message).includes('EMAIL_EXISTS')) throw error;
    account = await call('accounts:signInWithPassword', {
      email,
      password: PASSWORD,
      returnSecureToken: true,
    });
  }
  await call(
    `projects/${PROJECT}/accounts:update`,
    { localId: account.localId, emailVerified: true, displayName: name },
    true
  );
  return account.localId;
}

for (const account of ACCOUNTS) {
  const uid = await ensureAccount(account);
  console.log(`${account.email} (${account.note}) uid=${uid}`);
}
console.log(`Senha de todas as contas: ${PASSWORD}`);
