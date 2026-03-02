export const JourneyHero = ({
  title,
  subtitle,
  onStart,
  chips = [],
  breadcrumb = null,
}) => {
  return (
    <section className="hero">
      {breadcrumb && (
        <div className="hero-breadcrumb">
          <span className="breadcrumb-dot" />
          {breadcrumb}
        </div>
      )}
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <div className="hero-actions">
        <button onClick={onStart}>Start Journey →</button>
        {chips.length > 0 && (
          <div className="hero-chips">
            {chips.map((c) => (
              <span key={c} className="hero-chip">
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
