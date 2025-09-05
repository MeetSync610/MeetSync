import "../styles/SearchBar.css";
//user search icon
type Props = {
  placeholder?: string;
  onChange?: (value: string) => void;
};

export default function SearchBar({ placeholder =  "Buscar…", onChange }: Props) {
  return (
    <div className="search card-like">
      <input
        type="text"
        className="search__input"
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}