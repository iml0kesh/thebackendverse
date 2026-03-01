import { STEPS } from "./JourneyPipeline";

export const StepExplainer = ({ stepIndex, parsed }) => {
  const detail = STEP_DETAILS(parsed)[stepIndex];
  const step = STEPS[stepIndex];
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
          <h3>Code / Commands</h3>
          <pre>
            <code>{detail.code}</code>
          </pre>
        </div>
      </div>
    </section>
  );
};
