import React from 'react';

export interface LicenseItem {
  name: string;
  version: string;
  license: string;
  copyright: string;
  description: string;
}

export type FAQCategoryType = 'all' | 'general' | 'kitesurf' | 'account' | 'partner';

export interface FAQItem {
  id: string;
  category: FAQCategoryType;
  question: string;
  answer: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}
