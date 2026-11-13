// "Também trabalha com…?" no Mais do painel (S3, aprovado em 2026-11-09).
type Row = { title: string; hint: string };

export interface PartnerAddSegmentTranslation {
  entry: string;
  title: string;
  description: string;
  have: string;
  rows: {
    tours: Row;
    rentals: Row;
    transfers: Row;
    attraction: Row;
    events: Row;
    showcase: Row;
  };
}

export const partnerAddSegmentPtBR: PartnerAddSegmentTranslation = {
  entry: 'Também trabalha com…?',
  title: 'Também trabalha com…?',
  description: 'O painel passa a mostrar o que você escolher.',
  have: 'Você já tem',
  rows: {
    tours: { title: 'Passeios', hint: 'Saídas com horário e vagas' },
    rentals: { title: 'Aluguéis', hint: 'Quadriciclo, buggy, bike; período e caução' },
    transfers: { title: 'Translados', hint: 'Rotas, passageiros e bagagem' },
    attraction: { title: 'Atração com entrada', hint: 'Venda de entradas com portaria' },
    events: { title: 'Eventos', hint: 'Ingressos, lotes, convidados e divulgadores' },
    showcase: { title: 'Hospedagem ou restaurante', hint: 'Página no guia, avaliações e selo' },
  },
};
