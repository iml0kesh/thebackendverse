import { useState } from "react";

import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";
import { StatsBanner } from "../../components/journey-engine/StatsBanner";

import { OSI_STEPS, OSI_PHASE_COLORS } from "./osiSteps";
import { OSI_STEP_DETAILS } from "./osiDetails";

export const OsiJourneyPage = () => {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [animating, setAnimating] = useState(false);

  const handleStart = () => {
    setStarted(false);
    setActiveStep(null);
    setAnimating(true);

    setTimeout(() => {
      setStarted(true);
      setAnimating(false);
    }, 400);
  };

  const stats = [
    { label: "Layers", value: "7", color: "#ff6b35" },
    { label: "Model Type", value: "Conceptual", color: "#ffd166" },
    { label: "Standard", value: "ISO/IEC", color: "#06d6a0" },
    { label: "Year", value: "1984", color: "#118ab2" },
  ];

  return (
    <main>
      <JourneyHero
        title="The OSI Model"
        subtitle="The 7 layers of networking. How data travels from your screen to the wire."
        onStart={handleStart}
        chips={["Application", "Transport", "Network", "Physical"]}
        breadcrumb="Networking Fundamentals"
      />

      {started && (
        <div className={`results ${animating ? "fade-in" : "visible"}`}>
          <StatsBanner stats={stats} />

          <JourneyPipeline
            steps={OSI_STEPS}
            phaseColors={OSI_PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={OSI_STEPS}
            details={OSI_STEP_DETAILS}
            stepIndex={activeStep}
          />
        </div>
      )}
    </main>
  );
};
