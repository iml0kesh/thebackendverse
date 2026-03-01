export const StatsBanner = ({ stats }) => {
  return (
    <div className="stats-banner">
      {stats.map(({ label, value, color }) => (
        <div key={label}>
          <span style={{ color }}>{value}</span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};
