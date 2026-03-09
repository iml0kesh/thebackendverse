import { JourneyLayout } from "../../components/journey-engine/JourneyLayout";

import { OSI_STEPS, OSI_PHASE_COLORS } from "./osiSteps";
import { OSI_STEP_DETAILS } from "./osiDetails";

export const OsiJourneyPage = () => {
  const stats = [
    { label: "Layers", value: "7", color: "#ff6b35" },
    { label: "Model Type", value: "Conceptual", color: "#ffd166" },
    { label: "Standard", value: "ISO/IEC", color: "#06d6a0" },
    { label: "Year", value: "1984", color: "#118ab2" },
  ];

  return (
    <JourneyLayout
      title="The OSI Model"
      subtitle="The 7 layers of networking. How data travels from your screen to the wire."
      breadcrumb="Networking Fundamentals"
      chips={["Application", "Transport", "Network", "Physical"]}
      stats={stats}
      steps={OSI_STEPS}
      phaseColors={OSI_PHASE_COLORS}
      details={OSI_STEP_DETAILS}
    />
  );
};
