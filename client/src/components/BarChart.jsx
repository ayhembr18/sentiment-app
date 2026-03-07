export default function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: "#888" }}>{d.value}</span>
          <div style={{
            width: "100%", background: d.color, borderRadius: "4px 4px 0 0",
            height: `${(d.value / max) * 56}px`, minHeight: d.value > 0 ? 4 : 0,
            transition: "height 0.6s ease"
          }} />
          <span style={{ fontSize: 10, color: "#aaa" }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}