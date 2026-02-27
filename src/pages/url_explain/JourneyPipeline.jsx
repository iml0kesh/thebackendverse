import { useEffect, useState } from "react";

export const STEPS = [
  { id: "browser", icon: "🌐", label: "Browser", phase: "Client" },
  { id: "cache", icon: "⚡", label: "Cache Check", phase: "Client" },
  { id: "dns", icon: "📡", label: "DNS Lookup", phase: "DNS" },
  { id: "tcp", icon: "🔗", label: "TCP Handshake", phase: "Connection" },
  { id: "tls", icon: "🔒", label: "TLS Handshake", phase: "Connection" },
  { id: "internet", icon: "🌍", label: "Internet", phase: "Network" },
  { id: "loadbalancer", icon: "⚖️", label: "Load Balancer", phase: "Server" },
  { id: "webserver", icon: "🖥️", label: "Web Server", phase: "Server" },
  { id: "appserver", icon: "⚙️", label: "App Server", phase: "Server" },
  { id: "database", icon: "🗄️", label: "Database", phase: "Server" },
  { id: "response", icon: "📦", label: "Response", phase: "Response" },
  { id: "render", icon: "🎨", label: "Browser Render", phase: "Client" },
];

const PHASE_COLORS = {
  Client: "#ffd166",
  DNS: "#06d6a0",
  Connection: "#118ab2",
  Network: "#a29bfe",
  Server: "#ff6b35",
  Response: "#fd79a8",
};

export const JourneyPipeline = ({ started, activeStep, setActiveStep }) => {
  const [revealedUpTo, setRevealedUpTo] = useState(-1);

  useEffect(() => {
    if (!started) {
      setRevealedUpTo(-1);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      setRevealedUpTo((prev) => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
      i++;
      if (i >= STEPS.length) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [started]);

  const groupedPhases = [];
  let currentPhase = null;
  STEPS.forEach((step, i) => {
    if (step.phase !== currentPhase) {
      currentPhase = step.phase;
      groupedPhases.push({ phase: step.phase, steps: [] });
    }
    groupedPhases[groupedPhases.length - 1].steps.push({ ...step, index: i });
  });

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
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
          <div key={phase} className="phase-group">
            <div className="phase-label" style={{ color: PHASE_COLORS[phase] }}>
              {phase}
            </div>
            <div className="phase-steps">
              {steps.map(({ id, icon, label, index }) => (
                <button
                  key={id}
                  className={`step-node ${
                    index <= revealedUpTo ? "revealed" : "hidden"
                  } ${activeStep === index ? "active" : ""}`}
                  style={{
                    "--step-color": PHASE_COLORS[phase],
                    animationDelay: `${index * 0.05}s`,
                  }}
                  onClick={() =>
                    setActiveStep(activeStep === index ? null : index)
                  }
                  disabled={index > revealedUpTo}
                >
                  <span className="step-icon">{icon}</span>
                  <span className="step-label">{label}</span>
                  {index < STEPS.length - 1 &&
                    index === Math.max(...steps.map((s) => s.index)) && (
                      <span className="phase-arrow">→</span>
                    )}
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
            Step {activeStep + 1} of {STEPS.length}
          </span>

          <button
            onClick={handleNext}
            disabled={activeStep === STEPS.length - 1}
            className="nav-btn next"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
};
