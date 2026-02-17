import "./urlJourney.css";

export const StepView = ({ step }) => {
  return (
    <div className="step-layout">
      {/* LEFT: Explanation */}
      <div className="explain-box">
        <div className="component-header">
          <span className="component-name">{step.component}</span>
          <span className="component-title">{step.title}</span>
        </div>

        <div className="story">
          {step.explanation.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>

        <button className="learn-btn">
          Learn more about {step.learnTopic}
        </button>
      </div>

      {/* RIGHT: Terminal */}
      <div className="terminal-box">
        <div className="terminal-header">{step.terminalTitle}</div>

        <pre className="terminal-content">
          {JSON.stringify(step.terminal, null, 2)}
        </pre>
      </div>
    </div>
  );
};
