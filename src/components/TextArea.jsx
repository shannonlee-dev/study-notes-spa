export default function TextArea({ id, label, value, error, onChange, placeholder = '' }) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        rows={7}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <small id={`${id}-error`} role="alert">
          {error}
        </small>
      ) : null}
    </label>
  );
}
