export default function UrlInput({ url, setUrl, onStart }) {
  const handleKey = (e) => {
    if (e.key === "Enter") onStart();
  };

  return (
    <section className="url-input-section">
      <h1 className="main-title">
        Backend Journey<br />
        <span className="title-accent">Visualizer</span>
      </h1>
      <p className="subtitle">
        Enter any URL and trace its entire journey — from your browser to a database and back.
      </p>
      <div className="input-row">
        <div className="input-wrapper">
          <span className="input-icon">⌕</span>
          <input
            type="text"
            className="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKey}
            placeholder="https://www.instagram.com/iaml0kesh"
            spellCheck={false}
          />
        </div>
        <button className="start-btn" onClick={onStart}>
          Start Journey →
        </button>
      </div>
      <div className="example-links">
        Try:
        {[
          "https://www.instagram.com/iaml0kesh",
          "https://api.github.com/users/iml0kesh",
          "https://www.google.com/search?q=backend",
        ].map((ex) => (
          <button
            key={ex}
            className="example-chip"
            onClick={() => setUrl(ex)}
          >
            {ex.replace("https://", "")}
          </button>
        ))}
      </div>
    </section>
  );
}
