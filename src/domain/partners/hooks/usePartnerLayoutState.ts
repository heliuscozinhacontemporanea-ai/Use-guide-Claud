import { useState } from 'react';
import type { PartnerContentEditorState } from '../types/partnerContent';

export function usePartnerLayoutState() {
  const [activeTab, setActiveTab] = useState<'items' | 'events'>('items');
  const [isEditing, setIsEditing] = useState<PartnerContentEditorState | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return {
    activeTab,
    setActiveTab,
    isEditing,
    setIsEditing,
    showDeleteConfirm,
    setShowDeleteConfirm,
  };
}
