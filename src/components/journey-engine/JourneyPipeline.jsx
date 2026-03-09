import { useEffect, useState } from "react";

export const JourneyPipeline = ({
  steps,
  phaseColors,
  started,
  activeStep,
  setActiveStep,
}) => {
  const [revealedUpTo, setRevealedUpTo] = useState(-1);

  useEffect(() => {
    if (!started) {
      setRevealedUpTo(-1);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setRevealedUpTo((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      i++;
      if (i >= steps.length) clearInterval(interval);
    }, 220);

    return () => clearInterval(interval);
  }, [started, steps.length]);

  const groupedPhases = [];
  let currentPhase = null;

  steps.forEach((step, i) => {
    if (step.phase !== currentPhase) {
      currentPhase = step.phase;
      groupedPhases.push({ phase: step.phase, steps: [] });
    }
    groupedPhases[groupedPhases.length - 1].steps.push({ ...step, index: i });
  });

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <section className="journey-pipeline">
      <h2 className="section-title">
        The Full Journey
        {started && <span className="journey-live">● Live</span>}
      </h2>
      <div className="phase-groups">
        {groupedPhases.map(({ phase, steps }) => (
          <div key={`${phase}-${steps[0].index}`} className="phase-group">
            <div className="phase-label" style={{ color: phaseColors[phase] }}>
              {phase}
            </div>

            <div className="phase-steps">
              {steps.map(({ id, icon, label, index }) => (
                <button
                  key={`${id}-${index}`}
                  className={`step-node ${index <= revealedUpTo ? "revealed" : "hidden"} ${activeStep === index ? "active" : ""}`}
                  style={{ "--step-color": phaseColors[phase] }}
                  onClick={() =>
                    setActiveStep(activeStep === index ? null : index)
                  }
                  disabled={index > revealedUpTo}
                >
                  <span className="step-icon">{icon}</span>
                  <span className="step-label">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {activeStep === null ? (
        <div className="pipeline-hint">
          Click any node above for a deep dive into that step
        </div>
      ) : (
        <div className="step-navigation">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="nav-btn prev"
          >
            ← Previous
          </button>

          <span className="step-indicator">
            Step {activeStep + 1} of {steps.length}
          </span>

          <button
            onClick={handleNext}
            disabled={activeStep === steps.length - 1}
            className="nav-btn next"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
};
