import React, { useState } from "react";

import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";
import { StatsBanner } from "../../components/journey-engine/StatsBanner";

import { OAUTH_STEPS, OAUTH_PHASE_COLORS } from "./oauthSteps";
import { OAUTH_STEP_DETAILS } from "./oauthDetails";

export const OauthJourneyPage = () => {
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
    <main className="oauth-journey">
      <JourneyHero
        title='How OAuth & "Sign in with Google" works'
        subtitle="Authorization codes, access tokens, refresh tokens — the complete flow."
        onStart={handleStart}
        chips={["Google", "GitHub", "Okta", "Auth0"]}
        breadcrumb="Auth & Security"
      />

      {started && (
        <>
          {/* <div className={`results ${animating ? "fade-in" : "visible"}`}>
            <StatsBanner stats={stats} />
          </div> */}

          <JourneyPipeline
            steps={OAUTH_STEPS}
            phaseColors={OAUTH_PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />

          <StepExplainer
            steps={OAUTH_STEPS}
            details={OAUTH_STEP_DETAILS}
            stepIndex={activeStep}
          />
        </>
      )}
    </main>
  );
};
