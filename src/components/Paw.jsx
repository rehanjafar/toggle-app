// Small reusable paw-print icon used as a mascot motif throughout the app.

export default function Paw({ size = 14, filled = true, color = "#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth={filled ? 0 : 1.6}>
      <ellipse cx="12" cy="16" rx="6" ry="5" />
      <ellipse cx="4.5" cy="9" rx="2.3" ry="3" />
      <ellipse cx="9.5" cy="5.5" rx="2.3" ry="3" />
      <ellipse cx="14.5" cy="5.5" rx="2.3" ry="3" />
      <ellipse cx="19.5" cy="9" rx="2.3" ry="3" />
    </svg>
  );
}

