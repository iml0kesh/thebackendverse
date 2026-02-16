import React, { useState } from "react";

const FLOW_STEPS = [
  {
    title: "Parsing & HSTS Check",
    icon: "🔍",
    desc: "The browser checks if 'google.com' is in its HSTS cache (forcing HTTPS) and prepares the network request.",
    technical: { action: "URL_PARSE", protocol: "https", hsts: "HIT" },
    highlight: "browser",
  },
  {
    title: "DNS Resolution",
    icon: "☎️",
    desc: "Your computer asks the DNS server: 'What is the IP for google.com?'",
    technical: { query: "A Record", resolver: "8.8.8.8", ip: "142.250.190.46" },
    highlight: "dns",
  },
  {
    title: "TCP Handshake",
    icon: "🤝",
    desc: "A connection is established using the 'Three-Way Handshake' (SYN, SYN-ACK, ACK).",
    technical: { state: "ESTABLISHED", port: 443, proto: "TCP" },
    highlight: "server",
  },
  {
    title: "TLS Negotiation",
    icon: "🔐",
    desc: "Keys are exchanged to encrypt all future data. No one can see what you search for now.",
    technical: { version: "TLS 1.3", cipher: "AES_256_GCM" },
    highlight: "server",
  },
  {
    title: "HTTP Request",
    icon: "📤",
    desc: "The browser finally sends the 'GET /' request to the server.",
    technical: { method: "GET", path: "/", host: "google.com" },
    highlight: "server",
  },
  {
    title: "The Response",
    icon: "✨",
    desc: "The server sends back the HTML/CSS/JS. Your screen starts to turn white, then shows the Google logo.",
    technical: { status: 200, type: "text/html", transfer: "chunked" },
    highlight: "browser",
  },
];

export const UrlJourney = () => {
  const [current, setCurrent] = useState(0);
  const step = FLOW_STEPS[current];

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#eee",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "monospace",
      }}
    >
      <h1 style={{ color: "#00ffcc", textAlign: "center" }}>
        THE BACKEND VERSE
      </h1>
      <p style={{ textAlign: "center", color: "#888" }}>
        Journey: Typing google.com
      </p>

      {/* --- VISUAL AREA --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "40px",
          background: "#111",
          borderRadius: "15px",
          margin: "20px 0",
          border: "1px solid #333",
        }}
      >
        <Node
          label="YOU (Browser)"
          active={step.highlight === "browser"}
          icon="💻"
        />
        <Connector active={current > 0 && current < 2} />
        <Node label="DNS Server" active={step.highlight === "dns"} icon="🏦" />
        <Connector active={current >= 2} />
        <Node
          label="Google Server"
          active={step.highlight === "server"}
          icon="☁️"
        />
      </div>

      {/* --- CONTENT AREA --- */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Simple Explanation */}
        <div
          style={{
            background: "#1a1a1a",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h2 style={{ color: "#00ffcc" }}>
            {step.icon} {step.title}
          </h2>
          <p style={{ fontSize: "1.2rem", lineHeight: "1.5" }}>{step.desc}</p>
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              style={btnStyle}
            >
              PREV
            </button>
            <button
              onClick={() =>
                setCurrent((c) => Math.min(FLOW_STEPS.length - 1, c + 1))
              }
              style={{ ...btnStyle, background: "#00ffcc", color: "#000" }}
            >
              NEXT
            </button>
          </div>
        </div>

        {/* Technical Terminal */}
        <div
          style={{
            background: "#000",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #00ffcc44",
          }}
        >
          <span style={{ color: "#00ffcc" }}>
            root@backendverse:~$ tail -f /var/log/network
          </span>
          <pre style={{ color: "#0f0", marginTop: "15px" }}>
            {JSON.stringify(step.technical, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Small helper components for the UI
const Node = ({ label, active, icon }) => (
  <div
    style={{
      textAlign: "center",
      opacity: active ? 1 : 0.3,
      transition: "0.3s",
    }}
  >
    <div style={{ fontSize: "50px", marginBottom: "10px" }}>{icon}</div>
    <div style={{ color: active ? "#00ffcc" : "#fff" }}>{label}</div>
  </div>
);

const Connector = ({ active }) => (
  <div
    style={{
      height: "2px",
      width: "100px",
      background: active ? "#00ffcc" : "#333",
      position: "relative",
    }}
  >
    {active && <div className="pulse" />}
  </div>
);

const btnStyle = {
  padding: "10px 20px",
  marginRight: "10px",
  cursor: "pointer",
  border: "1px solid #00ffcc",
  background: "transparent",
  color: "#00ffcc",
  fontWeight: "bold",
};
