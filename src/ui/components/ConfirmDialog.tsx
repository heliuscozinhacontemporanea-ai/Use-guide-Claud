import * as RadixDialog from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../shared/utils/cn';
import { Z_INDEX } from '../../shared/constants/zIndex';
import { BUTTON_DANGER, BUTTON_POSITIVE } from '../styles/controls';
import { TextButton } from './TextButton';

/** `danger` (padrão) para excluir ou cancelar; `positive` para aprovar ou liberar algo. */
export type ConfirmDialogTone = 'danger' | 'positive';

export interface ConfirmDialogData {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: ConfirmDialogTone;
  /** Pergunta curta acima da mensagem; sem ela, a mensagem vira o título. */
  title?: string;
  /** Valor que a pessoa precisa ver antes de decidir (ex.: o reembolso). */
  highlight?: { label: string; value: string };
  /** Linha de apoio, menor, abaixo da mensagem. */
  note?: string;
  /** Rótulo do botão de confirmar; o padrão é "Confirmar". */
  confirmLabel?: string;
  /** Rótulo de desistir; o padrão é "Cancelar", que confunde quando a ação também é cancelar. */
  cancelLabel?: string;
}

interface ConfirmDialogProps {
  data: ConfirmDialogData | null;
}

export function ConfirmDialog({ data }: ConfirmDialogProps) {
  const { t } = useTranslation();
  const positive = data?.tone === 'positive';
  const Icon = positive ? CheckCircle2 : AlertTriangle;
  return (
    <RadixDialog.Root
      open={!!data}
      onOpenChange={(open) => {
        if (!open && data) data.onCancel();
      }}
    >
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className="fixed inset-0 bg-scrim backdrop-blur-sm animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
          // Mesma camada do conteúdo: a confirmação abre por cima de folhas e do menu lateral.
          style={{ zIndex: Z_INDEX.modalNested }}
        />
        <RadixDialog.Content
          // Sem título a mensagem já é o título; `undefined` diz ao Radix que não há descrição.
          {...(data?.title ? {} : { 'aria-describedby': undefined })}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-xs p-6 rounded-3xl bg-surface-solid border border-line text-ink flex flex-col items-center text-center gap-3 outline-none animate-scale-in data-[state=closed]:animate-scale-out motion-reduce:animate-none"
          style={{ zIndex: Z_INDEX.modalNested }}
          // Foco na própria caixa, sem anel num botão que a pessoa não tocou (AGENTS.md §11.11).
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
          <Icon size={28} className={positive ? 'text-success' : 'text-warn'} aria-hidden="true" />
          {data?.title ? (
            <>
              <RadixDialog.Title className="text-base font-bold text-ink">
                {data.title}
              </RadixDialog.Title>
              {data.highlight && (
                <div>
                  <p className="text-[13px] text-ink/70">{data.highlight.label}</p>
                  <p className="text-2xl font-bold text-ink tabular-nums">{data.highlight.value}</p>
                </div>
              )}
              <RadixDialog.Description className="text-[13px] text-ink/70 leading-relaxed">
                {data.message}
              </RadixDialog.Description>
            </>
          ) : (
            <RadixDialog.Title className="text-sm font-medium text-ink leading-relaxed">
              {data?.message}
            </RadixDialog.Title>
          )}
          {data?.note && <p className="text-[12px] text-ink/60">{data.note}</p>}
          <div className="flex flex-col gap-1 w-full pt-1">
            <button
              type="button"
              onClick={data?.onConfirm}
              className={cn(positive ? BUTTON_POSITIVE : BUTTON_DANGER, 'w-full')}
            >
              {data?.confirmLabel ?? t('common.confirm')}
            </button>
            <TextButton onClick={data?.onCancel} className="justify-center mx-0">
              {data?.cancelLabel ?? t('common.cancel')}
            </TextButton>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
