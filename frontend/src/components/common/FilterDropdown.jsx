export default function FilterDropdown({
  value,
  onChange,
  options = [],
  placeholder = "All",
  ariaLabel,
}) {
  return (
    <select
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel || placeholder}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
