/** Textos do cabeçalho e das abas do painel admin. pt-BR é a fonte. */
type Tabs = {
  reports: string;
  partners: string;
  items: string;
  events: string;
  plans: string;
  notifications: string;
};

export interface AdminPanelTranslation {
  title: string;
  back: string;
  tabsLabel: string;
  tabs: Tabs;
}

export const adminPanelPtBR: AdminPanelTranslation = {
  title: 'Painel admin',
  back: 'Voltar para o início',
  tabsLabel: 'Seções do painel admin',
  tabs: {
    reports: 'Relatórios',
    partners: 'Parceiros',
    items: 'Guia local',
    events: 'Agenda',
    plans: 'Planos',
    notifications: 'Avisos',
  },
};
