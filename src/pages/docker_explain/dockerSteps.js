export const DOCKER_STEPS = [
    { id: "request", icon: "💻", label: "docker run", phase: "Client" },
    { id: "daemon", icon: "🐳", label: "Docker Daemon", phase: "Engine" },
    { id: "pid-ns", icon: "🪪", label: "PID Namespace", phase: "Isolation" },
    { id: "mount-ns", icon: "📂", label: "Mount Namespace", phase: "Isolation" },
    { id: "net-ns", icon: "🌐", label: "Network Namespace", phase: "Isolation" },
    { id: "cgroups", icon: "⚖️", label: "Control Groups", phase: "Resources" },
    { id: "security", icon: "🛡️", label: "Seccomp & Caps", phase: "Security" },
    { id: "running", icon: "🚀", label: "Container Running", phase: "Execution" }
];

export const DOCKER_PHASE_COLORS = {
    Client: "#ffd166",
    Engine: "#118ab2",
    Isolation: "#a29bfe",
    Resources: "#06d6a0",
    Security: "#ff6b35",
    Execution: "#fd79a8"
};