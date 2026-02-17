import { useState } from "react";
import { Home } from "./pages/Home";
import { UrlJourney } from "./components/urlJourney/UrlJourney.jsx";

export const App = () => {
  const [page, setPage] = useState("home");

  return (
    <div>
      {page === "home" && <Home setPage={setPage} />}
      {page === "url" && <UrlJourney setPage={setPage} />}
    </div>
  );
};
