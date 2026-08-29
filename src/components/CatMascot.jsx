// Cat mascot that visually reacts to the user's best current habit streak.

export default function CatMascot({ streak, size = 78 }) {
  const stage = streak >= 30 ? 3 : streak >= 14 ? 2 : streak >= 3 ? 1 : 0;
  const purr = ["asleep", "one eye open", "purring", "zoomies"][stage];
  return (
    <div className="cat-mascot">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <ellipse cx="50" cy="62" rx="30" ry="26" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" />
        <path d="M24 40 L14 16 L38 32 Z" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M76 40 L86 16 L62 32 Z" fill="#1a1420" stroke="#ff2d78" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M25 34 L20 20 L33 30 Z" fill="#ff2d78" />
        <path d="M75 34 L80 20 L67 30 Z" fill="#ff2d78" />
        {stage < 2 ? (
          <>
            <path d="M36 58 Q41 53 46 58" stroke="#ffb3cf" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M54 58 Q59 53 64 58" stroke="#ffb3cf" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="41" cy="58" r="3.4" fill="#ff2d78" />
            <circle cx="59" cy="58" r="3.4" fill="#ff2d78" />
          </>
        )}
        <path d="M47 66 L53 66 L50 70 Z" fill="#ff2d78" />
        <path d={stage >= 1 ? "M42 72 Q50 78 58 72" : "M44 71 Q50 74 56 71"} stroke="#ffb3cf" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M50 70 Q30 68 16 72" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q30 74 16 76" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q70 68 84 72" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        <path d="M50 70 Q70 74 84 76" stroke="#ffb3cf" strokeWidth="1.2" fill="none" opacity="0.7" />
        {stage >= 1 && <circle cx="30" cy="63" r="4" fill="#ff2d78" opacity="0.35" />}
        {stage >= 1 && <circle cx="70" cy="63" r="4" fill="#ff2d78" opacity="0.35" />}
        {stage >= 2 && <path d="M76 78 Q92 70 88 54" stroke="#1a1420" strokeWidth="7" fill="none" strokeLinecap="round" />}
        {stage >= 3 && (
          <>
            <path d="M12 50 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill="#ff8fb3" />
            <path d="M88 45 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" fill="#ff2d78" />
          </>
        )}
      </svg>
      <div className="cat-mascot-label">{purr}</div>
    </div>
  );
}

