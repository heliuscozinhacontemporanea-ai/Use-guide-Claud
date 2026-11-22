import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../../shared/utils/cn';
import { SegmentedControl } from '../../../../ui/components/SegmentedControl';
import { INPUT } from '../../../../ui/styles/controls';
import type { CreateSlotsPayload } from '../../types/bookings';
import { getBookingErrorMessage } from '../../utils/bookingErrorMessage';
import { endOfNextMonth, placeInputToIso } from '../../utils/dates';

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

interface SlotCreationFormProps {
  /** Hoje na hora do lugar ("AAAA-MM-DD"): as datas já vêm de hoje ao fim do mês seguinte. */
  today: string;
  /** O "Criar" fica na barra da página (protótipo da F3, tela 9). */
  registerSave: (save: (() => void) | null) => void;
  onCreate: (payload: CreateSlotsPayload) => Promise<void>;
  /** Fuso da oferta; a recorrência é expandida no servidor com o mesmo fuso (D28). */
  timeZone?: string;
}

/** Monta o pedido de criação; datas e horas digitadas são da hora do lugar. */
export function buildSlotsPayload(
  state: {
    mode: 'recurrence' | 'list';
    capacity: string;
    startDate: string;
    endDate: string;
    weekdays: number[];
    times: string;
    single: string;
  },
  timeZone?: string
): CreateSlotsPayload | null {
  const capacity = Number(state.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) return null;
  if (state.mode === 'list') {
    const startsAt = placeInputToIso(state.single, timeZone);
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

export function SlotCreationForm({
  today,
  registerSave,
  onCreate,
  timeZone,
}: SlotCreationFormProps) {
  const { t } = useTranslation();
  const [state, setState] = useState({
    mode: 'recurrence' as 'recurrence' | 'list',
    capacity: '10',
    startDate: today,
    endDate: endOfNextMonth(today),
    weekdays: [...WEEKDAYS] as number[],
    times: '08:00',
    single: '',
  });
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const payload = buildSlotsPayload(state, timeZone);

  const submit = async () => {
    if (submitting.current) return;
    if (!payload) {
      setError(t('bookings.slots.invalid'));
      return;
    }
    setError(null);
    submitting.current = true;
    try {
      await onCreate(payload);
    } catch (err: unknown) {
      setError(getBookingErrorMessage(err));
    } finally {
      submitting.current = false;
    }
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    registerSave(() => void submitRef.current());
    return () => registerSave(null);
  }, [registerSave]);

  const toggleWeekday = (day: number) =>
    setState((current) => ({
      ...current,
      weekdays: current.weekdays.includes(day)
        ? current.weekdays.filter((value) => value !== day)
        : [...current.weekdays, day],
    }));

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <SegmentedControl<'recurrence' | 'list'>
        label={t('bookings.slots.open')}
        value={state.mode}
        onChange={(mode) => setState((current) => ({ ...current, mode }))}
        options={[
          { value: 'recurrence', label: t('bookings.slots.modeRecurrence') },
          { value: 'list', label: t('bookings.slots.modeSingle') },
        ]}
      />
      {state.mode === 'recurrence' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1">
              <span className="text-xs text-ink/70">{t('bookings.slots.startDate')}</span>
              <input
                type="date"
                min={today}
                value={state.startDate}
                onChange={(e) => setState({ ...state, startDate: e.target.value })}
                className={INPUT}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-ink/70">{t('bookings.slots.endDate')}</span>
              <input
                type="date"
                min={state.startDate}
                value={state.endDate}
                onChange={(e) => setState({ ...state, endDate: e.target.value })}
                className={INPUT}
              />
            </label>
          </div>
          <fieldset>
            <legend className="mb-1 text-xs text-ink/70">{t('bookings.slots.weekdays')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  aria-pressed={state.weekdays.includes(day)}
                  onClick={() => toggleWeekday(day)}
                  className={cn(
                    'press min-h-11 min-w-11 rounded-xl px-2 text-xs font-bold focus-visible:ring-2 focus-visible:ring-teal-400/50',
                    state.weekdays.includes(day)
                      ? 'bg-partner-soft text-partner'
                      : 'bg-ink/[0.06] text-ink/70'
                  )}
                >
                  {t(`bookings.weekdays.${day}`)}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block space-y-1">
            <span className="text-xs text-ink/70">{t('bookings.slots.times')}</span>
            <input
              value={state.times}
              onChange={(e) => setState({ ...state, times: e.target.value })}
              className={INPUT}
            />
          </label>
        </>
      ) : (
        <label className="block space-y-1">
          <span className="text-xs text-ink/70">{t('bookings.slots.singleDateTime')}</span>
          <input
            type="datetime-local"
            value={state.single}
            onChange={(e) => setState({ ...state, single: e.target.value })}
            className={INPUT}
          />
        </label>
      )}
      <label className="block space-y-1">
        <span className="text-xs text-ink/70">{t('bookings.slots.capacityLabel')}</span>
        <input
          type="number"
          min={1}
          inputMode="numeric"
          value={state.capacity}
          onChange={(e) => setState({ ...state, capacity: e.target.value })}
          className={INPUT}
        />
      </label>
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
