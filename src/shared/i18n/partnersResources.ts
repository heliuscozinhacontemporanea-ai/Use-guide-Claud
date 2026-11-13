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
