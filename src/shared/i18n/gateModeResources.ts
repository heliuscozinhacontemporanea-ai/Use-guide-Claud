/** Textos do modo portaria (D21), comum a eventos e entradas de atração. pt-BR é a fonte. */
export interface GateModeTranslation {
  open: string;
  online: string;
  offline: string;
  close: string;
  lowBattery: string;
  aim: string;
  opening: string;
  standby: string;
  cameraDenied: string;
  unsupported: string;
  resume: string;
  enterCode: string;
  torch: string;
  next: string;
  codeTitle: string;
  codeLabel: string;
  character: string;
  confirmCode: string;
  failed: string;
  allowed: string;
  denied: string;
  attention: string;
}

export const gateModePtBR: GateModeTranslation = {
  open: 'Abrir modo portaria',
  online: 'Com internet',
  offline: 'Sem internet',
  close: 'Sair do modo portaria',
  lowBattery: 'Bateria baixa. Ligue o carregador para não parar a portaria.',
  aim: 'Aponte para o QR Code dentro da moldura',
  opening: 'Abrindo a câmera…',
  standby: 'Câmera em espera para poupar bateria.',
  cameraDenied: 'Sem acesso à câmera. Use “Inserir código”.',
  unsupported: 'Não foi possível abrir o leitor. Use “Inserir código”.',
  resume: 'Toque para continuar',
  enterCode: 'Inserir código',
  torch: 'Lanterna',
  next: 'Próximo',
  codeTitle: 'Código Token',
  codeLabel: 'Código que aparece abaixo do QR Code',
  character: 'Caractere {{n}} de {{total}}',
  confirmCode: 'Confirmar',
  failed: 'Não foi possível validar. Tente de novo.',
  allowed: 'Entrada liberada',
  denied: 'Entrada recusada',
  attention: 'Atenção',
};
