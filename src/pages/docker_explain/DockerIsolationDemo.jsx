import { useState } from "react";

const LAYERS = [
  {
    id: "pid",
    icon: "🪪",
    label: "PID Namespace",
    color: "#a29bfe",
    tagline: "Process Isolation",
    what: "Each container thinks it's PID 1. It can't see or kill host processes.",
    before: { pid: "14328", fs: "Host /", ip: "192.168.1.10", mem: "Unlimited" },
    after:  { pid: "1",     fs: "Host /", ip: "192.168.1.10", mem: "Unlimited" },
    highlightKey: "pid",
  },
  {
    id: "mount",
    icon: "📂",
    label: "Mount Namespace",
    color: "#fd79a8",
    tagline: "Filesystem Isolation",
    what: "Container gets its own root /. Can't see or touch the host filesystem.",
    before: { pid: "1", fs: "Host /",       ip: "192.168.1.10", mem: "Unlimited" },
    after:  { pid: "1", fs: "/ (OverlayFS)", ip: "192.168.1.10", mem: "Unlimited" },
    highlightKey: "fs",
  },
  {
    id: "net",
    icon: "🌐",
    label: "Network Namespace",
    color: "#00b894",
    tagline: "Network Isolation",
    what: "Container gets its own IP, interfaces, and routing table via a veth pair.",
    before: { pid: "1", fs: "/ (OverlayFS)", ip: "192.168.1.10",  mem: "Unlimited" },
    after:  { pid: "1", fs: "/ (OverlayFS)", ip: "172.17.0.2",    mem: "Unlimited" },
    highlightKey: "ip",
  },
  {
    id: "cgroups",
    icon: "⚖️",
    label: "Cgroups",
    color: "#0984e3",
    tagline: "Resource Limits",
    what: "Kernel enforces hard memory & CPU caps. Exceeding the limit = OOM kill.",
    before: { pid: "1", fs: "/ (OverlayFS)", ip: "172.17.0.2", mem: "Unlimited" },
    after:  { pid: "1", fs: "/ (OverlayFS)", ip: "172.17.0.2", mem: "Max 512 MB" },
    highlightKey: "mem",
  },
  {
    id: "seccomp",
    icon: "🛡️",
    label: "Seccomp + Caps",
    color: "#d63031",
    tagline: "Syscall Filtering",
    what: "44 dangerous syscalls blocked. CAP_SYS_ADMIN, CAP_SYS_MODULE stripped.",
    before: { pid: "1", fs: "/ (OverlayFS)", ip: "172.17.0.2", mem: "Max 512 MB" },
    after:  { pid: "1", fs: "/ (OverlayFS)", ip: "172.17.0.2", mem: "Max 512 MB" },
    highlightKey: "seccomp",
    shielded: true,
  },
];

const StatusRow = ({ icon, label, value, highlight }) => (
  <div className={`di-status-row ${highlight ? "di-highlight" : ""}`}>
    <span className="di-status-icon">{icon}</span>
    <span className="di-status-label">{label}</span>
    <span className="di-status-value">{value}</span>
  </div>
);

const ContainerCard = ({ state, shielded, activeColor }) => (
  <div
    className={`di-container-card ${shielded ? "di-shielded" : ""}`}
    style={{ "--active-color": activeColor || "var(--border2)" }}
  >
    <div className="di-container-header">
      <span className="di-container-icon">📦</span>
      <span className="di-container-name">nginx:latest</span>
      {shielded && <span className="di-shield-badge">🛡️ secured</span>}
    </div>
    <div className="di-status-rows">
      <StatusRow icon="🪪" label="PID"    value={state.pid} highlight={state.highlightKey === "pid"} />
      <StatusRow icon="📂" label="Root"   value={state.fs}  highlight={state.highlightKey === "fs"} />
      <StatusRow icon="🌐" label="IP"     value={state.ip}  highlight={state.highlightKey === "ip"} />
      <StatusRow icon="⚖️" label="Memory" value={state.mem} highlight={state.highlightKey === "mem"} />
    </div>
  </div>
);

export const DockerIsolationDemo = () => {
  const [activeIdx, setActiveIdx] = useState(null);
  const [appliedLayers, setAppliedLayers] = useState([]);

  const toggleLayer = (idx) => {
    setActiveIdx(prev => prev === idx ? null : idx);
    setAppliedLayers(prev => {
      const id = LAYERS[idx].id;
      if (prev.includes(id)) {
        // remove this and everything after
        const pos = prev.indexOf(id);
        return prev.slice(0, pos);
      }
      // add everything up to and including this layer in order
      const newLayers = [];
      for (let i = 0; i <= idx; i++) {
        if (!newLayers.includes(LAYERS[i].id)) newLayers.push(LAYERS[i].id);
      }
      return newLayers;
    });
  };

  // Build container state by applying all active layers in order
  const containerState = appliedLayers.reduce((acc, id) => {
    const layer = LAYERS.find(l => l.id === id);
    return { ...layer.after, highlightKey: layer.highlightKey };
  }, { pid: "14328", fs: "Host /", ip: "192.168.1.10", mem: "Unlimited", highlightKey: null });

  const isShielded = appliedLayers.includes("seccomp");
  const activeLayer = activeIdx !== null ? LAYERS[activeIdx] : null;

  return (
    <section className="di-section">
      <div className="di-header">
        <h2 className="di-title">
          Build the Isolation <span className="di-title-accent">Layer by Layer</span>
        </h2>
        <p className="di-subtitle">
          Click each kernel primitive to apply it. Watch the container transform from a bare process into a fully isolated box.
        </p>
      </div>

      <div className="di-workspace">
        {/* Left: layer toggles */}
        <div className="di-layers">
          {LAYERS.map((layer, idx) => {
            const isApplied = appliedLayers.includes(layer.id);
            const isSelected = activeIdx === idx;
            return (
              <button
                key={layer.id}
                className={`di-layer-btn ${isApplied ? "di-applied" : ""} ${isSelected ? "di-selected" : ""}`}
                style={{ "--layer-color": layer.color }}
                onClick={() => toggleLayer(idx)}
              >
                <div className="di-layer-left">
                  <span className="di-layer-icon">{layer.icon}</span>
                  <div className="di-layer-text">
                    <span className="di-layer-name">{layer.label}</span>
                    <span className="di-layer-tag">{layer.tagline}</span>
                  </div>
                </div>
                <span className={`di-layer-status ${isApplied ? "di-on" : "di-off"}`}>
                  {isApplied ? "ON" : "OFF"}
                </span>
              </button>
            );
          })}
          {appliedLayers.length > 0 && (
            <button
              className="di-reset-btn"
              onClick={() => { setAppliedLayers([]); setActiveIdx(null); }}
            >
              ↺ Reset
            </button>
          )}
        </div>

        {/* Right: container visualizer */}
        <div className="di-visualizer">
          <div className="di-host-box">
            <div className="di-host-label">🖥️ Linux Host</div>

            <div className="di-host-processes">
              <span className="di-proc">PID 1: systemd</span>
              <span className="di-proc">PID 981: sshd</span>
              <span className="di-proc">PID 4012: postgres</span>
            </div>

            <div className={`di-container-wrapper ${appliedLayers.length > 0 ? "di-has-wall" : ""}`}>
              {appliedLayers.length > 0 && (
                <div className="di-wall-label">
                  {appliedLayers.map(id => LAYERS.find(l => l.id === id).icon).join(" ")} kernel wall
                </div>
              )}
              <ContainerCard
                state={containerState}
                shielded={isShielded}
                activeColor={activeLayer?.color}
              />
            </div>

            <div className="di-engine-label">🐳 Docker Engine</div>
          </div>

          {/* Explanation panel */}
          {activeLayer && (
            <div
              className="di-explainer"
              style={{ borderColor: activeLayer.color }}
            >
              <div className="di-explainer-top">
                <span className="di-explainer-icon">{activeLayer.icon}</span>
                <div>
                  <div className="di-explainer-name" style={{ color: activeLayer.color }}>
                    {activeLayer.label}
                  </div>
                  <div className="di-explainer-what">{activeLayer.what}</div>
                </div>
              </div>
              {appliedLayers.includes(activeLayer.id) && (
                <div className="di-explainer-change">
                  <span className="di-change-before">{Object.entries(activeLayer.before).find(([k]) => k === activeLayer.highlightKey)?.[1] || "—"}</span>
                  <span className="di-change-arrow">→</span>
                  <span className="di-change-after" style={{ color: activeLayer.color }}>
                    {Object.entries(activeLayer.after).find(([k]) => k === activeLayer.highlightKey)?.[1] || "secured"}
                  </span>
                </div>
              )}
            </div>
          )}

          {appliedLayers.length === 0 && (
            <div className="di-empty-hint">
              ← Click a layer to start building isolation
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
