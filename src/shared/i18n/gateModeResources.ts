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
  codeTitle: 'Código do QR',
  codeLabel: 'Código que aparece abaixo do QR',
  character: 'Caractere {{n}} de {{total}}',
  confirmCode: 'Confirmar',
  failed: 'Não foi possível validar. Tente de novo.',
  allowed: 'Entrada liberada',
  denied: 'Entrada recusada',
  attention: 'Atenção',
};

export const gateModeEn: GateModeTranslation = {
  open: 'Open entrance mode',
  online: 'Online',
  offline: 'Offline',
  close: 'Leave entrance mode',
  lowBattery: 'Low battery. Plug in the charger so the entrance does not stop.',
  aim: 'Point at the QR code inside the frame',
  opening: 'Opening the camera…',
  standby: 'Camera on standby to save battery.',
  cameraDenied: 'No camera access. Use “Enter code”.',
  unsupported: 'The reader could not open. Use “Enter code”.',
  resume: 'Tap to continue',
  enterCode: 'Enter code',
  torch: 'Flashlight',
  next: 'Next',
  codeTitle: 'QR code',
  codeLabel: 'Code shown below the QR',
  character: 'Character {{n}} of {{total}}',
  confirmCode: 'Confirm',
  failed: 'Could not validate. Try again.',
  allowed: 'Entry allowed',
  denied: 'Entry refused',
  attention: 'Attention',
};

export const gateModeFr: GateModeTranslation = {
  open: 'Ouvrir le mode accueil',
  online: 'En ligne',
  offline: 'Hors ligne',
  close: 'Quitter le mode accueil',
  lowBattery: 'Batterie faible. Branchez le chargeur pour ne pas arrêter l’accueil.',
  aim: 'Visez le QR code dans le cadre',
  opening: 'Ouverture de la caméra…',
  standby: 'Caméra en veille pour économiser la batterie.',
  cameraDenied: 'Pas d’accès à la caméra. Utilisez « Saisir le code ».',
  unsupported: 'Le lecteur n’a pas pu s’ouvrir. Utilisez « Saisir le code ».',
  resume: 'Touchez pour continuer',
  enterCode: 'Saisir le code',
  torch: 'Lampe',
  next: 'Suivant',
  codeTitle: 'Code du QR',
  codeLabel: 'Code affiché sous le QR',
  character: 'Caractère {{n}} sur {{total}}',
  confirmCode: 'Confirmer',
  failed: 'Impossible de valider. Réessayez.',
  allowed: 'Entrée autorisée',
  denied: 'Entrée refusée',
  attention: 'Attention',
};
