import { Search, X } from "lucide-react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search by student name or admission number...",
  ariaLabel = "Search students",
}) {
  return (
    <div className="search-input-wrap">
      <Search size={16} className="search-input-icon" />
      <input
        type="text"
        className={`form-control with-left-icon ${value ? "with-right-icon" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
      {value && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
