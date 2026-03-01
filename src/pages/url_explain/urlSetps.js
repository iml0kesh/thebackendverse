export const URL_steps = [
    { id: "browser", icon: "🌐", label: "Browser", phase: "Client" },
    { id: "cache", icon: "⚡", label: "Cache Check", phase: "Client" },
    { id: "dns", icon: "📡", label: "DNS Lookup", phase: "DNS" },
    { id: "tcp", icon: "🔗", label: "TCP Handshake", phase: "Connection" },
    { id: "tls", icon: "🔒", label: "TLS Handshake", phase: "Connection" },
    { id: "internet", icon: "🌍", label: "Internet", phase: "Network" },
    { id: "loadbalancer", icon: "⚖️", label: "Load Balancer", phase: "Server" },
    { id: "webserver", icon: "🖥️", label: "Web Server", phase: "Server" },
    { id: "appserver", icon: "⚙️", label: "App Server", phase: "Server" },
    { id: "database", icon: "🗄️", label: "Database", phase: "Server" },
    { id: "response", icon: "📦", label: "Response", phase: "Response" },
    { id: "render", icon: "🎨", label: "Browser Render", phase: "Client" },
]

export const URL_phaseColors = {
    Client: "#ffd166",
    DNS: "#06d6a0",
    Connection: "#118ab2",
    Network: "#a29bfe",
    Server: "#ff6b35",
    Response: "#fd79a8",
}