// Contas de teste nos emuladores (só desenvolvimento local, AGENTS.md §2.2 item 6). Rode com o app de
// pé (`npm run dev:emulators`): o perfil é criado pela API, como no cadastro do app. Pode rodar de novo: conta que já existe é mantida.
// Uso: npm run dev:seed
const AUTH = 'http://127.0.0.1:9099';
const APP = process.env.APP_URL || 'http://localhost:3000';
const PROJECT = 'demo-useguide';
const PASSWORD = 'useguide-dev';

// `items`: estabelecimentos criados pela API do painel, como no cadastro de parceiro.
const ACCOUNTS = [
  { email: 'parceiro.novo@useguide.test', name: 'Parceiro Novo', note: 'ainda não é parceiro' },
  { email: 'comprador@useguide.test', name: 'Comprador Teste', note: 'comprador' },
  {
    email: 'parceiro.passeio@useguide.test',
    name: 'Ana Passeios',
    note: 'parceiro de passeio',
    items: [{ name: 'Buggy do Preá', category: 'tour' }],
  },
  {
    email: 'parceiro.misto@useguide.test',
    name: 'Beto Aventuras',
    note: 'passeio e aluguel',
    items: [
      { name: 'Trilhas de Jeri', category: 'tour' },
      { name: 'Quadri Jeri', category: 'rental' },
    ],
  },
  {
    email: 'parceiro.restaurante@useguide.test',
    name: 'Carla Sabores',
    note: 'restaurante (vitrine)',
    items: [{ name: 'Cantinho do Preá', category: 'restaurant' }],
  },
  {
    email: 'parceiro.eventos@useguide.test',
    name: 'Davi Produções',
    note: 'produtor de eventos',
    items: [{ name: 'Davi Produções', category: 'producer' }],
  },
];

async function api(path, idToken, body) {
  const response = await fetch(`${APP}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status} ${await response.text()}`);
  return response.status === 204 ? {} : response.json().catch(() => ({}));
}

const WEEK = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const HOURS = Object.fromEntries(WEEK.map((day) => [day, { open: '08:00', close: '18:00', closed: false }]));

// Os passos de "Para aparecer no guia" completos por categoria (D34), para o anúncio poder ser publicado.
function detailsOf(category) {
  switch (category) {
    case 'tour':
      return { operationalInfo: { languages: ['Português'], itinerary: 'Dunas, lagoa e pôr do sol.', luggageInfo: 'Protetor solar e água.' } };
    case 'rental':
      return { operationalInfo: { languages: ['Português'], vehicleTypes: ['Quadriciclo'], operatingHours: HOURS } };
    case 'restaurant':
      return {
        instagramLink: 'https://instagram.com/useguide',
        declinedLinks: ['website', 'menu'],
        operationalInfo: {
          languages: ['Português'],
          cuisineType: 'Frutos do mar',
          mealTypes: ['Almoço'],
          additionalServices: [],
          amenities: [],
          operatingHours: HOURS,
        },
      };
    default:
      return {};
  }
}

// Vira parceiro e cria os estabelecimentos, já publicados no guia; quem já é parceiro é mantido.
async function ensurePartner(idToken, items) {
  const profile = await fetch(`${APP}/api/partners/profile`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (profile.ok) return;
  await api('/api/partners/register', idToken, { formData: { termsAccepted: true } });
  for (const item of items) {
    // Foto de teste servida pelo próprio app local.
    const photo = `${APP}/pwa-512x512.png`;
    const { id } = await api('/api/partners/items', idToken, {
      name: item.name,
      description: `${item.name}: cadastro de teste do ambiente local.`,
      category: item.category,
      image: photo,
      images: [photo],
      location: 'Preá',
      address: 'Rua da Praia, 10',
      googleMapsLink: 'https://maps.app.goo.gl/useguide',
      state: 'CE',
      city: 'Jijoca de Jericoacoara',
      phone: '+5588999990000',
      ...detailsOf(item.category),
    });
    if (item.category !== 'producer') {
      await api(`/api/partner-home/listings/${id}/publish`, idToken, {});
    }
  }
}

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

// O app cria o perfil (users/{uid}) logo depois do cadastro (useAuth); o seed faz o mesmo pela API.
async function ensureProfile(idToken, name) {
  const [firstName, ...rest] = name.split(' ');
  const response = await fetch(`${APP}/api/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ firstName, lastName: rest.join(' ') || 'Teste', phone: '' }),
  });
  if (!response.ok) throw new Error(`Perfil: HTTP ${response.status} ${await response.text()}`);
}

async function ensureAccount({ email, name, items }) {
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
  // Token novo, já com o e-mail confirmado.
  const session = await call('accounts:signInWithPassword', {
    email,
    password: PASSWORD,
    returnSecureToken: true,
  });
  await ensureProfile(session.idToken, name);
  return { uid: account.localId, idToken: session.idToken };
}

// Contas extras: `npm run dev:seed -- outra@useguide.test` (para repetir um fluxo do zero).
for (const email of process.argv.slice(2)) {
  ACCOUNTS.push({ email, name: email.split('@')[0], note: 'conta extra' });
}

for (const account of ACCOUNTS) {
  const { uid, idToken } = await ensureAccount(account);
  if (account.items) {
    // Token novo depois de virar parceiro não é preciso: o papel é lido no servidor.
    await ensurePartner(idToken, account.items);
  }
  console.log(`${account.email} (${account.note}) uid=${uid}`);
}
console.log(`Senha de todas as contas: ${PASSWORD}`);
