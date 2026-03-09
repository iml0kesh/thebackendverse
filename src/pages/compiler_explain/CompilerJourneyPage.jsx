import { useState } from "react";

import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";
import { StatsBanner } from "../../components/journey-engine/StatsBanner";

import { COMPILER_STEPS, COMPILER_PHASE_COLORS } from "./compilerSteps";
import { COMPILER_STEP_DETAILS } from "./compilerDetails";

export const CompilerJourneyPage = () => {
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  const stats = [
    { label: "Compiler phases",   value: "3",    color: "#06d6a0" },
    { label: "Optimization passes", value: "100+", color: "#a29bfe" },
    { label: "Lines/sec (GCC)",   value: "1M+",  color: "#ff6b35" },
    { label: "CPU instructions",  value: "~10ns", color: "#ffd166" },
  ];

  return (
    <main>
      <JourneyHero
        title="From Code to Machine Instructions"
        subtitle="How your source text becomes the binary your CPU executes."
        onStart={() => setStarted(true)}
      />

      {started && (
        <>
          <StatsBanner stats={stats} />

          <JourneyPipeline
            steps={COMPILER_STEPS}
            phaseColors={COMPILER_PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={COMPILER_STEPS}
            details={COMPILER_STEP_DETAILS}
            stepIndex={activeStep}
          />
        </>
      )}
    </main>
  );
};
