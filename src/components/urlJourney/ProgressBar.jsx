import "./urlJourney.css";

export const ProgressBar = ({ steps, currentStep }) => {
  return (
    <div className="progress-container">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`progress-step ${
            index === currentStep
              ? "active"
              : index < currentStep
                ? "completed"
                : ""
          }`}
        >
          {step.title}
        </div>
      ))}
    </div>
  );
};
