import "../styles/FormField.css";

type Props = {
  id: string;
  label: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  pattern?: string;
  title?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hint?: string;   // texto informativo
  error?: string;  // texto de error
};

export default function FormField({
  id, label, type = "text", placeholder, required,
  minLength, pattern, title, value, onChange, hint, error
}: Props) {
  return (
    <div className={`formfield ${error ? "formfield--error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        pattern={pattern}
        title={title}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <div id={`${id}-hint`} className="formfield__hint">{hint}</div>}
      {error && <div className="formfield__error">{error}</div>}
    </div>
  );
}