import { JourneyLayout } from "../../components/journey-engine/JourneyLayout";
import { DockerIsolationDemo } from "./DockerIsolationDemo";
import { DOCKER_STEPS, DOCKER_PHASE_COLORS } from "./dockerSteps";
import { DOCKER_STEP_DETAILS } from "./dockerDetails";

const DOCKER_STATS = [
  { label: "Kernel syscalls blocked",  value: "44+",   color: "#ff6b35" },
  { label: "Namespaces per container", value: "6",     color: "#a29bfe" },
  { label: "Shared image layers",      value: "CoW",   color: "#06d6a0" },
  { label: "Overhead vs bare metal",   value: "<1%",   color: "#ffd166" },
];

export const DockerJourneyPage = () => {
  return (
    <>
      <JourneyLayout
        title="How Docker Containers Are Isolated"
        subtitle="A container isn't a tiny VM. It's a regular process wrapped in six Linux kernel primitives. Click through every layer."
        breadcrumb="Infrastructure"
        chips={["Namespaces", "Cgroups", "OverlayFS", "Seccomp"]}
        stats={DOCKER_STATS}
        steps={DOCKER_STEPS}
        phaseColors={DOCKER_PHASE_COLORS}
        details={DOCKER_STEP_DETAILS}
      />
      <DockerIsolationDemo />
    </>
  );
};
