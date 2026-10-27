import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateSlotsPayload } from '../../types/bookings';
import { fortalezaInputToIso } from '../../utils/dates';
import { BUTTON_PRIMARY, BUTTON_SECONDARY, INPUT } from '../../../../ui/styles/controls';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

interface SlotCreationFormProps {
  onCreate: (payload: CreateSlotsPayload) => Promise<void>;
}

/** Monta o pedido de criação; datas e horas digitadas são do fuso de Fortaleza. */
export function buildSlotsPayload(state: {
  mode: 'recurrence' | 'list';
  capacity: string;
  startDate: string;
  endDate: string;
  weekdays: number[];
  times: string;
  single: string;
}): CreateSlotsPayload | null {
  const capacity = Number(state.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) return null;
  if (state.mode === 'list') {
    const startsAt = fortalezaInputToIso(state.single);
    return startsAt ? { mode: 'list', capacity, slots: [{ startsAt }] } : null;
  }
  const times = state.times
    .split(',')
    .map((time) => time.trim())
    .filter(Boolean);
  if (!state.startDate || !state.endDate || state.weekdays.length === 0 || times.length === 0)
    return null;
  if (times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return null;
  return {
    mode: 'recurrence',
    capacity,
    startDate: state.startDate,
    endDate: state.endDate,
    weekdays: [...state.weekdays].sort(),
    times,
  };
}

export function SlotCreationForm({ onCreate }: SlotCreationFormProps) {
  const { t } = useTranslation();
  const [state, setState] = useState({
    mode: 'recurrence' as 'recurrence' | 'list',
    capacity: '10',
    startDate: '',
    endDate: '',
    weekdays: [] as number[],
    times: '08:00',
    single: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const payload = buildSlotsPayload(state);

  const toggleWeekday = (day: number) =>
    setState((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((value) => value !== day)
        : [...current.weekdays, day],
    }));

  return (
    <form
      className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!payload) return;
        setSubmitting(true);
        try {
          await onCreate(payload);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <h4 className="text-sm font-bold text-white">{t('bookings.slots.createTitle')}</h4>
      <div role="radiogroup" className="flex gap-2">
        {(['recurrence', 'list'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={state.mode === mode}
            onClick={() => setState((current) => ({ ...current, mode }))}
            className={`${BUTTON_SECONDARY} ${state.mode === mode ? 'ring-2 ring-teal-400/60' : ''}`}
          >
            {mode === 'recurrence'
              ? t('bookings.slots.modeRecurrence')
              : t('bookings.slots.modeSingle')}
          </button>
        ))}
      </div>
      {state.mode === 'recurrence' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.slots.startDate')}</span>
              <input
                type="date"
                value={state.startDate}
                onChange={(e) => setState({ ...state, startDate: e.target.value })}
                className={INPUT}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-white/70">{t('bookings.slots.endDate')}</span>
              <input
                type="date"
                value={state.endDate}
                onChange={(e) => setState({ ...state, endDate: e.target.value })}
                className={INPUT}
              />
            </label>
          </div>
          <fieldset>
            <legend className="text-xs text-white/70 mb-1">{t('bookings.slots.weekdays')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={state.weekdays.includes(day)}
                  onClick={() => toggleWeekday(day)}
                  className={`min-h-11 min-w-11 rounded-xl text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400/50 ${
                    state.weekdays.includes(day)
                      ? 'bg-teal-500/25 text-teal-100'
                      : 'bg-white/5 text-white/70'
                  }`}
                >
                  {t(`bookings.weekdays.${day}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-xs text-white/70">{t('bookings.slots.times')}</span>
            <input
              value={state.times}
              onChange={(e) => setState({ ...state, times: e.target.value })}
              className={INPUT}
            />
          </label>
        </>
      ) : (
        <label className="block space-y-1">
          <span className="text-xs text-white/70">{t('bookings.slots.singleDateTime')}</span>
          <input
            type="datetime-local"
            value={state.single}
            onChange={(e) => setState({ ...state, single: e.target.value })}
            className={INPUT}
          />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-xs text-white/70">{t('bookings.slots.capacityLabel')}</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={state.capacity}
          onChange={(e) => setState({ ...state, capacity: e.target.value })}
          className={INPUT}
        />
      </label>
      <p className="text-xs text-white/60">{t('bookings.slots.timezoneNotice')}</p>
      <button type="submit" disabled={!payload || submitting} className={BUTTON_PRIMARY}>
        {t('bookings.slots.create')}
      </button>
    </form>
  );
}
