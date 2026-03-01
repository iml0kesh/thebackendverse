export const StepExplainer = ({ steps, details, stepIndex, parsed }) => {
  const detail = details[stepIndex];
  const step = steps[stepIndex];

  if (!detail) return null;

  return (
    <section className="step-explainer">
      <div className="explainer-header">
        <span className="explainer-icon">{step.icon}</span>
        <div>
          <span className="explainer-phase">{detail.phase}</span>
          <h2 className="explainer-title">{detail.title}</h2>
        </div>
      </div>

      <p className="explainer-summary">{detail.summary}</p>

      <div className="explainer-body">
        <div className="explainer-technical">
          <h3>Technical Details</h3>
          <ul>
            {detail.technical.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="explainer-code">
          <h3>Code</h3>
          <pre>
            <code>{detail.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
