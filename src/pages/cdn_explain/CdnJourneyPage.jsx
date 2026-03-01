import { useState } from "react";

import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";
import { StatsBanner } from "../../components/journey-engine/StatsBanner";

import { CDN_STEPS, CDN_PHASE_COLORS } from "./cdnSteps";
import { CDN_STEP_DETAILS } from "./cdnDetails";

export const CdnJourneyPage = () => {
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
    { label: "Cloudflare PoPs", value: "300+", color: "#ff6b35" },
    { label: "Akamai PoPs", value: "4,000+", color: "#06d6a0" },
    {
      label: "Typical cache hit ratio",
      value: "90–95%",
      color: "#118ab2",
    },
    {
      label: "Latency reduction",
      value: "10–50×",
      color: "#a29bfe",
    },
  ];

  return (
    <main>
      <JourneyHero
        title="How a CDN Actually Works"
        subtitle="A Content Delivery Network serves files from servers physically near you — turning 200ms round trips into 8ms."
        onStart={handleStart}
        chips={["Cloudflare", "AWS CloudFront", "Fastly", "Akamai"]}
      />

      {started && (
        <>
          <div className={`results ${animating ? "fade-in" : "visible"}`}>
            <StatsBanner stats={stats} />
          </div>

          <JourneyPipeline
            steps={CDN_STEPS}
            phaseColors={CDN_PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={CDN_STEPS}
            details={CDN_STEP_DETAILS}
            stepIndex={activeStep}
          />
        </>
      )}
    </main>
  );
};
