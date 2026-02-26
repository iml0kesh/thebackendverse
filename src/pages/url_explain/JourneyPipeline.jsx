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

export const JourneyPipeline = ({ started, activeStep, setActiveStep, parsed }) => {
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

  return (
    <section className="journey-pipeline">
      <h2 className="section-title">
        The Full Journey
        {started && (
          <span className="journey-live">● Live</span>
        )}
      </h2>

      <div className="phase-groups">
        {groupedPhases.map(({ phase, steps }) => (
          <div key={phase} className="phase-group">
            <div
              className="phase-label"
              style={{ color: PHASE_COLORS[phase] }}
            >
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
                  {index < STEPS.length - 1 && index === Math.max(...steps.map(s => s.index)) && (
                    <span className="phase-arrow">→</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pipeline-linear">
        {STEPS.map((step, i) => (
          <span key={step.id}>
            <button
              className={`pipeline-dot ${i <= revealedUpTo ? "dot-revealed" : ""} ${activeStep === i ? "dot-active" : ""}`}
              style={{ "--step-color": PHASE_COLORS[step.phase] }}
              onClick={() => setActiveStep(activeStep === i ? null : i)}
              disabled={i > revealedUpTo}
              title={step.label}
            />
            {i < STEPS.length - 1 && (
              <span className={`pipeline-line ${i < revealedUpTo ? "line-active" : ""}`} />
            )}
          </span>
        ))}
      </div>
      <p className="pipeline-hint">
        {started
          ? "Click any node above for a deep dive into that step"
          : "Initializing journey visualization..."}
      </p>
    </section>
  );
}
