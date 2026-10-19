import { CalendarClock } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import type { EventSessionsFieldProps, EventSessionsLoadState } from '../../events';
import type { PartnerBusiness } from '../types/partner';
import type { PartnerContentEditorState } from '../types/partnerContent';
import { EventBasicsSection } from './event/EventBasicsSection';
import { EventContactSection } from './event/EventContactSection';
import { EventEntrySection } from './event/EventEntrySection';
import { EventPhotosSection } from './event/EventPhotosSection';

interface PartnerEventFormProps {
  item: PartnerContentEditorState;
  onChange: (updatedItem: PartnerContentEditorState) => void;
  isUploading: boolean;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  businesses?: PartnerBusiness[];
  sessionsLoadState: EventSessionsLoadState;
  /** Campo de sessões do domínio events, montado pela composição do app. */
  renderSessionsField?: (props: EventSessionsFieldProps) => ReactNode;
  renderEventTicketingManager?: (eventListingId: string) => ReactNode;
}

export function PartnerEventForm({
  item,
  onChange,
  isUploading,
  onImageUpload,
  businesses,
  sessionsLoadState,
  renderSessionsField,
  renderEventTicketingManager,
}: PartnerEventFormProps) {
  return (
    <div className="flex-1 overflow-y-auto px-8 pb-10 space-y-10 no-scrollbar">
      <EventBasicsSection item={item} onChange={onChange} businesses={businesses} />

      <div className="space-y-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-400">
            <CalendarClock size={18} aria-hidden="true" />
          </span>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">
            Datas e capacidade
          </h3>
        </div>

        {renderSessionsField?.({
          sessions: item.sessions ?? [],
          onChange: (sessions) => onChange({ ...item, sessions }),
          loadState: sessionsLoadState,
        })}
      </div>

      <EventEntrySection
        item={item}
        onChange={onChange}
        renderEventTicketingManager={renderEventTicketingManager}
      />
      <EventContactSection item={item} onChange={onChange} />
      <EventPhotosSection
        item={item}
        onChange={onChange}
        isUploading={isUploading}
        onImageUpload={onImageUpload}
      />
    </div>
  );
}
