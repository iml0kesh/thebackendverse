import { useState } from "react";

import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { JourneyPipeline } from "../../components/journey-engine/JourneyPipeline";
import { StepExplainer } from "../../components/journey-engine/StepExplainer";

import { UrlInput } from "./UrlInput";
import { UrlBreakdown } from "./UrlBreakdown";

// import { JourneyPipeline } from "../url_explain/JourneyPipeline";

import { URL_STEPS, URL_PHASE_COLORS } from "./urlSteps";
import { URL_STEP_DETAILS } from "./urlDetails";

const parseUrl = (raw) => {
  try {
    const url = new URL(raw.startsWith("http") ? raw : "https://" + raw);
    const hostParts = url.hostname.split(".");
    let subdomain = "",
      domain = "";
    if (hostParts.length >= 3) {
      subdomain = hostParts.slice(0, -2).join(".");
      domain = hostParts.slice(-2).join(".");
    } else {
      domain = url.hostname;
    }
    return {
      protocol: url.protocol.replace(":", ""),
      subdomain,
      domain,
      path: url.pathname + url.search + url.hash,
      port: url.port || (url.protocol === "https:" ? "443" : "80"),
    };
  } catch {
    return null;
  }
};

export const UrlJourneyPage = () => {
  const [url, setUrl] = useState("");
  const [parsed, setParsed] = useState(null);
  const [started, setStarted] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [animating, setAnimating] = useState(false);

  const handleStart = () => {
    const result = parseUrl(url);
    if (!result) return;
    setParsed(result);
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
      <UrlInput url={url} setUrl={setUrl} onStart={handleStart} />
      {parsed && (
        <>
          <div className={`results ${animating ? "fade-in" : "visible"}`}>
            <UrlBreakdown parsed={parsed} rawUrl={url} />
          </div>
          <JourneyPipeline
            steps={URL_STEPS}
            phaseColors={URL_PHASE_COLORS}
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            parsed={parsed}
          />
          <StepExplainer
            steps={URL_STEPS}
            details={URL_STEP_DETAILS(parsed)}
            stepIndex={activeStep}
            parsed={parsed}
          />
        </>
      )}
    </main>
  );
};
