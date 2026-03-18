import { useState } from "react";

const LAYERS = [
  {
    id: "pid",
    icon: "🪪",
    color: "#a29bfe",
    title: "PID Namespace",
    tag: "Process Isolation",
    simple: "The container can't see other programs running on your computer.",
    analogy: "Imagine you're in a room with blacked-out windows. You can't see what's happening outside. Other programs on the host are invisible to the container — it thinks it's the only thing running.",
    howItWorks: "Every program running on a computer gets a Process ID (PID) — just a number. Normally, everything shares the same list. With a PID namespace, the container gets its own private list. It starts counting from 1, like a fresh computer.",
    realWorld: "Your nginx inside the container sees itself as PID 1. On the host machine, it's actually PID 14328. Same process — two different views.",
    code: `# Inside the container — it only sees itself
$ ps
PID  COMMAND
  1  nginx        ← thinks it's the only process!

# On your actual computer
$ ps
PID    COMMAND
  1    systemd
  981  sshd
14328  nginx       ← same nginx, different number`,
    before: "nginx is PID 14328",
    after: "nginx sees itself as PID 1",
  },
  {
    id: "mount",
    icon: "📂",
    color: "#fd79a8",
    title: "Mount Namespace",
    tag: "Filesystem Isolation",
    simple: "The container has its own hard drive. It can't see or touch your files.",
    analogy: "Think of it like a hotel room. You get a clean room with everything you need. The rest of the hotel (your host computer's files) is behind a locked door you can't open.",
    howItWorks: "Docker takes the image (like a snapshot of an OS with your app) and mounts it as the container's entire filesystem. The container sees /bin, /etc, /home — but these are all from the image, not your real computer. Your actual files are completely hidden.",
    realWorld: "This is why 'docker run ubuntu' gives you a full Ubuntu environment even if you're on macOS. The Ubuntu files come from the image, layered on top of your real OS.",
    code: `# Inside the container — sees a full Linux OS
$ ls /
bin  etc  home  lib  usr  var ...
# These are from the nginx IMAGE, not your computer!

# Your real computer's files? Invisible.
# /home/yourname? Doesn't exist inside.
# /etc/passwd on host? Different file inside.

# Want to share a folder? You explicitly allow it:
$ docker run -v /my/folder:/app nginx
#              ↑ host path  ↑ container path`,
    before: "/ → your computer's real files",
    after: "/ → private copy from the image",
  },
  {
    id: "net",
    icon: "🌐",
    color: "#00b894",
    title: "Network Namespace",
    tag: "Network Isolation",
    simple: "The container gets its own private network, like its own little internet.",
    analogy: "Like moving into a house with its own address. Your house (container) gets a new street address (IP). The outside world can only reach you through the front door (port mapping) — not through your walls.",
    howItWorks: "Docker gives the container its own virtual network card with its own IP address (like 172.17.0.2). It can't see your Wi-Fi or your other network connections. To talk to the outside world, traffic goes through Docker's virtual bridge — like a router.",
    realWorld: "When you do -p 8080:80, you're telling Docker: 'if anyone knocks on my door at port 8080, forward it to the container's port 80.' That's all port mapping is.",
    code: `# Inside the container — its own network
$ ip addr
eth0: 172.17.0.2    ← container's private IP

# Your computer still has its own IP
# The container can't see your Wi-Fi card at all

# Port mapping explained simply:
$ docker run -p 8080:80 nginx
#   Your port 8080 → Container port 80
#   Like call forwarding on a phone`,
    before: "shares your computer's network",
    after: "172.17.0.2 — its own private IP",
  },
  {
    id: "cgroups",
    icon: "⚖️",
    color: "#0984e3",
    title: "Control Groups (cgroups)",
    tag: "Resource Limits",
    simple: "You set a budget. The container can't use more RAM or CPU than you allow.",
    analogy: "Like giving someone a prepaid card with $50. They can spend freely — but the moment they hit $50, it stops. They can't accidentally drain your bank account.",
    howItWorks: "Without limits, one container could use all your RAM and crash everything else. Cgroups let the Linux kernel enforce hard limits. Set 512MB — if the container tries to use 513MB, the kernel kills it immediately.",
    realWorld: "This is what keeps your laptop alive when running 5 containers. Each one has a budget. One container going wild doesn't affect the others.",
    code: `# Give the container a memory budget
$ docker run --memory="512m" nginx

# Give it a CPU budget (1.5 cores max)
$ docker run --cpus="1.5" nginx

# See live usage
$ docker stats
CONTAINER   CPU     MEMORY
nginx       0.1%    18MB / 512MB limit
node-app    12%     200MB / 512MB limit

# Hit the limit → container gets killed
# OOMKilled: true  (Out Of Memory)`,
    before: "can use ALL your RAM if it wants",
    after: "hard limit: 512 MB max",
  },
  {
    id: "seccomp",
    icon: "🛡️",
    color: "#d63031",
    title: "Seccomp + Capabilities",
    tag: "Security Layer",
    simple: "Even if a hacker gets inside the container, they can't break out to your computer.",
    analogy: "Like a maximum security prison. Even if an inmate escapes their cell, the building still has walls, guards, and locked doors. The container runs as 'root' — but it's a root with its dangerous powers removed.",
    howItWorks: "Linux 'root' is normally all-powerful. Docker takes those powers and splits them up, then removes the dangerous ones. Can't change the system clock. Can't load kernel modules. Can't mount fake disks. On top of that, 44 dangerous system calls are completely blocked by default.",
    realWorld: "This is why Docker containers are much safer than just running code directly. Even 'docker run --rm evil-image' can't easily escape and damage your host system.",
    code: `# Container runs as root BUT with limited powers
# These dangerous abilities are REMOVED:

# ❌ Can't change your computer's clock
$ date -s "1 Jan 2030"
Operation not permitted

# ❌ Can't load kernel modules (hardware drivers)
$ insmod evil.ko
Operation not permitted

# ❌ Can't reboot your computer
$ reboot
Operation not permitted

# The kernel blocks these before they even run`,
    before: "root = unlimited power",
    after: "root = safe, limited powers only",
  },
];

const CONTAINERS = [
  { name: "nginx",  pid: "14328", ip: "172.17.0.2", mem: "18 MB" },
  { name: "node",   pid: "14329", ip: "172.17.0.3", mem: "64 MB" },
  { name: "redis",  pid: "14330", ip: "172.17.0.4", mem: "8 MB"  },
];

const layerOrder = LAYERS.map(l => l.id);

const ContainerBox = ({ container, appliedLayers, activeColor }) => {
  const has = (id) => appliedLayers.includes(id);
  return (
    <div
      className="dk-container-box"
      style={{ "--dk-color": appliedLayers.length ? activeColor || "var(--accent2)" : "var(--border2)" }}
    >
      <div className="dk-cbox-header">
        <span>📦</span>
        <span className="dk-cbox-name">{container.name}</span>
      </div>
      <div className="dk-cbox-rows">
        <div className={`dk-cbox-row ${has("pid") ? "dk-row-lit" : ""}`}>
          <span>🪪</span>
          <span>{has("pid") ? "PID: 1" : `PID: ${container.pid}`}</span>
        </div>
        <div className={`dk-cbox-row ${has("mount") ? "dk-row-lit" : ""}`}>
          <span>📂</span>
          <span>{has("mount") ? "/ private" : "/ host"}</span>
        </div>
        <div className={`dk-cbox-row ${has("net") ? "dk-row-lit" : ""}`}>
          <span>🌐</span>
          <span>{has("net") ? container.ip : "shared"}</span>
        </div>
        <div className={`dk-cbox-row ${has("cgroups") ? "dk-row-lit" : ""}`}>
          <span>⚖️</span>
          <span>{has("cgroups") ? "512MB max" : "unlimited"}</span>
        </div>
        <div className={`dk-cbox-row ${has("seccomp") ? "dk-row-lit" : ""}`}>
          <span>🛡️</span>
          <span>{has("seccomp") ? "secured" : "open"}</span>
        </div>
      </div>
    </div>
  );
};

export const DockerJourneyPage = () => {
  const [activeId, setActiveId] = useState(null);
  const [applied, setApplied] = useState([]);

  const activeLayer = LAYERS.find(l => l.id === activeId);

  const handleClick = (id) => {
    if (activeId === id) {
      setActiveId(null);
      return;
    }
    setActiveId(id);
    const idx = layerOrder.indexOf(id);
    setApplied(layerOrder.slice(0, idx + 1));
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-breadcrumb">
          <span className="breadcrumb-dot" />
          Infrastructure
        </div>
        <h1>How Docker Keeps Containers <span style={{ color: "var(--accent)" }}>Isolated</span></h1>
        <p>
          A container is not a tiny computer. It's your app with invisible walls around it —
          built from 5 Linux tricks. Click each one to understand it simply.
        </p>
        <div className="hero-actions">
          <div className="hero-chips">
            {["Beginner Friendly", "Interactive", "No Jargon"].map(c => (
              <span key={c} className="hero-chip">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="stats-banner" style={{ marginBottom: "48px" }}>
        {[
          { v: "5",    l: "Isolation tricks",    c: "#a29bfe" },
          { v: "0",    l: "Extra OS needed",      c: "#06d6a0" },
          { v: "<1%",  l: "Performance overhead", c: "#ff6b35" },
          { v: "🐳",   l: "Just Linux, cleverly", c: "#ffd166" },
        ].map(s => (
          <div key={s.l}>
            <span style={{ color: s.c, fontFamily: "var(--display)", fontSize: "28px", fontWeight: 700 }}>{s.v}</span>
            <span>{s.l}</span>
          </div>
        ))}
      </div>

      {/* WORKSPACE */}
      <div className="dk-workspace">

        {/* LEFT: layer cards */}
        <div className="dk-layers-col">
          <p className="dk-col-label">Click each layer to learn what it does</p>

          {LAYERS.map((layer) => {
            const isActive = activeId === layer.id;
            const isApplied = applied.includes(layer.id);
            return (
              <button
                key={layer.id}
                className={`dk-layer-card ${isActive ? "dk-layer-selected" : ""} ${isApplied && !isActive ? "dk-layer-applied" : ""}`}
                style={{ "--dk-color": layer.color }}
                onClick={() => handleClick(layer.id)}
              >
                <div className="dk-layer-top">
                  <span className="dk-layer-icon">{layer.icon}</span>
                  <div className="dk-layer-meta">
                    <span className="dk-layer-title">{layer.title}</span>
                    <span className="dk-layer-tag">{layer.simple}</span>
                  </div>
                  <span className={`dk-layer-dot ${isApplied ? "dk-dot-on" : ""}`} />
                </div>

                {isActive && (
                  <div className="dk-layer-body">

                    {/* Analogy first — always */}
                    <div className="dk-analogy">
                      <span className="dk-analogy-label">💡 Think of it like this</span>
                      <p>{layer.analogy}</p>
                    </div>

                    {/* How it actually works */}
                    <div className="dk-how">
                      <span className="dk-section-label">⚙️ How it actually works</span>
                      <p>{layer.howItWorks}</p>
                    </div>

                    {/* Real world */}
                    <div className="dk-realworld">
                      <span className="dk-section-label">🌍 Real example</span>
                      <p>{layer.realWorld}</p>
                    </div>

                    {/* Before / after */}
                    <div className="dk-before-after">
                      <div className="dk-ba-item">
                        <span className="dk-ba-label">Without this layer</span>
                        <span className="dk-ba-val dk-ba-before">{layer.before}</span>
                      </div>
                      <span className="dk-ba-arrow">→</span>
                      <div className="dk-ba-item">
                        <span className="dk-ba-label">With this layer</span>
                        <span className="dk-ba-val dk-ba-after" style={{ color: layer.color }}>{layer.after}</span>
                      </div>
                    </div>

                    {/* Code — last, optional to read */}
                    <details className="dk-code-details">
                      <summary>Show me the terminal commands</summary>
                      <pre className="dk-code">{layer.code}</pre>
                    </details>

                  </div>
                )}
              </button>
            );
          })}

          {applied.length > 0 && (
            <button className="dk-reset" onClick={() => { setApplied([]); setActiveId(null); }}>
              ↺ Reset
            </button>
          )}
        </div>

        {/* RIGHT: live diagram */}
        <div className="dk-diagram-col">
          <p className="dk-col-label">Watch the container change as you apply layers</p>

          <div className="dk-host">
            <div className="dk-host-label">🖥️ Your Computer (Linux Host)</div>

            <div className="dk-host-procs">
              <span className="dk-proc-pill">systemd</span>
              <span className="dk-proc-pill">sshd</span>
              <span className="dk-proc-pill">postgres</span>
              {applied.length > 0 && (
                <span className="dk-proc-pill" style={{ color: "var(--muted)", borderStyle: "dashed" }}>
                  nginx (hidden from containers 👻)
                </span>
              )}
            </div>

            <div className="dk-engine-band">
              🐳 Docker Engine
            </div>

            {applied.length > 0 && (
              <div className="dk-wall">
                <div className="dk-wall-label">isolation walls applied so far</div>
                <div className="dk-wall-layers">
                  {applied.map(id => {
                    const l = LAYERS.find(x => x.id === id);
                    return (
                      <span
                        key={id}
                        className={`dk-wall-chip ${activeId === id ? "dk-wall-chip-active" : ""}`}
                        style={{ "--dk-color": l.color }}
                      >
                        {l.icon} {l.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="dk-containers-row">
              {CONTAINERS.map(c => (
                <ContainerBox
                  key={c.name}
                  container={c}
                  appliedLayers={applied}
                  activeColor={activeLayer?.color}
                />
              ))}
            </div>

            {applied.length === 0 && (
              <div className="dk-diagram-hint">
                👆 Click a layer on the left to start
              </div>
            )}
          </div>

          {/* Simple summary card */}
          {activeLayer && (
            <div className="dk-callout" style={{ borderColor: activeLayer.color }}>
              <span style={{ fontSize: "22px" }}>{activeLayer.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--display)", fontWeight: 600, color: activeLayer.color, fontSize: "13px", marginBottom: "4px" }}>
                  {activeLayer.title}
                </div>
                <div style={{ fontFamily: "var(--body)", fontSize: "13px", color: "var(--text2)", lineHeight: 1.6 }}>
                  {activeLayer.simple}
                </div>
              </div>
            </div>
          )}

          {/* Progress indicator */}
          {applied.length > 0 && (
            <div className="dk-progress">
              <div className="dk-progress-label">
                {applied.length} of 5 layers applied
                {applied.length === 5 && " — fully isolated! 🎉"}
              </div>
              <div className="dk-progress-bar">
                <div
                  className="dk-progress-fill"
                  style={{ width: `${(applied.length / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
