import type { EventSessionsTranslation } from './eventSessionsResources';

export const eventSessionsEn: EventSessionsTranslation = {
  loading: 'Loading the event sessions…',
  loadError: 'Could not load this event’s sessions. Close and reopen the editor before saving.',
  title: 'Event sessions',
  add: 'Add date',
  session: 'Session {{n}}',
  remove: 'Remove {{session}}',
  startsAt: 'Start',
  endsAt: 'End',
  capacity: 'Maximum capacity',
  salesEndsAt: 'App sales until',
  salesEndsHint:
    'We suggest 2 h before the start. After that time, the offline entrance list can be prepared.',
  lotDates: {
    button: 'Sale dates',
    buttonAria: 'Sale dates for tier {{name}}',
    title: 'Sale dates · {{name}}',
    hint: 'Time at the event location. With no start, the tier sells right away; with no end, it sells until the session stops selling.',
    startsAt: 'Sales start',
    endsAt: 'Sales end',
    clear: 'Clear',
    save: 'Save dates',
    saving: 'Saving…',
    saved: 'Tier sale dates updated.',
    orderError: 'Sales must end after they start.',
    saveError: 'Could not save the dates. Try again.',
    summary: 'Sales: {{from}} to {{to}}',
    fromNow: 'right away',
    untilSession: 'the end of session sales',
  },
};
