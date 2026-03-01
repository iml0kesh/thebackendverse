import { useState } from "react";
import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";
import { StatsBanner } from "../../components/journey-engine/StatsBanner";

import { CDN_STEPS, PHASE_COLORS } from "./cdnSteps";
import { STEP_DETAILS } from "./cdnDetails";

export const CdnJourneyPage = () => {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const stats = [
    { label: "Cloudflare PoPs", value: "300+", color: "#ff6b35" },
    { label: "Akamai PoPs", value: "4,000+", color: "#06d6a0" },
    { label: "Cache hit ratio", value: "90–95%", color: "#118ab2" },
    { label: "Latency reduction", value: "10–50×", color: "#a29bfe" },
  ];

  return (
    <main>
      <JourneyHero
        title="How a CDN Actually Works"
        subtitle="From user request to edge delivery."
        onStart={() => setStarted(true)}
      />

      {started && (
        <>
          <StatsBanner stats={stats} />

          <JourneyPipeline
            steps={CDN_STEPS}
            phaseColors={PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={CDN_STEPS}
            details={STEP_DETAILS}
            stepIndex={activeStep}
          />
        </>
      )}
    </main>
  );
};
