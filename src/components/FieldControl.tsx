import { joinDateTime, splitDateTime } from '../forms/datetime';
import type { FieldDef, Value } from '../forms/types';
import { MultiSelect } from './MultiSelect';
import { RichText } from './RichText';
import { Select } from './Select';

/** O controle de entrada de um campo, escolhido pelo tipo. O id do elemento é `f-<campo>`. */
export function FieldControl({ field, value, onChange, invalid }: {
  field: FieldDef; value: Value | undefined; onChange: (v: Value) => void; invalid: boolean;
}) {
  const id = `f-${field.id}`;
  const str = typeof value === 'string' ? value : '';
  const inputClass = `wz-input${invalid ? ' wz-input--invalid' : ''}`;
  const boxStyle = invalid ? { borderColor: 'var(--wiise-red-strong)' } : undefined;

  switch (field.kind) {
    case 'text':
      return <input id={id} className={inputClass} value={str} maxLength={255} placeholder={field.placeholder}
        aria-invalid={invalid} aria-required={field.required} onChange={(e) => onChange(e.target.value)} />;
    case 'textarea':
      return (
        <div className="wz-textarea" style={boxStyle}>
          <textarea id={id} value={str} placeholder={field.placeholder} aria-invalid={invalid}
            aria-required={field.required} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'richtext':
      return <RichText id={id} value={str} onChange={onChange} placeholder={field.placeholder} invalid={invalid} required={field.required} />;
    case 'code':
      return (
        <div className="wz-textarea wz-textarea--code" style={boxStyle}>
          <textarea id={id} value={str} spellCheck={false} aria-invalid={invalid} aria-required={field.required}
            onChange={(e) => onChange(e.target.value)} />
        </div>
      );
    case 'select':
      return <Select id={id} value={str} options={field.options ?? []} onChange={onChange} invalid={invalid} required={field.required} />;
    case 'multiselect':
      return <MultiSelect id={id} value={Array.isArray(value) ? value : []} options={field.options ?? []} onChange={onChange} invalid={invalid} />;
    case 'date':
      return <input id={id} type="date" className={`${inputClass} wz-input--date`} value={str}
        aria-invalid={invalid} aria-required={field.required} onChange={(e) => onChange(e.target.value)} />;
    case 'datetime': {
      const { date, time } = splitDateTime(str);
      return (
        <div className="wz-datetime">
          <input id={id} type="date" className={inputClass} value={date} aria-invalid={invalid} aria-required={field.required}
            onChange={(e) => onChange(joinDateTime(e.target.value, time))} />
          <input type="time" className={inputClass} value={time} aria-label={`${field.label}: horário`} aria-invalid={invalid}
            aria-required={field.required} onChange={(e) => onChange(joinDateTime(date, e.target.value))} />
        </div>
      );
    }
  }
}
