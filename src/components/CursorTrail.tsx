import { useEffect } from "react";

const SPARKLES = ["✨", "⭐", "🌟", "💫", "⚽"];

// A very 90s sparkle trail that follows the mouse pointer.
export function CursorTrail() {
  useEffect(() => {
    let last = 0;
    function onMove(e: MouseEvent) {
      const now = Date.now();
      if (now - last < 45) return;
      last = now;

      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
      s.style.left = `${e.clientX}px`;
      s.style.top = `${e.clientY}px`;
      document.body.appendChild(s);
      window.setTimeout(() => s.remove(), 900);
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
