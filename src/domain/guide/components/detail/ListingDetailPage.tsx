import { MapPin, Star, X } from 'lucide-react';
import { type MotionValue, motion, useScroll } from 'motion/react';
import { type ReactNode, useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BOTTOM_NAV_CLEARANCE } from '../../../../shared/constants/bottomNav';
import { CATEGORIES } from '../../../../shared/constants/categories';
import { Z_INDEX } from '../../../../shared/constants/zIndex';
import { cn } from '../../../../shared/utils/cn';
import { optimizeImage } from '../../../../shared/utils/formatters';
import { ShareButton } from '../../../../ui/components/ShareButton';
import { VerifiedSealButton } from '../../../../ui/components/VerifiedSealButton';
import { trackInteractionUseCase as trackInteraction } from '../../../insights';
import type { GuideItem } from '../../types/guide';
import { useListingHero } from '../../hooks/useListingHero';
import { isListingSealVisible } from '../../utils/listingSeal';

/**
 * Anúncio em tela cheia (aprovado em 2026-11-10): a foto vem do cartão e ocupa o topo, com
 * favoritar e compartilhar; embaixo, tag, nota, nome, local, descrição e as seções da categoria.
 * A foto cresce do cartão e o conteúdo desce junto; fechar faz o caminho inverso (efeito do vídeo de
 * referência de 2026-11-15, `useListingHero`).
 *
 * É uma página da aba (decisão de 2026-11-14, P23): fica abaixo da barra de abas, que continua
 * visível. Aberto pela busca, que já cobre a barra, fica por cima de tudo (`coversTabBar`).
 */
export function ListingDetailPage({
  item,
  onClose,
  locationLabel,
  collectionName = 'items',
  favorite,
  coversTabBar = false,
  growsFromCard = true,
  children,
}: {
  item: GuideItem;
  onClose: () => void;
  /** Local já pronto para exibir (ex.: "Preá, Ceará"). */
  locationLabel: string;
  collectionName?: 'items' | 'events';
  /** Botão de favoritar, montado pelo app (favorites); some com a rolagem da página. */
  favorite?: (scrollY: MotionValue<number>) => ReactNode;
  /** Por cima de uma camada que já cobre a barra de abas (a busca): janela à parte, sem a barra. */
  coversTabBar?: boolean;
  /** A foto cresce do cartão tocado. Sem toque (link, voltar, troca de aba), o anúncio só esmaece. */
  growsFromCard?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });
  // Aberto pela busca, a foto não tem cartão visível de onde sair: só esmaece.
  const hero = useListingHero({
    itemId: item.id,
    enabled: growsFromCard && !coversTabBar,
    heroRef,
  });
  const close = () => hero.close(onClose);
  const [activeImage, setActiveImage] = useState(0);
  const category = CATEGORIES[item.category as keyof typeof CATEGORIES];
  const images = item.images?.length ? item.images.slice(0, 5) : item.image ? [item.image] : [];

  useEffect(() => {
    void trackInteraction(item.id, 'view', collectionName);
  }, [item.id, collectionName]);

  // O `onClose` muda a cada render de quem abriu: o Esc lê o mais recente sem refazer o efeito, e o
  // foco vai para o anúncio só ao abrir (não sai de um campo da reserva quando a lista atualiza).
  const onEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') close();
  });
  useEffect(() => {
    scrollRef.current?.focus({ preventScroll: true });
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, []);

  return (
    <motion.div
      className="fixed inset-0"
      style={{ ...hero.layer, zIndex: coversTabBar ? Z_INDEX.modal : Z_INDEX.tabPage }}
    >
      {/* O fundo aparece enquanto a foto cresce; a tela de baixo aparece até ele ficar opaco. */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-app"
        style={{ opacity: hero.backdrop }}
      />
      <motion.div
        ref={scrollRef}
        role={coversTabBar ? 'dialog' : 'region'}
        aria-modal={coversTabBar || undefined}
        aria-label={item.name}
        tabIndex={-1}
        style={hero.page}
        className="absolute inset-0 overflow-y-auto overscroll-contain outline-none"
      >
        <motion.div
          ref={heroRef}
          style={{ ...hero.photo, transformOrigin: '0 0' }}
          className="relative w-full h-[46vh] max-h-[460px] min-h-[260px] overflow-hidden bg-surface will-change-transform"
        >
          {images.length > 0 ? (
            <div
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
              onScroll={(event) => {
                const { scrollLeft, clientWidth } = event.currentTarget;
                if (clientWidth > 0) setActiveImage(Math.round(scrollLeft / clientWidth));
              }}
            >
              {images.map((src, index) => (
                <img
                  key={src}
                  src={optimizeImage(src, 1200)}
                  alt={
                    images.length > 1
                      ? t('listingDetail.photoAlt', {
                          name: item.name,
                          index: index + 1,
                          count: images.length,
                        })
                      : item.name
                  }
                  // P7: a capa é a imagem principal da primeira dobra.
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="w-full h-full shrink-0 snap-center object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full bg-surface" />
          )}
          {/* Dá leitura aos botões da capa: aparece e some com eles (a foto do cartão não tem). */}
          <motion.div
            style={hero.chrome}
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25"
          />
        </motion.div>

        <motion.div
          style={hero.chrome}
          className="pointer-events-none absolute inset-x-0 top-0 h-[46vh] max-h-[460px] min-h-[260px]"
        >
          <button
            type="button"
            onClick={close}
            aria-label={t('common.close')}
            className="press pointer-events-auto absolute right-4 top-[max(1rem,env(safe-area-inset-top))] size-11 rounded-full bg-black/55 text-on-fill backdrop-blur-md flex items-center justify-center focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:outline-none"
          >
            <X size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <div className="pointer-events-auto absolute bottom-3 left-4">{favorite?.(scrollY)}</div>
          <div className="pointer-events-auto absolute bottom-3 right-4">
            <ShareButton
              itemId={item.id}
              itemName={item.name}
              collectionName={collectionName}
              partnerId={item.partnerId}
              scrollY={scrollY}
            />
          </div>
          {images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5"
              aria-hidden="true"
            >
              {images.map((src, index) => (
                <span
                  key={src}
                  className={cn(
                    'size-1.5 rounded-full bg-on-fill transition-opacity',
                    index === activeImage ? 'opacity-100' : 'opacity-45'
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          style={{
            ...hero.content,
            paddingBottom: coversTabBar
              ? 'max(2.5rem, env(safe-area-inset-bottom, 0px))'
              : BOTTOM_NAV_CLEARANCE,
          }}
          className="relative mx-auto w-full max-w-2xl px-5 pt-5 space-y-4"
        >
          <header className="space-y-2">
            <div className="flex items-center gap-2">
              {category && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full border text-[11px] font-bold tracking-wide uppercase',
                    category.colorClass,
                    category.bgClass,
                    category.borderClass
                  )}
                >
                  {t(`listingDetail.category.${category.id}`)}
                </span>
              )}
              {typeof item.rating === 'number' && item.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-meta font-semibold text-warn tabular-nums">
                  <Star size={16} fill="currentColor" aria-hidden="true" />
                  {item.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h1 className="flex flex-wrap items-center gap-2 font-display text-display font-bold text-ink">
              {item.name}
              {isListingSealVisible(item) && <VerifiedSealButton size="md" />}
            </h1>
            {locationLabel && (
              <p className="flex items-center gap-1.5 text-meta text-ink-muted">
                <MapPin size={16} aria-hidden="true" />
                {locationLabel}
              </p>
            )}
            {item.description && (
              <p className="pt-1 text-body text-ink whitespace-pre-line">{item.description}</p>
            )}
          </header>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
