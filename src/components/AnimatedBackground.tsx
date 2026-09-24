export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="bg-grid absolute inset-0 opacity-[0.35]" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_10%,var(--background)_85%)]" />
      <div className="digit-rain" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="digit-col"
            style={{
              left: `${(i + 0.5) * (100 / 14)}%`,
              animationDelay: `${(i % 7) * 1.6}s`,
              animationDuration: `${14 + (i % 5) * 3}s`,
            }}
          >
            {Array.from({ length: 18 })
              .map((_, j) => (((i * 7 + j * 13 + i * j) % 5) % 2 ? "1" : "0"))
              .join(" ")}
          </span>
        ))}
      </div>
    </div>
  );
}
