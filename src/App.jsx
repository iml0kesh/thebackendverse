import { useState } from "react";
import { Home } from "./pages/landing_page/Home";
import { UrlJourneyPage } from "./pages/url_explain/UrlJourneyPage";
import { CdnJourneyPage } from "./pages/cdn_explain/CdnJourneyPage";
import "./App.css";

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
            <p className="tagline">From Request to Response.</p>
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
