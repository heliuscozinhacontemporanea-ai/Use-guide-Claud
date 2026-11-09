/** Textos do domínio partners (pt-BR é a fonte; en e fr têm as mesmas chaves, garantidas pelo tipo). */
export interface PartnersTranslation {
  place: {
    state: string;
    statePlaceholder: string;
    city: string;
    cityPlaceholder: string;
    region: string;
    regionPlaceholder: string;
    address: string;
    addressPlaceholder: string;
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
    address: 'Endereço',
    addressPlaceholder: 'CEP, rua e número',
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
    address: 'Address',
    addressPlaceholder: 'Postal code, street and number',
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
    address: 'Adresse',
    addressPlaceholder: 'Code postal, rue et numéro',
    required: "Indiquez l'État et la ville",
  },
  items: {
    edit: 'Modifier {{name}}',
  },
};
