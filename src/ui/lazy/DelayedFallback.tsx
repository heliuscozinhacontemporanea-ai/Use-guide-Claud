import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListLoading } from '../components/ListState';

/** O que chega antes de ~150 ms não pisca um skeleton na tela (DESIGN.md P15). */
export function DelayedFallback({
  children,
  delayMs = 150,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);
  return visible ? children : null;
}

/** Espera de uma tela carregada sob demanda: skeleton de lista, só depois do atraso. */
export function ScreenFallback({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <DelayedFallback>
      <div className={className ?? 'p-6'}>
        <ListLoading label={t('common.loading')} />
      </div>
    </DelayedFallback>
  );
}
