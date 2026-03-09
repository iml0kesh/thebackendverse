import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { JourneyHero } from "./JourneyHero";
import { JourneyPipeline } from "./JourneyPipeline";
import { StepExplainer } from "./StepExplainer";
import { StatsBanner } from "./StatsBanner";

export const JourneyLayout = ({
  title,
  subtitle,
  breadcrumb,
  chips,
  stats,
  steps,
  phaseColors,
  details,
}) => {
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

  return (
    <main>
      <Helmet>
        <title>{title} - thebackendverse</title>
        <meta name="description" content={subtitle} />
      </Helmet>
      <JourneyHero
        title={title}
        subtitle={subtitle}
        onStart={handleStart}
        chips={chips}
        breadcrumb={breadcrumb}
      />

      {started && (
        <div className={`results ${animating ? "fade-in" : "visible"}`}>
          <StatsBanner stats={stats} />

          <JourneyPipeline
            steps={steps}
            phaseColors={phaseColors}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={steps}
            details={details}
            stepIndex={activeStep}
          />
        </div>
      )}
    </main>
  );
};
