export const Home = ({ setPage }) => {
  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>TheBackendVerse</h1>
      <p>Explore what happens behind every request.</p>

      <button
        onClick={() => setPage("url")}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          cursor: "pointer",
        }}
      >
        Start URL Journey
      </button>
    </div>
  );
};
