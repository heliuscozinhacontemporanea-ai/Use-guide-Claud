import type { ListingPlanView } from '../types/listingPlan';

export interface ListingPlanPort {
  get(itemId: string): Promise<ListingPlanView>;
  /** Teste grátis de 7 dias, uma vez por conta, no estabelecimento escolhido (D11). */
  activateTrial(itemId: string): Promise<ListingPlanView>;
  /** Só admin: concede ou retira o selo; tipo e validade são decididos no servidor (D8). */
  setSeal(itemId: string, grant: boolean): Promise<ListingPlanView>;
}
