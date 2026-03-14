import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { Home } from "./pages/landing_page/Home";
import { UrlJourneyPage } from "./pages/url_explain/UrlJourneyPage";
import { CdnJourneyPage } from "./pages/cdn_explain/CdnJourneyPage";
import { CompilerJourneyPage } from "./pages/compiler_explain/CompilerJourneyPage";
import { OsiJourneyPage } from "./pages/osi_explain/OsiJourneyPage";
import { OauthJourneyPage } from "./pages/oauth_explain/OauthJourneyPage";

import "./App.css";

const NotFoundPage = () => (
  <div style={{ textAlign: "center", padding: "100px 20px" }}>
    <h1>404 - Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <Link to="/" style={{ color: "var(--accent-primary)" }}>
      Go back to the homepage
    </Link>
  </div>
);

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <HelmetProvider>
      <div className="app">
        <header className="site-header">
          <div className="header-inner">
            <Link
              to="/"
              className="logo"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="logo-icon">⬡</span>
              <span className="logo-text">thebackendverse</span>
            </Link>
            <div className="header-right">
              {!isHome && (
                <button
                  className="header-back-chip"
                  onClick={() => navigate("/")}
                >
                  ← All topics
                </button>
              )}
              <p className="tagline">From Request to Response.</p>
            </div>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/url" element={<UrlJourneyPage />} />
          <Route path="/cdn" element={<CdnJourneyPage />} />
          <Route path="/compiler" element={<CompilerJourneyPage />} />
          <Route path="/osi" element={<OsiJourneyPage />} />
          <Route path="/oauth" element={<OauthJourneyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <footer className="site-footer">
          <p>Built to demystify the backend · thebackendverse</p>
        </footer>
      </div>
    </HelmetProvider>
  );
};
