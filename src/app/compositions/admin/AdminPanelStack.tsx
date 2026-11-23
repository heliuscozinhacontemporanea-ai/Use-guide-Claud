import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageStack } from '../../../ui/hooks/pageStack';
import { PushStack } from '../../../ui/layouts/stack/PushStack';
import type { StackAction, StackEntry } from '../../../ui/layouts/stack/stackTypes';
import { AdminListingEditorPage } from './AdminListingEditorPage';
import {
  AdminListingBlockPage,
  AdminListingPublishPage,
  AdminNewListingPage,
} from './AdminListingPages';
import { AdminTipPage } from './AdminTipPage';
import { type AdminPage, adminPages } from './adminStack';

// A página de cima entrega à barra a ação de salvar (D33); só uma tela tem a barra por vez.
let barSave: (() => void) | null = null;
const registerSave = (save: (() => void) | null) => {
  barSave = save;
};

function pageEntry(
  page: AdminPage,
  t: TFunction
): { title: string; content: ReactNode; action?: StackAction } {
  const save = (label: string): StackAction => ({ label, onClick: () => barSave?.() });
  switch (page.view) {
    case 'listing-new':
      return { title: t('adminPanel.guide.newTitle'), content: <AdminNewListingPage /> };
    case 'listing-editor':
      return {
        title: t('adminPanel.guide.editorTitle'),
        content: <AdminListingEditorPage itemId={page.itemId} />,
      };
    case 'listing-block':
      return {
        title: page.title,
        action: save(t('adminPanel.save')),
        content: (
          <AdminListingBlockPage
            itemId={page.itemId}
            block={page.block}
            registerSave={registerSave}
          />
        ),
      };
    case 'listing-publish':
      return {
        title: t('adminPanel.guide.publish'),
        content: <AdminListingPublishPage itemId={page.itemId} />,
      };
    case 'tip':
      return {
        title: t(page.itemId ? 'adminPanel.tip.editTitle' : 'adminPanel.tip.newTitle'),
        action: save(t(page.itemId ? 'adminPanel.tip.save' : 'adminPanel.tip.publish')),
        content: <AdminTipPage itemId={page.itemId} registerSave={registerSave} />,
      };
  }
}

/**
 * O painel admin com as páginas abertas por cima (D33, escolhas da F4): o painel é a base, e os
 * anúncios e as dicas abrem como páginas empilhadas, com a barra fixa e o voltar.
 */
export function AdminPanelStack({ root }: { root: ReactNode }) {
  const { t } = useTranslation();
  const pages = usePageStack(adminPages);
  const entries: StackEntry[] = [
    { key: 'admin', navBar: false, bare: true, render: () => root },
    ...pages.map((page, index) => {
      const { title, content, action } = pageEntry(page, t);
      return { key: `${page.view}-${index}`, title, action, navBar: true, render: () => content };
    }),
  ];
  return <PushStack entries={entries} backLabel={t('settings.back')} onBack={adminPages.back} />;
}
