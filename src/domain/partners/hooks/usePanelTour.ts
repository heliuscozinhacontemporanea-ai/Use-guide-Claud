import { useCallback, useEffect, useRef, useState } from 'react';
import { recordPanelTourUseCase } from '../application/usecases/recordPanelTourUseCase';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';
import type { PartnerHomeView } from '../types/partnerHome';
import type { PanelTourResult } from '../utils/panelTourSteps';

/**
 * Tour do painel (proposta 2): abre sozinho no Início quando o servidor diz `show` (nunca visto,
 * ou pulado uma vez). Em Mais, "Ver o tour do painel" abre a escolha do capítulo.
 */
export function usePanelTour({
  tour,
  tab,
  editing,
  onTabChange,
}: {
  tour: PartnerHomeView['tour'] | undefined;
  tab: PartnerPanelTab;
  editing: boolean;
  onTabChange: (tab: PartnerPanelTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const [startChapter, setStartChapter] = useState(0);
  const [chooserOpen, setChooserOpen] = useState(false);
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current || !tour?.show || tab !== 'home' || editing) return;
    opened.current = true;
    setStartChapter(0);
    setOpen(true);
    // Sem rede, o tour pode abrir uma vez a mais: não vale um erro na tela.
    void recordPanelTourUseCase('shown').catch(() => undefined);
  }, [tour?.show, tab, editing]);

  const close = useCallback(
    (result: PanelTourResult) => {
      setOpen(false);
      onTabChange('home');
      if (result === 'skip') return;
      void recordPanelTourUseCase(result).catch(() => undefined);
    },
    [onTabChange]
  );

  const replay = useCallback((chapter: number) => {
    opened.current = true;
    setChooserOpen(false);
    setStartChapter(chapter);
    setOpen(true);
  }, []);

  return {
    open,
    startChapter,
    close,
    chooserOpen,
    setChooserOpen,
    replay,
  };
}
