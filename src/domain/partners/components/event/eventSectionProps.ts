import type { PartnerContentEditorState } from '../../types/partnerContent';

export interface EventSectionProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
}

/** Atualiza um campo do evento em edição mantendo os demais. */
export function updateEventField<K extends keyof PartnerContentEditorState>(
  { item, onChange }: EventSectionProps,
  field: K,
  value: PartnerContentEditorState[K]
): void {
  onChange({ ...item, [field]: value });
}
