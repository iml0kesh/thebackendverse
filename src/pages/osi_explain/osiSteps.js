export const OSI_STEPS = [
    { id: "application", icon: "🖥️", label: "Layer 7: Application", phase: "Software" },
    { id: "presentation", icon: "🎁", label: "Layer 6: Presentation", phase: "Software" },
    { id: "session", icon: "🤝", label: "Layer 5: Session", phase: "Software" },
    { id: "transport", icon: "🚚", label: "Layer 4: Transport", phase: "Transport" },
    { id: "network", icon: "🌐", label: "Layer 3: Network", phase: "Hardware" },
    { id: "datalink", icon: "🔗", label: "Layer 2: Data Link", phase: "Hardware" },
    { id: "physical", icon: "🔌", label: "Layer 1: Physical", phase: "Hardware" },
];

export const OSI_PHASE_COLORS = {
    Software: "#ff6b35",
    Transport: "#ffd166",
    Hardware: "#118ab2",
};