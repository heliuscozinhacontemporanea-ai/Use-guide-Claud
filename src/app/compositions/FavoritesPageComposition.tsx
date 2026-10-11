import { FavoritesList } from '../../domain/favorites';
import type { GuideItem } from '../../domain/guide';
import { useLocalizedRouting } from '../../shared/hooks/useLocalizedRouting';

interface FavoritesPageCompositionProps {
  onSelectItem: (item: GuideItem) => void;
}

export function FavoritesPageComposition({ onSelectItem }: FavoritesPageCompositionProps) {
  const { goTo } = useLocalizedRouting();
  return (
    <div className="px-4 pb-32">
      <FavoritesList onBack={() => goTo('explore')} onSelectItem={onSelectItem} />
    </div>
  );
}
