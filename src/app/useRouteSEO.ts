import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { GuideItem } from '../domain/guide';
import { useSEO } from '../shared/hooks/useSEO';

// Nome próprio: não é traduzido (AGENTS.md §12.3).
const DEFAULT_PLACE = 'Jericoacoara';

/** Título e descrição das camadas abertas por cima da rota (anúncio, painel do admin, seja parceiro). */
export function useRouteSEO({
  selectedItem,
  isAdminOpen,
  isPartnersOpen,
}: {
  selectedItem: GuideItem | null;
  isAdminOpen: boolean;
  isPartnersOpen: boolean;
}) {
  const { t } = useTranslation();
  const metadata = useMemo(() => {
    if (selectedItem) {
      return {
        title: t('seo.item.title', {
          name: selectedItem.name,
          place: selectedItem.location || DEFAULT_PLACE,
        }),
        description:
          selectedItem.description || t('seo.item.description', { name: selectedItem.name }),
        image: selectedItem.image,
        type: (selectedItem.category === 'event' ? 'event' : 'place') as 'event' | 'place',
        keywords:
          selectedItem.tags && selectedItem.tags.length > 0
            ? selectedItem.tags
            : [selectedItem.name, selectedItem.location, selectedItem.category, DEFAULT_PLACE],
      };
    }
    if (isAdminOpen) {
      return {
        title: t('seo.admin.title'),
        description: t('seo.admin.description'),
        robots: 'noindex, nofollow',
      };
    }
    if (isPartnersOpen) {
      return { title: t('seo.partners.title'), description: t('seo.partners.description') };
    }
    return undefined;
  }, [selectedItem, isAdminOpen, isPartnersOpen, t]);

  useSEO(metadata);
}
