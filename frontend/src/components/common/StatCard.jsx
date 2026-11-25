export default function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {helper && <div className="stat-helper">{helper}</div>}
      </div>
      {Icon && (
        <div className={`stat-icon ${tone}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
