import { useState, useEffect } from "react";

// Tracks whether the viewport is at/above the desktop breakpoint used
// throughout styles.css (860px), so components can branch on layout
// without duplicating a matchMedia listener each time.

export default function useIsWide() {
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 860 : false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    const handler = (e) => setIsWide(e.matches);
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    setIsWide(mq.matches);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler));
  }, []);
  return isWide;
}
