# Prompt 23.0 — Versão 1.0.0, termos sem região e e-mail ajuda@ no Suporte

> Lote 19, gerado dos commits de referência `cd37326..00f530e` da branch `claude/agents-md-v2`. Aplique na ordem do lote (C18, A8, 22.1, 22.2, 22.6, 23.0, 23.1, 23.2a, 23.2b, 23.2c, 23.3), um por vez, depois do C18. Cole o bloco abaixo no agente do AI Studio, inteiro, de uma vez.

---

## Prompt 23.0 — Versão 1.0.0, termos sem região e e-mail ajuda@ no Suporte

Texto novo dos termos aprovado em 2026-11-03 (D25).

~~~~text
Siga o AGENTS.md. O app ainda não foi liberado para usuários: nenhum código de compatibilidade ou transição (§2.2 item 8). As regras estão nas decisões D25 de docs/arquitetura/decisoes.md (aplicadas pelo prompt A8).

IMPORTANTE: aplique os diffs abaixo EXATAMENTE, inclusive os arquivos novos. Não reescreva os arquivos do seu jeito. Arquivo tocado sai sem avisos do lint e formatado (AGENTS.md §13). Não altere firebase.json, functions/, AGENTS.md, docs/ nem .env.

O QUE MUDA:
1) package.json: versão 1.0.0 (o número que aparece em Sobre o app).
2) Termos de uso sem região ("destinos turísticos no Brasil") e parágrafo de privacidade sobre o identificador do aparelho para notificações, nos três idiomas.
3) BUYER_TERMS_VERSION = '2026-11-03' no frontend e no backend: compras novas pedem o aceite de novo.
4) Suporte com o e-mail único ajuda@useguide.com.br.

ARQUIVOS (crie, altere ou apague exatamente estes):
- package.json (alterar)
- server/shared/kernel/legalTerms.ts (alterar)
- src/domain/content/components/SupportView.tsx (alterar)
- src/shared/constants/legalTerms.ts (alterar)
- src/shared/i18n/legalResources.ts (alterar)

Aplique as mudanças abaixo EXATAMENTE como estão (formato unified diff: linhas com "-" saem, linhas com "+" entram; as demais são contexto para localizar o trecho). Não reformate outros trechos dos arquivos.

=== package.json — diff ===
@@ -1,7 +1,7 @@
 {
   "name": "use-guide",
   "private": true,
-  "version": "0.0.0",
+  "version": "1.0.0",
   "type": "module",
   "engines": {
     "node": "22.23.2"

=== server/shared/kernel/legalTerms.ts — diff ===
@@ -2,7 +2,7 @@
  * Versões dos termos da plataforma (D15). Mudou o texto, muda a versão: compras e vendas novas exigem o
  * aceite da versão atual, e o pedido guarda a versão aceita como prova.
  */
-export const BUYER_TERMS_VERSION = '2026-10-25';
+export const BUYER_TERMS_VERSION = '2026-11-03';
 export const PARTNER_TERMS_VERSION = '2026-10-25';
 
 export interface TermsAcceptance {

=== src/domain/content/components/SupportView.tsx — diff ===
@@ -31,7 +31,7 @@ export function SupportView({ onBack, userEmail }: SupportViewProps) {
   const [searchQuery, setSearchQuery] = useState('');
   const [copiedEmail, setCopiedEmail] = useState(false);
 
-  const supportEmail = 'atendimento@useguide.com.br';
+  const supportEmail = 'ajuda@useguide.com.br';
   // Número real vem da configuração (AGENTS.md §11.10: nada de número fictício no código).
   const whatsappUrl = whatsAppUrl(
     import.meta.env.VITE_SUPPORT_WHATSAPP?.trim(),

=== src/shared/constants/legalTerms.ts — ARQUIVO REESCRITO, substitua todo o conteúdo por este ===
/** Igual a server/shared/kernel/legalTerms.ts (D15), com teste de paridade. */
export const BUYER_TERMS_VERSION = '2026-11-03';
export const PARTNER_TERMS_VERSION = '2026-10-25';

=== src/shared/i18n/legalResources.ts — diff ===
@@ -37,7 +37,7 @@ export const legalPtBR: LegalTranslation = {
     title: 'Termos de uso',
     paragraphs: [
       'Ao usar o Use Guide, você concorda com estes termos e com a política de privacidade abaixo. Se não concordar, não use o aplicativo.',
-      'O Use Guide reúne informações, mapas e recomendações sobre Jericoacoara, Preá e Barrinha de Baixo, e vende ingressos, passeios e entradas de organizadores e estabelecimentos cadastrados.',
+      'O Use Guide reúne informações, mapas e recomendações de destinos turísticos no Brasil e vende ingressos, passeios, aluguéis, traslados e entradas de organizadores e estabelecimentos cadastrados.',
       'Você deve informar dados verdadeiros e manter suas credenciais em sigilo. A conta é pessoal e intransferível.',
       'É proibido usar o aplicativo para atividades ilegais, copiar ou distribuir o conteúdo sem autorização e tentar acessar áreas restritas.',
       'As informações de rotas, trilhas e condições do tempo são orientativas. Avalie os riscos antes de seguir uma rota sugerida.',
@@ -87,6 +87,7 @@ export const legalPtBR: LegalTranslation = {
     paragraphs: [
       'Coletamos só o necessário, como nome, e-mail, localização e dados de uso, com o seu consentimento, para oferecer uma experiência personalizada (Lei 13.709/2018, LGPD).',
       'Usamos os dados para mostrar lugares e produtos, personalizar recomendações, melhorar o desempenho e a segurança e enviar notificações.',
+      'Se você ativar as notificações, guardamos um identificador do aparelho para enviá-las. Você pode desativar a qualquer momento em Configurações › Notificações ou no navegador; o identificador é apagado quando você sair da conta neste aparelho ou excluir a conta.',
       'Serviços de terceiros, como os do Google e o Stripe, seguem regras de privacidade próprias e compatíveis com a LGPD. Dados de cartão ficam no Stripe e nunca passam pelo Use Guide.',
       'Os dados ficam em servidores protegidos por criptografia e são acessados só por pessoas autorizadas.',
       'Você pode pedir acesso, correção ou exclusão dos seus dados pelo e-mail ajuda@useguide.com.br. Registros de compra são anonimizados, e não apagados, pelo prazo legal.',
@@ -123,7 +124,7 @@ export const legalEn: LegalTranslation = {
     title: 'Terms of use',
     paragraphs: [
       'By using Use Guide, you agree to these terms and to the privacy policy below. If you do not agree, do not use the app.',
-      'Use Guide brings together information, maps and tips about Jericoacoara, Preá and Barrinha de Baixo, and sells tickets, tours and entries from registered organizers and businesses.',
+      'Use Guide brings together information, maps and tips about travel destinations in Brazil and sells tickets, tours, rentals, transfers and entries from registered organizers and businesses.',
       'You must provide true information and keep your credentials secret. Your account is personal and non-transferable.',
       'You may not use the app for illegal activities, copy or distribute its content without permission, or try to access restricted areas.',
       'Route, trail and weather information is for guidance only. Assess the risks before following a suggested route.',
@@ -173,6 +174,7 @@ export const legalEn: LegalTranslation = {
     paragraphs: [
       'We collect only what is needed, such as name, email, location and usage data, with your consent, to offer a personalized experience (Brazilian Law 13.709/2018, LGPD).',
       'We use the data to show places and products, personalize recommendations, improve performance and security, and send notifications.',
+      'If you turn on notifications, we store an identifier for the device to send them. You can turn them off at any time in Settings › Notifications or in your browser; the identifier is deleted when you sign out on this device or delete your account.',
       'Third-party services such as Google and Stripe follow their own privacy rules, compatible with the LGPD. Card data stays with Stripe and never passes through Use Guide.',
       'Data is stored on servers protected by encryption and accessed only by authorized people.',
       'You can request access to, correction of or deletion of your data at ajuda@useguide.com.br. Purchase records are anonymized, not deleted, for the legal period.',
@@ -209,7 +211,7 @@ export const legalFr: LegalTranslation = {
     title: 'Conditions d’utilisation',
     paragraphs: [
       'En utilisant Use Guide, vous acceptez ces conditions et la politique de confidentialité ci-dessous. Si vous n’êtes pas d’accord, n’utilisez pas l’application.',
-      'Use Guide rassemble des informations, des cartes et des conseils sur Jericoacoara, Preá et Barrinha de Baixo, et vend des billets, des excursions et des entrées d’organisateurs et d’établissements inscrits.',
+      'Use Guide rassemble des informations, des cartes et des conseils sur des destinations touristiques au Brésil et vend des billets, des excursions, des locations, des transferts et des entrées d’organisateurs et d’établissements inscrits.',
       'Vous devez fournir des informations exactes et garder vos identifiants secrets. Le compte est personnel et non transférable.',
       'Il est interdit d’utiliser l’application pour des activités illégales, de copier ou diffuser son contenu sans autorisation et de tenter d’accéder à des zones restreintes.',
       'Les informations sur les itinéraires, les sentiers et la météo sont indicatives. Évaluez les risques avant de suivre un itinéraire proposé.',
@@ -259,6 +261,7 @@ export const legalFr: LegalTranslation = {
     paragraphs: [
       'Nous ne collectons que le nécessaire, comme le nom, l’e-mail, la localisation et les données d’utilisation, avec votre consentement, pour offrir une expérience personnalisée (loi brésilienne 13.709/2018, LGPD).',
       'Nous utilisons ces données pour afficher des lieux et des produits, personnaliser les recommandations, améliorer les performances et la sécurité et envoyer des notifications.',
+      'Si vous activez les notifications, nous conservons un identifiant de l’appareil pour les envoyer. Vous pouvez les désactiver à tout moment dans Paramètres › Notifications ou dans votre navigateur ; l’identifiant est supprimé lorsque vous vous déconnectez sur cet appareil ou supprimez votre compte.',
       'Les services tiers, comme Google et Stripe, suivent leurs propres règles de confidentialité, compatibles avec la LGPD. Les données de carte restent chez Stripe et ne passent jamais par Use Guide.',
       'Les données sont stockées sur des serveurs protégés par chiffrement et consultées uniquement par des personnes autorisées.',
       'Vous pouvez demander l’accès, la correction ou la suppression de vos données à ajuda@useguide.com.br. Les données d’achat sont anonymisées, et non supprimées, pendant la durée légale.',

VERIFICAÇÃO (obrigatória):
- `npm run typecheck`, `npx biome lint .` (0 erros; arquivos tocados sem avisos), `npm run build`;
- testes ligados aos arquivos deste prompt: `npx vitest related --run server/shared/kernel/legalTerms.ts src/domain/content/components/SupportView.tsx src/shared/constants/legalTerms.ts src/shared/i18n/legalResources.ts` (todos verdes). Não precisa rodar a suíte inteira.

ENTREGA: responda no formato do AGENTS.md §16.3.

LIMPEZA (obrigatória, ao terminar de implementar): apague todos os arquivos de public/assets/aistudio/, inclusive o deste prompt. São cópias dos textos colados no chat, salvas automaticamente pelo AI Studio, e public/ vai para o site publicado. Se a pasta ficar vazia, apague a pasta também.
~~~~

### Configurações manuais (você faz, fora do AI Studio, depois de aplicar este prompt)

1. Publique uma revisão nova do Cloud Run (`use-guide`, `us-east1`) e o Hosting com o mesmo código.
2. Depois do `npm install`, o package-lock.json fica com a versão 1.0.0; não edite à mão.
