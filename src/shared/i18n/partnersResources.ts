/** Textos do domínio partners (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface PartnersTranslation {
  signupSuccess: {
    title: string;
    /** `<name>` e `<active>` viram destaque pelo componente `<Trans>`. */
    message: string;
    nextStepsTitle: string;
    steps: {
      verify: string;
      photos: string;
      manage: string;
    };
    accessPanel: string;
    backHome: string;
  };
  items: {
    edit: string;
  };
}

export const partnersPtBR: PartnersTranslation = {
  signupSuccess: {
    title: 'Cadastro concluído!',
    message:
      'Parabéns! Sua empresa <name>{{name}}</name> foi registrada e já está <active>ativa</active> no Use Guide.',
    nextStepsTitle: 'Próximos passos',
    steps: {
      verify: 'Envie a verificação do estabelecimento no painel: ela libera o selo e as vendas',
      photos: 'Complete o cadastro com fotos',
      manage: 'Gerencie seus estabelecimentos e eventos',
    },
    accessPanel: 'Acessar painel do parceiro',
    backHome: 'Voltar para o início',
  },
  items: {
    edit: 'Editar {{name}}',
  },
};

export const partnersEn: PartnersTranslation = {
  signupSuccess: {
    title: 'Sign-up complete!',
    message:
      'Congratulations! Your business <name>{{name}}</name> is registered and already <active>active</active> on Use Guide.',
    nextStepsTitle: 'Next steps',
    steps: {
      verify: 'Send the business verification from the panel: it unlocks the badge and sales',
      photos: 'Add photos to your listing',
      manage: 'Manage your businesses and events',
    },
    accessPanel: 'Open partner panel',
    backHome: 'Back to home',
  },
  items: {
    edit: 'Edit {{name}}',
  },
};

export const partnersFr: PartnersTranslation = {
  signupSuccess: {
    title: 'Inscription terminée !',
    message:
      'Félicitations ! Votre entreprise <name>{{name}}</name> est enregistrée et déjà <active>active</active> sur Use Guide.',
    nextStepsTitle: 'Prochaines étapes',
    steps: {
      verify:
        'Envoyez la vérification de l’établissement depuis le panneau : elle débloque le badge et les ventes',
      photos: 'Ajoutez des photos à votre fiche',
      manage: 'Gérez vos établissements et événements',
    },
    accessPanel: 'Ouvrir le panneau partenaire',
    backHome: 'Retour à l’accueil',
  },
  items: {
    edit: 'Modifier {{name}}',
  },
};
