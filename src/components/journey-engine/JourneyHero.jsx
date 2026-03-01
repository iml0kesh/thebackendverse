export const JourneyHero = ({ title, subtitle, onStart }) => {
  return (
    <section className="hero">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button onClick={onStart}>Start Journey →</button>
    </section>
  );
}
