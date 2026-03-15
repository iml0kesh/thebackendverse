export const CodeBlock = ({ code, language }) => {
  return (
    <div
      className="code-block"
      style={{
        background: "#1e1e24",
        color: "#e2e8f0",
        padding: "16px",
        borderRadius: "8px",
        fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
        fontSize: "0.85rem",
        overflowX: "auto",
        marginTop: "12px",
        border: "1px solid #2d3436",
        lineHeight: "1.5",
      }}
    >
      <pre style={{ margin: 0 }}>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
