# Solicitações de Alteração ao AGENTS.md

| ID | Seção | Resumo | Status |
|---|---|---|---|
| S1 | §3.2 | Permitir `react-router-dom` e outras bibliotecas | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S2 | §5.4 | Escala fixa de z-index | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S3 | §8.1 | Leituras no frontend via Firestore Client SDK | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S4 | §11.10 | Proibido hardcoding de dados aparentando ser reais | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S5 | §12.5 | Idiomas suportados e chaves de tradução | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S6 | §12.6 | Decisão D5 está em aberto; o texto atual não diz isso | ❌ Não aprovada (2026-10-10) — texto atual mantido |
| S7 | §12.7 | Decisões D6 (URLs por idioma) e D7 (SEO no Cloud Run) | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S8 | §15 | Referenciar o registro de decisões aprovadas | ✅ Aprovada em 2026-10-10 (prompt A1) |
| S9 | §13 | O texto cita agregadores de UseCases que o prompt 15 eliminou | ⏳ Aguardando sua decisão |

---

## S9 — §13: agregadores de UseCases já eliminados

**Por quê:** o prompt 15 dividiu todos os agregadores em um UseCase por arquivo. O §13 ainda diz que `eventUseCases.ts`, `ticketingUseCases.ts` e `paymentUseCases.ts` existem e são débito. Um agente que leia isso pode procurar esses arquivos ou recriá-los.

**Texto atual:**
> * **Um UseCase por arquivo** (`createBookingUseCase.ts`). Arquivos agregadores existentes (`eventUseCases.ts`, `ticketingUseCases.ts`, `paymentUseCases.ts`) são débito: novos UseCases não entram neles.

**Texto proposto:**
> * **Um UseCase por arquivo** (`createBookingUseCase.ts`), com o nome do arquivo igual ao da função exportada. É proibido criar arquivo agregador de UseCases; tipos compartilhados entre UseCases ficam em arquivo próprio (ex: `orchestrationActor.ts`).
