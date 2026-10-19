import { GuideItem } from '../../../guide';
import { ErrorState } from '../../../../ui/components/ErrorState';
import { AdminItemGrid } from './AdminItemGrid';

interface CategoryItem {
  id: string;
  label: string;
  color: string;
}

interface AdminGuideViewProps {
  activeTab: 'items' | 'events';
  categories: CategoryItem[];
  filter: string;
  setFilter: (id: string) => void;
  filteredItems: GuideItem[];
  dataLoading: boolean;
  dataError: string | null;
  onRetry: () => void;
  onInitNew: () => void;
  onInitNewTip?: () => void;
  onEdit: (item: GuideItem) => void;
  onDelete: (coll: string, id: string) => Promise<void>;
}

export function AdminGuideView({
  activeTab,
  categories,
  filter,
  setFilter,
  filteredItems,
  dataLoading,
  dataError,
  onRetry,
  onInitNew,
  onInitNewTip,
  onEdit,
  onDelete,
}: AdminGuideViewProps) {
  if (dataError) {
    return (
      <div className="py-6">
        <ErrorState message={dataError} onRetry={onRetry} />
      </div>
    );
  }

  return (
    <AdminItemGrid
      activeTab={activeTab}
      categories={categories}
      filter={filter}
      setFilter={setFilter}
      filteredItems={filteredItems}
      dataLoading={dataLoading}
      onInitNew={onInitNew}
      onInitNewTip={onInitNewTip}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}
