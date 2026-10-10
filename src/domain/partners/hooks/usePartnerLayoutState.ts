import { useState } from 'react';
import type { PartnerContentEditorState } from '../types/partnerContent';

export function usePartnerLayoutState() {
  const [activeTab, setActiveTab] =
    useState<'items' | 'events' | 'reports'>('items');

  const [isSelectingCategory, setIsSelectingCategory] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState<PartnerContentEditorState | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [currentStep, setCurrentStep] =
    useState(1);

  return {
    activeTab,
    setActiveTab,
    isSelectingCategory,
    setIsSelectingCategory,
    isEditing,
    setIsEditing,
    showDeleteConfirm,
    setShowDeleteConfirm,
    currentStep,
    setCurrentStep,
  };
}
