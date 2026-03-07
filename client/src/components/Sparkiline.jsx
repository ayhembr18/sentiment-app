export default function Sparkline({ reviews }) {
  const pts = [...reviews].reverse().slice(0, 20);
  if (pts.length < 2) return <div style={{ color: "#555", fontSize: 12 }}>Pas assez de données</div>;

  const scores = pts.map(r => r.score ?? 0);
  const W = 280, H = 50, pad = 4;
  const minS  = Math.min(...scores), maxS = Math.max(...scores);
  const range = maxS - minS || 1;

  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - ((s - minS) / range) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#ff4d6d" />
          <stop offset="50%"  stopColor="#ffd166" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#sparkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {scores.map((s, i) => {
        const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
        const y = H - pad - ((s - minS) / range) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={3} fill={s >= 0 ? "#00e5a0" : "#ff4d6d"} />;
      })}
    </svg>
  );
}