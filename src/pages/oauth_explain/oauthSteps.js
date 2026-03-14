export const OAUTH_STEPS = [
    { id: "initiate", icon: "🚪", label: "Auth Request", phase: "Initiation" },
    { id: "consent", icon: "👤", label: "User Consent", phase: "User Action" },
    { id: "auth-code", icon: "🎫", label: "Auth Code Grant", phase: "Delegation" },
    { id: "token-exchange", icon: "🤝", label: "Token Exchange", phase: "Verification" },
    { id: "token-issue", icon: "🔑", label: "Token Issuance", phase: "Verification" },
    { id: "resource", icon: "🔓", label: "Resource Access", phase: "Data Access" },
];

export const OAUTH_PHASE_COLORS = {
    "Initiation": "#118ab2",
    "User Action": "#ffd166",
    "Delegation": "#06d6a0",
    "Verification": "#a29bfe",
    "Data Access": "#ff6b35",
};