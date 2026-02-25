import { useState } from "react";

const PARTS_INFO = {
  protocol: {
    label: "Protocol",
    color: "#ff6b35",
    desc: "Defines the rules for communication. HTTPS means data is encrypted via TLS/SSL before transmission.",
  },
  subdomain: {
    label: "Subdomain",
    color: "#ffd166",
    desc: "A prefix to the domain. 'www' is convention for web, but it's just another subdomain — configurable by the server admin.",
  },
  domain: {
    label: "Domain",
    color: "#06d6a0",
    desc: "The human-readable name mapped to an IP address via DNS. Registered through domain registrars (GoDaddy, Namecheap, etc.)",
  },
  path: {
    label: "Path / Route",
    color: "#118ab2",
    desc: "Tells the web server which resource to serve. The server routes this to the correct handler or controller.",
  },
};

export default function UrlBreakdown({ parsed, rawUrl }) {
  const [hovered, setHovered] = useState(null);

  const parts = [
    parsed.protocol && { key: "protocol", value: parsed.protocol + "://" },
    parsed.subdomain && { key: "subdomain", value: parsed.subdomain + "." },
    parsed.domain && { key: "domain", value: parsed.domain },
    parsed.path && parsed.path !== "/" && { key: "path", value: parsed.path },
  ].filter(Boolean);

  return (
    <section className="url-breakdown">
      <h2 className="section-title">URL Breakdown</h2>
      <div className="breakdown-bar">
        {parts.map(({ key, value }) => (
          <span
            key={key}
            className={`url-part ${hovered === key ? "hovered" : ""}`}
            style={{ "--part-color": PARTS_INFO[key]?.color }}
            onMouseEnter={() => setHovered(key)}
            onMouseLeave={() => setHovered(null)}
          >
            {value}
          </span>
        ))}
      </div>
      {hovered && PARTS_INFO[hovered] && (
        <div
          className="part-tooltip"
          style={{ borderColor: PARTS_INFO[hovered].color }}
        >
          <span
            className="part-label"
            style={{ color: PARTS_INFO[hovered].color }}
          >
            {PARTS_INFO[hovered].label}
          </span>
          <p>{PARTS_INFO[hovered].desc}</p>
        </div>
      )}
      {!hovered && (
        <p className="hover-hint">↑ Hover over each part to learn more</p>
      )}
      <div className="parsed-meta">
        <span>Port: <strong>{parsed.port}</strong></span>
        <span>Protocol: <strong>{parsed.protocol.toUpperCase()}</strong></span>
        <span>Encrypted: <strong>{parsed.protocol === "https" ? "✓ Yes (TLS)" : "✗ No"}</strong></span>
      </div>
    </section>
  );
}
