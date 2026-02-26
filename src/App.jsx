import { useState } from "react";
import { Home } from "./pages/landing_page/Home";
import { UrlInput } from "./pages/url_explain/UrlInput";
import { UrlBreakdown } from "./pages/url_explain/UrlBreakdown";
import { JourneyPipeline } from "./pages/url_explain/JourneyPipeline";
import { StepExplainer } from "./pages/url_explain/StepExplainer";
import { CdnJourneyPage } from "./pages/cdn_explain/CdnJourneyPage";
import "./App.css";

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

const UrlJourneyPage = ({ onBack }) => {
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
      <div className="page-back-row">
        <button className="page-back-btn" onClick={onBack}>
          ← Back to topics
        </button>
      </div>
      <UrlInput url={url} setUrl={setUrl} onStart={handleStart} />
      {parsed && (
        <div className={`results ${animating ? "fade-in" : "visible"}`}>
          <UrlBreakdown parsed={parsed} rawUrl={url} />
          <JourneyPipeline
            started={started}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            parsed={parsed}
          />
          {activeStep !== null && (
            <StepExplainer stepIndex={activeStep} parsed={parsed} />
          )}
        </div>
      )}
      {!parsed && (
        <div className="hero-hint">
          <div className="hint-grid">
            <div className="hint-card">
              <span className="hint-num">01</span>
              <p>Enter any URL above to begin the journey</p>
            </div>
            <div className="hint-card">
              <span className="hint-num">02</span>
              <p>Watch the full network & backend flow animate</p>
            </div>
            <div className="hint-card">
              <span className="hint-num">03</span>
              <p>Click each stage to read technical details</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export const App = () => {
  const [page, setPage] = useState("home");

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="logo" onClick={() => setPage("home")}>
            <span className="logo-icon">⬡</span>
            <span className="logo-text">thebackendverse</span>
          </div>
          <div className="header-right">
            {page !== "home" && (
              <button
                className="header-back-chip"
                onClick={() => setPage("home")}
              >
                ← All topics
              </button>
            )}
            <p className="tagline">See what happens when you hit Enter</p>
          </div>
        </div>
      </header>

      {page === "home" && <Home setPage={setPage} />}
      {page === "url" && <UrlJourneyPage onBack={() => setPage("home")} />}
      {page === "cdn" && <CdnJourneyPage onBack={() => setPage("home")} />}

      <footer className="site-footer">
        <p>Built to demystify the backend · thebackendverse</p>
      </footer>
    </div>
  );
};
