import { useState } from "react";

const LAYERS = [
  {
    id: "pid",
    icon: "🪪",
    color: "#a29bfe",
    name: "PID Namespace",
    question: "Can containers see each other's processes?",
    withoutProblem: "Without this, every container can see and even kill every other process on your computer. Total chaos.",
    withSolution: "Each container now has its own process list. nginx thinks it's PID 1 — the only process alive. It can't see node, redis, or anything on your host.",
    command: "docker run --pid=host nginx  # dangerous: shares host processes",
  },
  {
    id: "mount",
    icon: "📂",
    color: "#fd79a8",
    name: "Mount Namespace",
    question: "Can containers read your files?",
    withoutProblem: "Without this, the container shares your real hard drive. It can read your code, your SSH keys, everything.",
    withSolution: "Each container gets its own private filesystem from the image. Your files are completely invisible inside.",
    command: "docker run -v ./myfiles:/app nginx  # only share what you choose",
  },
  {
    id: "net",
    icon: "🌐",
    color: "#00b894",
    name: "Network Namespace",
    question: "Are containers sharing your WiFi?",
    withoutProblem: "Without this, all containers share your network. Port conflicts everywhere — two apps can't both use port 80.",
    withSolution: "Each container gets its own private IP. nginx gets 172.17.0.2, node gets 172.17.0.3. No conflicts ever.",
    command: "docker run -p 8080:80 nginx  # map host:8080 → container:80",
  },
  {
    id: "cgroups",
    icon: "⚖️",
    color: "#fdcb6e",
    name: "cgroups",
    question: "Can one container crash everything?",
    withoutProblem: "Without this, one leaky container eats all your RAM and takes down every other container and your host.",
    withSolution: "Each container has a hard resource budget. Hit the limit → that container dies. Everything else stays alive.",
    command: "docker run --memory=512m --cpus=1 nginx",
  },
  {
    id: "seccomp",
    icon: "🛡️",
    color: "#e17055",
    name: "Seccomp",
    question: "Can a hacker escape the container?",
    withoutProblem: "Without this, code running inside could make dangerous Linux system calls — reboot your machine, load kernel modules, read hardware.",
    withSolution: "44 dangerous system calls are blocked. Even if someone runs malicious code inside, they can't escape to your host.",
    command: "docker run --security-opt seccomp=default.json nginx",
  },
];

const APPS = [
  { name: "nginx",  icon: "🌐", pid: "14201", ip: "172.17.0.2", port: "80",   color: "#00b894" },
  { name: "node",   icon: "🟢", pid: "14308", ip: "172.17.0.3", port: "3000", color: "#fdcb6e" },
  { name: "redis",  icon: "🔴", pid: "14412", ip: "172.17.0.4", port: "6379", color: "#e17055" },
];

const CONCEPTS = [
  {
    icon: "📦",
    term: "What is a Container?",
    simple: "A box your app runs inside.",
    explain: "Imagine you built an app on your laptop. It works perfectly. But when you send it to your friend, it crashes — because they have a different version of Node.js, different files, different settings. A container solves this by packaging your app together with everything it needs to run. Same box, anywhere.",
    analogy: "🚢 Like a shipping container. The same box that works on a truck also works on a ship and a train — it doesn't care what's carrying it.",
  },
  {
    icon: "🖼️",
    term: "What is an Image?",
    simple: "The recipe used to create a container.",
    explain: "An image is a snapshot — a read-only template that says 'this container should have Ubuntu, Node.js 20, and my app files'. When you run an image, Docker creates a container from it. You can run the same image 100 times and get 100 identical containers.",
    analogy: "🍪 Like a cookie cutter. The cutter (image) stays the same. Each cookie (container) is a fresh copy you can do whatever you want with.",
  },
  {
    icon: "🐳",
    term: "What is Docker?",
    simple: "The tool that creates and manages containers.",
    explain: "Docker is the software that makes containers work. You tell it 'run this image' and it handles everything — creating the container, setting up the isolated environment, starting your app. Without Docker, you'd have to do all of this manually with dozens of Linux commands.",
    analogy: "🏭 Like a factory. You give it a blueprint (image) and it builds and runs the product (container) for you.",
  },
  {
    icon: "🆚",
    term: "Container vs Virtual Machine",
    simple: "Containers share the OS. VMs bring their own.",
    explain: "A Virtual Machine is a full fake computer — it has its own operating system, taking up gigabytes of RAM just to boot. A container is much lighter — it shares your computer's OS but stays isolated using Linux tricks. That's why you can run 50 containers but maybe only 3 VMs on the same machine.",
    analogy: "🏠 A VM is buying a whole house. A container is renting a room — shared walls, but your own private space.",
  },
];

export const DockerJourneyPage = () => {
  const [walls, setWalls] = useState([]);
  const [focused, setFocused] = useState(null);
  const [expandedConcept, setExpandedConcept] = useState(null);

  const hasWall = (id) => walls.includes(id);

  const toggleWall = (id) => {
    setFocused(id);
    if (hasWall(id)) {
      setWalls(walls.filter(w => w !== id));
    } else {
      setWalls([...walls, id]);
    }
  };

  const focusedLayer = LAYERS.find(l => l.id === focused);
  const allApplied = walls.length === LAYERS.length;

  return (
    <main className="docker-lab">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-breadcrumb"><span className="breadcrumb-dot" />Infrastructure</div>
        <h1>How Docker Containers<br /><span style={{ color: "var(--accent)" }}>Are Isolated</span></h1>
        <p>Start from zero — what is Docker, what is a container, and how does Linux keep them separated from each other. All explained simply.</p>
        <div className="hero-actions">
          <div className="hero-chips">
            {["Beginner Friendly", "Interactive Lab", "No Prior Knowledge Needed"].map(c => (
              <span key={c} className="hero-chip">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 1: CORE CONCEPTS ── */}
      <div className="dlab-section">
        <div className="dlab-section-header">
          <span className="dlab-section-num">01</span>
          <div>
            <h2 className="dlab-section-title">The Basics — What Are We Even Talking About?</h2>
            <p className="dlab-section-sub">Before the interactive part, make sure you understand these four ideas. Click any card to expand it.</p>
          </div>
        </div>

        <div className="dlab-concepts">
          {CONCEPTS.map((c, i) => {
            const isOpen = expandedConcept === i;
            return (
              <button
                key={i}
                className={`dlab-concept-card ${isOpen ? "dlab-concept-open" : ""}`}
                onClick={() => setExpandedConcept(isOpen ? null : i)}
              >
                <div className="dlab-concept-top">
                  <span className="dlab-concept-icon">{c.icon}</span>
                  <div className="dlab-concept-text">
                    <span className="dlab-concept-term">{c.term}</span>
                    <span className="dlab-concept-simple">{c.simple}</span>
                  </div>
                  <span className="dlab-concept-chevron">{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                  <div className="dlab-concept-body">
                    <p className="dlab-concept-explain">{c.explain}</p>
                    <div className="dlab-concept-analogy">
                      <span className="dlab-analogy-label">Analogy</span>
                      <span>{c.analogy}</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: HOW ISOLATION WORKS ── */}
      <div className="dlab-section">
        <div className="dlab-section-header">
          <span className="dlab-section-num">02</span>
          <div>
            <h2 className="dlab-section-title">How Does Isolation Actually Work?</h2>
            <p className="dlab-section-sub">A container is not magic. It's just your app running as a normal Linux process — but with five invisible walls built around it using features already in the Linux kernel.</p>
          </div>
        </div>

        <div className="dlab-isolation-intro">
          <div className="dlab-iso-card">
            <span className="dlab-iso-icon">🧠</span>
            <div>
              <div className="dlab-iso-title">The key insight</div>
              <div className="dlab-iso-text">Docker doesn't create a fake computer. It takes your app, runs it as a normal process, and then uses 5 Linux kernel features to make that process think it's alone — with its own files, its own network, its own process list.</div>
            </div>
          </div>
          <div className="dlab-iso-card">
            <span className="dlab-iso-icon">⚡</span>
            <div>
              <div className="dlab-iso-title">Why this is fast</div>
              <div className="dlab-iso-text">Because there's no fake OS booting up. The container starts in milliseconds. It uses the same Linux kernel as your host — just in an isolated environment.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: INTERACTIVE LAB ── */}
      <div className="dlab-section">
        <div className="dlab-section-header">
          <span className="dlab-section-num">03</span>
          <div>
            <h2 className="dlab-section-title">The Interactive Lab</h2>
            <p className="dlab-section-sub">Below are 3 containers running completely unprotected. Apply isolation walls one by one and watch each container change from dangerous → safe.</p>
          </div>
        </div>

        {/* THE MACHINE */}
        <div className="dlab-machine">
          <div className="dlab-machine-label">
            <span>🖥️ Linux Host Machine</span>
            <span className="dlab-machine-sub">
              {walls.length === 0 ? "⚠️ No isolation — containers wide open" :
               allApplied ? "✅ Fully isolated" :
               `${walls.length} / 5 walls applied`}
            </span>
          </div>

          {/* Host processes */}
          <div className="dlab-host-bar">
            <span className="dlab-host-label">Host processes (visible to all containers without isolation):</span>
            <div className="dlab-host-procs">
              {["PID 1 — systemd", "PID 892 — sshd", "PID 2041 — postgres", "PID 5533 — your-bank-app"].map(p => (
                <span key={p} className={`dlab-proc ${hasWall("pid") ? "dlab-proc-hidden" : ""}`}>{p}</span>
              ))}
            </div>
            {hasWall("pid") && <div className="dlab-isolated-note">🪪 PID Namespace active — containers can only see themselves</div>}
          </div>

          {/* Docker engine */}
          <div className="dlab-engine">
            <span>🐳</span>
            <span>Docker Engine</span>
            <span className="dlab-engine-sub">dockerd → containerd → runc</span>
          </div>

          {/* Active walls */}
          {walls.length > 0 && (
            <div className="dlab-walls-strip">
              {LAYERS.filter(l => hasWall(l.id)).map(l => (
                <span key={l.id} className="dlab-wall-tag" style={{ "--wc": l.color }}>
                  {l.icon} {l.name}
                </span>
              ))}
              <span className="dlab-walls-label">isolation walls</span>
            </div>
          )}

          {/* Containers */}
          <div className="dlab-containers">
            {APPS.map(app => (
              <div key={app.name} className="dlab-container" style={{ "--ac": app.color }}>
                <div className="dlab-ctr-header">
                  <span className="dlab-ctr-icon">{app.icon}</span>
                  <span className="dlab-ctr-name">{app.name}</span>
                  <span className="dlab-ctr-status">running</span>
                </div>
                <div className="dlab-ctr-body">
                  <div className={`dlab-stat ${focused === "pid" ? "dlab-stat-focus" : ""}`} style={{ "--fc": "#a29bfe" }}>
                    <span className="dlab-stat-icon">🪪</span>
                    <span className="dlab-stat-label">Process ID</span>
                    <span className="dlab-stat-val">
                      {hasWall("pid") ? <span className="dlab-val-good">PID 1 (isolated)</span> : <span className="dlab-val-bad">{app.pid} (exposed!)</span>}
                    </span>
                  </div>
                  <div className={`dlab-stat ${focused === "mount" ? "dlab-stat-focus" : ""}`} style={{ "--fc": "#fd79a8" }}>
                    <span className="dlab-stat-icon">📂</span>
                    <span className="dlab-stat-label">Filesystem</span>
                    <span className="dlab-stat-val">
                      {hasWall("mount") ? <span className="dlab-val-good">private copy</span> : <span className="dlab-val-bad">host files visible!</span>}
                    </span>
                  </div>
                  <div className={`dlab-stat ${focused === "net" ? "dlab-stat-focus" : ""}`} style={{ "--fc": "#00b894" }}>
                    <span className="dlab-stat-icon">🌐</span>
                    <span className="dlab-stat-label">Network</span>
                    <span className="dlab-stat-val">
                      {hasWall("net") ? <span className="dlab-val-good">{app.ip}</span> : <span className="dlab-val-bad">shared!</span>}
                    </span>
                  </div>
                  <div className={`dlab-stat ${focused === "cgroups" ? "dlab-stat-focus" : ""}`} style={{ "--fc": "#fdcb6e" }}>
                    <span className="dlab-stat-icon">⚖️</span>
                    <span className="dlab-stat-label">Memory</span>
                    <span className="dlab-stat-val">
                      {hasWall("cgroups") ? <span className="dlab-val-good">512 MB max</span> : <span className="dlab-val-bad">unlimited!</span>}
                    </span>
                  </div>
                  <div className={`dlab-stat ${focused === "seccomp" ? "dlab-stat-focus" : ""}`} style={{ "--fc": "#e17055" }}>
                    <span className="dlab-stat-icon">🛡️</span>
                    <span className="dlab-stat-label">Syscalls</span>
                    <span className="dlab-stat-val">
                      {hasWall("seccomp") ? <span className="dlab-val-good">44 blocked</span> : <span className="dlab-val-bad">all open!</span>}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wall buttons */}
        <div className="dlab-controls">
          <div className="dlab-controls-label">Click a wall to apply it — then read what it does</div>
          <div className="dlab-buttons">
            {LAYERS.map(layer => (
              <button
                key={layer.id}
                className={`dlab-wall-btn ${hasWall(layer.id) ? "dlab-wall-on" : ""} ${focused === layer.id ? "dlab-wall-focused" : ""}`}
                style={{ "--wc": layer.color }}
                onClick={() => toggleWall(layer.id)}
              >
                <span className="dlab-btn-icon">{layer.icon}</span>
                <span className="dlab-btn-name">{layer.name}</span>
                <span className="dlab-btn-state">{hasWall(layer.id) ? "ON" : "OFF"}</span>
              </button>
            ))}
          </div>

          {focusedLayer && (
            <div className="dlab-explain" style={{ "--ec": focusedLayer.color }}>
              <div className="dlab-explain-q">{focusedLayer.question}</div>
              <div className="dlab-explain-panels">
                <div className="dlab-panel dlab-panel-bad">
                  <span className="dlab-panel-label">❌ Without {focusedLayer.name}</span>
                  <p>{focusedLayer.withoutProblem}</p>
                </div>
                <div className="dlab-panel dlab-panel-good">
                  <span className="dlab-panel-label">✅ With {focusedLayer.name}</span>
                  <p>{focusedLayer.withSolution}</p>
                </div>
              </div>
              <div className="dlab-cmd"><span>$</span> {focusedLayer.command}</div>
            </div>
          )}

          {walls.length === 0 && !focused && (
            <div className="dlab-hint">👆 Click any wall above to start</div>
          )}
          {allApplied && (
            <div className="dlab-complete">
              🎉 All 5 walls applied. This is exactly how every Docker container runs in production.
            </div>
          )}
        </div>
      </div>

    </main>
  );
};
