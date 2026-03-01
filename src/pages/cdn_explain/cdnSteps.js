export const CDN_STEPS = [
    { id: "user", icon: "👤", label: "User Request", phase: "Client" },
    { id: "dns", icon: "📡", label: "DNS Resolution", phase: "Client" },
    { id: "edge-select", icon: "🗺️", label: "Edge Selection", phase: "CDN" },
    { id: "edge-node", icon: "⚡", label: "Edge Node", phase: "CDN" },
    { id: "cache-check", icon: "🔍", label: "Cache Check", phase: "CDN" },
    { id: "cache-hit", icon: "✅", label: "Cache Hit", phase: "CDN" },
    { id: "origin", icon: "🖥️", label: "Origin Server", phase: "Origin" },
    { id: "cache-store", icon: "💾", label: "Cache & Store", phase: "Origin" },
    { id: "deliver", icon: "📦", label: "Deliver to User", phase: "Response" },
    { id: "invalidate", icon: "🔄", label: "Cache Invalidation", phase: "Management" }
]

export const PHASE_COLORS = {
    Client: "#ffd166",
    CDN: "#06d6a0",
    Origin: "#ff6b35",
    Response: "#118ab2",
    Management: "#a29bfe"
}