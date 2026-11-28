import { GuideItem } from '../../guide';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: GuideItem) => void;
}
