import { useCallback, useEffect, useRef, useState } from 'react';
import { completePanelTourUseCase } from '../application/usecases/completePanelTourUseCase';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';

/**
 * Tour do painel (etapa 6): abre sozinho no Início até a pessoa concluir ou marcar "Não mostrar
 * novamente" (guardado na conta). Pulado sem a caixa, volta na próxima abertura do painel.
 */
export function usePanelTour({
  tourDone,
  tab,
  editing,
  onTabChange,
}: {
  tourDone: boolean | undefined;
  tab: PartnerPanelTab;
  editing: boolean;
  onTabChange: (tab: PartnerPanelTab) => void;
}) {
  const [open, setOpen] = useState(false);
  const shown = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (shown.current || tourDone !== false || done || tab !== 'home' || editing) return;
    shown.current = true;
    setOpen(true);
  }, [tourDone, done, tab, editing]);

  const close = useCallback((finished: boolean) => {
    setOpen(false);
    if (!finished) return;
    setDone(true);
    // Sem rede, só volta a aparecer na próxima abertura: não vale um erro na tela.
    void completePanelTourUseCase().catch(() => undefined);
  }, []);

  const replay = useCallback(() => {
    onTabChange('home');
    setOpen(true);
  }, [onTabChange]);

  return { open, close, replay };
}
