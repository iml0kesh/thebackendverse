import { useState } from "react";
import { JourneyHero } from "../../components/journey-engine/JourneyHero";
import { CodeBlock } from "../../components/journey-engine/CodeBlock";
import "../../../public/css-files/DockerInteractive.css";

const ISOLATION_LAYERS = [
  {
    id: "pid",
    title: "PID Namespace",
    icon: "🪪",
    color: "#a29bfe",
    desc: "Isolates the process tree. The application inside the container thinks it is Process ID 1, entirely unaware of the actual host processes.",
    code: `# Host sees the real process\n$ ps -ef | grep node\nroot     14328  0.1 node server.js\n\n# Container only sees itself\n$ docker exec -it my-app ps\nPID   USER     COMMAND\n  1   root     node server.js`,
  },
  {
    id: "mount",
    title: "Mount Namespace (UnionFS)",
    icon: "📂",
    color: "#fd79a8",
    desc: "Gives the container its own distinct root directory (/). Uses a Copy-on-Write overlay filesystem so the container thinks it has a full, private hard drive.",
    code: `# The container's root is actually just a folder on the host\nlowerdir=/var/lib/docker/overlay2/<image_layer>\nupperdir=/var/lib/docker/overlay2/<container_diff>\n\n# But inside, it looks like a fresh OS\n$ ls /\nbin  boot  dev  etc  home  lib  opt  root  usr  var`,
  },
  {
    id: "net",
    title: "Network Namespace",
    icon: "🌐",
    color: "#00b894",
    desc: "Provides an isolated network stack. The container gets its own IP address, loopback interface (localhost), and routing table.",
    code: `# The container gets its own virtual ethernet interface\n$ ip addr show eth0\ninet 172.17.0.2/16 scope global eth0\n\n# Host routes traffic to it via a bridge (docker0)\n$ iptables -t nat -L\nDNAT tcp -- anywhere anywhere tcp dpt:8080 to:172.17.0.2:80`,
  },
  {
    id: "cgroups",
    title: "Control Groups (Cgroups)",
    icon: "⚖️",
    color: "#0984e3",
    desc: "While namespaces limit what a container can *see*, cgroups limit what a container can *use*. Prevents a container from consuming 100% of host RAM/CPU.",
    code: `# Limit RAM to 512MB\n$ docker run --memory="512m" my-app\n\n# Linux kernel strictly enforces this:\n$ cat /sys/fs/cgroup/memory/docker/<id>/memory.limit_in_bytes\n536870912\n# If exceeded, the kernel OOM Killer terminates the container.`,
  },
  {
    id: "seccomp",
    title: "Seccomp & Capabilities",
    icon: "🛡️",
    color: "#d63031",
    desc: "Strips away dangerous root privileges. Blocks the container from executing sensitive system calls like changing the system clock, loading kernel modules, or mounting fake disks.",
    code: `# 44 of ~300 Linux syscalls are blocked by default\n\n# Trying to change the host clock from inside:\n$ date -s "1 Jan 2030"\ndate: cannot set date: Operation not permitted\n\n# The CAP_SYS_TIME capability was intentionally dropped!`,
  },
];

// A reusable sub-component to render our 3 separate instances
const ContainerInstance = ({ name, hostPid, ip, activeLayers }) => {
  const classes = [
    "app-container",
    activeLayers.pid ? "pid-active" : "",
    activeLayers.mount ? "mount-active" : "",
    activeLayers.net ? "net-active" : "",
    activeLayers.cgroups ? "cgroups-active" : "",
    activeLayers.seccomp ? "seccomp-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <h5>
        <span>📦 {name}</span>
        {activeLayers.seccomp && <span title="Secured">🛡️</span>}
      </h5>
      <div className="mini-status">
        <div className="mini-status-item stat-pid">
          <span className="stat-icon">🪪</span>{" "}
          <span>{activeLayers.pid ? "PID: 1" : `PID: ${hostPid}`}</span>
        </div>
        <div className="mini-status-item stat-mount">
          <span className="stat-icon">📂</span>{" "}
          <span>{activeLayers.mount ? "/ (Private)" : "Host Drive"}</span>
        </div>
        <div className="mini-status-item stat-net">
          <span className="stat-icon">🌐</span>{" "}
          <span>{activeLayers.net ? ip : "Host Network"}</span>
        </div>
        <div className="mini-status-item stat-cgroups">
          <span className="stat-icon">⚖️</span>{" "}
          <span>{activeLayers.cgroups ? "Capped 512MB" : "Unlimited"}</span>
        </div>
      </div>
    </div>
  );
};

export const DockerJourneyPage = () => {
  const [started, setStarted] = useState(false);
  const [activeLayers, setActiveLayers] = useState({});

  const handleStart = () => {
    setStarted(true);
  };

  const toggleLayer = (layerId) => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  return (
    <main>
      <JourneyHero
        title="How Docker Isolates Containers"
        subtitle="A container isn't a virtual machine. It's just a normal process wrapped in invisible walls, locked doors, and fences. Build the box yourself."
        onStart={handleStart}
        chips={["Visual Interactive", "Namespaces", "Cgroups", "Seccomp"]}
        breadcrumb="Infrastructure"
      />

      {started && (
        <div className="docker-interactive-page">
          <div className="docker-workspace">
            {/* Left Column: Controls */}
            <div className="docker-controls">
              {ISOLATION_LAYERS.map((layer) => {
                const isActive = activeLayers[layer.id];
                return (
                  <div
                    key={layer.id}
                    className={`control-card ${isActive ? "active" : ""}`}
                    style={{ "--color": layer.color }}
                    onClick={() => toggleLayer(layer.id)}
                  >
                    <div className="control-header">
                      <div className="control-icon">{layer.icon}</div>
                      <h3 className="control-title">{layer.title}</h3>
                    </div>
                    {isActive && (
                      <div className="control-details">
                        <p>{layer.desc}</p>
                        <CodeBlock code={layer.code} language="bash" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Visualizer */}
            <div className="docker-visualizer">
              <div className="vis-title">
                <span>The Host Machine (Your Laptop / Server)</span>
              </div>
              <p className="vis-subtitle">
                Watch what happens when you activate isolation layers
              </p>

              <div className="server-chassis">
                {/* APPLICATIONS LAYER */}
                <div className="apps-layer">
                  <div className="app-pill">Node App</div>
                  <div className="app-pill">Python App</div>
                  <div className="app-pill">Redis</div>
                </div>

                {/* CONTAINERS */}
                <div className="docker-layer">
                  <div className="docker-layer-header">📦 Containers</div>

                  <div className="containers-grid">
                    <ContainerInstance
                      name="Node"
                      hostPid="14328"
                      ip="172.17.0.2"
                      activeLayers={activeLayers}
                    />
                    <ContainerInstance
                      name="Python"
                      hostPid="14329"
                      ip="172.17.0.3"
                      activeLayers={activeLayers}
                    />
                    <ContainerInstance
                      name="Redis"
                      hostPid="14330"
                      ip="172.17.0.4"
                      activeLayers={activeLayers}
                    />
                  </div>
                </div>

                {/* DOCKER ENGINE */}
                <div className="engine-layer">🐳 Docker Engine</div>

                {/* ISOLATION WALL */}
                <div
                  className={`isolation-wall ${
                    Object.keys(activeLayers).length ? "built" : ""
                  }`}
                >
                  <div className="wall-text">
                    {Object.keys(activeLayers).length
                      ? "🧱 THE LINUX KERNEL WALL 🧱"
                      : "🔓 NO ISOLATION"}
                  </div>
                </div>

                {/* HOST OS */}
                <div className="host-os-layer">
                  <span className="layer-label">
                    🖥️ Host OS Processes (Ubuntu 22.04)
                  </span>

                  <div
                    className={`host-processes ${activeLayers.pid ? "isolated" : ""}`}
                  >
                    <span className="process-pill">PID 981: Wi-Fi Driver</span>
                    <span className="process-pill">PID 4012: Postgres</span>
                    <span className="process-pill">PID 1: System Init</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
