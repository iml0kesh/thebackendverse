import { useState } from "react";
import { StepView } from "./StepView";
import { generateSteps } from "./generateSteps";
import "./urlJourney.css";

export const UrlJourney = ({ setPage }) => {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [current, setCurrent] = useState(0);

  const startJourney = () => {
    if (!input) return;
    const generated = generateSteps(input);
    setSteps(generated);
    setCurrent(0);
  };

  const step = steps[current];
  const progress = steps.length > 0 ? ((current + 1) / steps.length) * 100 : 0;

  return (
    <div className="container">
      <div className="top-bar">
        <button className="back-btn" onClick={() => setPage("home")}>
          Back
        </button>
        <h1 className="title">URL Journey</h1>
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Enter a domain (example: google.com)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="start-btn" onClick={startJourney}>
          Start
        </button>
      </div>

      {/* Progress Bar */}
      {steps.length > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Network Flow */}
      {steps.length > 0 && (
        <div className="network">
          <div
            className={`node ${step.highlight === "browser" ? "active" : ""}`}
          >
            Browser
          </div>

          <div className="line">
            {step.highlight === "dns" && <div className="packet" />}
          </div>

          <div
            className={`node ${step.highlight === "browser" ? "active" : ""}`}
          >
            Browser
          </div>

          <div className="line">
            {step.highlight === "dns" && <div className="packet" />}
          </div>

          <div className={`node ${step.highlight === "dns" ? "active" : ""}`}>
            DNS
          </div>

          <div className="line">
            {step.highlight === "server" && <div className="packet" />}
          </div>

          <div
            className={`node ${step.highlight === "server" ? "active" : ""}`}
          >
            Server
          </div>
        </div>
      )}

      {step && <StepView step={step} />}

      {steps.length > 0 && (
        <div className="nav">
          <button
            onClick={() => setCurrent((c) => c - 1)}
            disabled={current === 0}
          >
            Previous
          </button>

          <button
            onClick={() => setCurrent((c) => c + 1)}
            disabled={current === steps.length - 1}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
