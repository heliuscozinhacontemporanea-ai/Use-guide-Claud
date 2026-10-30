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

export const adminPanelEn: AdminPanelTranslation = {
  title: 'Admin panel',
  back: 'Back to home',
  tabsLabel: 'Admin panel sections',
  tabs: {
    reports: 'Reports',
    partners: 'Partners',
    items: 'Local guide',
    events: 'Agenda',
    plans: 'Plans',
    notifications: 'Notices',
  },
};

export const adminPanelFr: AdminPanelTranslation = {
  title: 'Panneau admin',
  back: 'Retour à l’accueil',
  tabsLabel: 'Sections du panneau admin',
  tabs: {
    reports: 'Rapports',
    partners: 'Partenaires',
    items: 'Guide local',
    events: 'Agenda',
    plans: 'Formules',
    notifications: 'Avis',
  },
};
