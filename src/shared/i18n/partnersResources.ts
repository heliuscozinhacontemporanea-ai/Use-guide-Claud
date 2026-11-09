/** Textos do domínio partners (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface PartnersTranslation {
  place: {
    state: string;
    statePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    region: string;
    regionPlaceholder: string;
    required: string;
  };
  items: {
    edit: string;
  };
}

export const partnersPtBR: PartnersTranslation = {
  place: {
    state: 'Estado',
    statePlaceholder: 'Selecione',
    city: 'Cidade',
    cityPlaceholder: 'Ex.: Jijoca de Jericoacoara',
    region: 'Região / Bairro',
    regionPlaceholder: 'Bairro, praia ou região',
    required: 'Informe o estado e a cidade',
  },
  items: {
    edit: 'Editar {{name}}',
  },
};

export const partnersEn: PartnersTranslation = {
  place: {
    state: 'State',
    statePlaceholder: 'Select',
    city: 'City',
    cityPlaceholder: 'E.g. Jijoca de Jericoacoara',
    region: 'Area / Neighborhood',
    regionPlaceholder: 'Neighborhood, beach or area',
    required: 'Enter the state and the city',
  },
  items: {
    edit: 'Edit {{name}}',
  },
};

export const partnersFr: PartnersTranslation = {
  place: {
    state: 'État',
    statePlaceholder: 'Choisir',
    city: 'Ville',
    cityPlaceholder: 'Ex. : Jijoca de Jericoacoara',
    region: 'Région / Quartier',
    regionPlaceholder: 'Quartier, plage ou région',
    required: "Indiquez l'État et la ville",
  },
  items: {
    edit: 'Modifier {{name}}',
  },
};
