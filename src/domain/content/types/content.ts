import React from 'react';

/** Biblioteca de produção com o texto da licença (gerado por `npm run licenses`). */
export interface OpenSourceLicense {
  name: string;
  version: string;
  license: string;
  author: string;
  url: string;
  text: string;
}

/** Trabalho de terceiros usado no app (ilustração, animação), com a autoria exigida pela licença. */
export interface ThirdPartyCredit {
  id: string;
  /** Chave de tradução do que é o trabalho. */
  workKey: string;
  author: string;
  source: string;
  url: string;
  license: string;
  text: string;
}

export type FAQCategoryType = 'all' | 'general' | 'kitesurf' | 'account' | 'partner';

export interface FAQItem {
  id: string;
  category: FAQCategoryType;
  question: string;
  answer: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}
