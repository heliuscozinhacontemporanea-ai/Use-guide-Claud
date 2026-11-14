import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type PageStack, usePageStack } from '../../../../ui/hooks/pageStack';
import { PushStack } from '../../../../ui/layouts/stack/PushStack';
import type { StackEntry } from '../../../../ui/layouts/stack/stackTypes';
import type { PanelPage } from '../../hooks/usePanelNavigation';

/**
 * O painel com as páginas abertas por cima (D33): só este componente acompanha a pilha. Abrir ou
 * fechar uma página não redesenha o painel; `root` é o mesmo elemento de antes e o React o reaproveita.
 */
export function PartnerPanelStack({
  stack,
  root,
  renderPage,
}: {
  stack: PageStack<PanelPage>;
  root: ReactNode;
  renderPage: (page: PanelPage) => { title: string; content: ReactNode };
}) {
  const { t } = useTranslation();
  const pages = usePageStack(stack);
  const entries: StackEntry[] = [
    { key: 'panel', navBar: false, bare: true, render: () => root },
    ...pages.map((page, index) => {
      const { title, content } = renderPage(page);
      return { key: `${page.view}-${index}`, title, navBar: true, render: () => content };
    }),
  ];
  return <PushStack entries={entries} backLabel={t('settings.back')} onBack={stack.back} />;
}
