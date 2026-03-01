export const StepExplainer = ({ steps, details, stepIndex }) => {
  const detail = details[stepIndex];
  const step = steps[stepIndex];

  if (!detail) return null;

  return (
    <section className="step-explainer">
      <div className="explainer-header">
        <span>{step.icon}</span>
        <div>
          <span>{detail.phase}</span>
          <h2>{detail.title}</h2>
        </div>
      </div>

      <p>{detail.summary}</p>

      <div className="explainer-body">
        <div>
          <h3>Technical Details</h3>
          <ul>
            {detail.technical.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Code</h3>
          <pre>
            <code>{detail.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
