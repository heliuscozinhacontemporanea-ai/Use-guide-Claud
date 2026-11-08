import type {
  AdminAccountDebt,
  AdminForceMajeureReview,
  AdminPage,
  AdminSaleClaim,
  SaleClaimDecisionInput,
} from '../types/adminFinance';

/** Filas financeiras do admin (D16); o backend confere o papel em cada rota. */
export interface AdminFinanceApiPort {
  listSaleClaims(cursor?: string): Promise<AdminPage<AdminSaleClaim>>;
  decideSaleClaim(claimId: string, decision: SaleClaimDecisionInput): Promise<void>;
  listForceMajeureReviews(): Promise<AdminForceMajeureReview[]>;
  readForceMajeureProof(debtId: string): Promise<Blob>;
  decideForceMajeure(debtId: string, approve: boolean): Promise<void>;
  listAccountDebts(cursor?: string): Promise<AdminPage<AdminAccountDebt>>;
  waiveAccountDebt(debtId: string): Promise<void>;
}
