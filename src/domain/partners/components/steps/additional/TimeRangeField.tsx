import { SIGNUP_INPUT, SIGNUP_LABEL } from '../../sections/signupStyles';

/** Duas horas lado a lado ("das … até …", "abre … fecha …"). */
export function TimeRangeField({
  id,
  label,
  fromLabel,
  toLabel,
  from,
  to,
  onFrom,
  onTo,
}: {
  id: string;
  label?: string;
  fromLabel: string;
  toLabel: string;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  return (
    <fieldset>
      {label ? <legend className={SIGNUP_LABEL}>{label}</legend> : null}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor={`${id}-from`} className="block mb-1 px-1 text-[13px] text-ink/70">
            {fromLabel}
          </label>
          <input
            id={`${id}-from`}
            type="time"
            value={from}
            onChange={(e) => onFrom(e.target.value)}
            className={SIGNUP_INPUT}
          />
        </div>
        <div>
          <label htmlFor={`${id}-to`} className="block mb-1 px-1 text-[13px] text-ink/70">
            {toLabel}
          </label>
          <input
            id={`${id}-to`}
            type="time"
            value={to}
            onChange={(e) => onTo(e.target.value)}
            className={SIGNUP_INPUT}
          />
        </div>
      </div>
    </fieldset>
  );
}
