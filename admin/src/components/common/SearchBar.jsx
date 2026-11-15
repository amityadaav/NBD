import { Search, X } from "lucide-react";
import "./SearchBar.css";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className = "",
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: "" } }); // Simulate event for compatibility
    }
  };

  return (
    <div className={`sb-container ${className}`}>
      <Search size={17} className="sb-icon" />
      <input
        type="text"
        className="sb-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="sb-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}