import { Box, Text } from "@mantine/core";
import { useCallback, useRef, useState } from "react";

export function HeroSlider() {
  const [pos, setPos] = useState(54);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const posFromEvent = useCallback((e: React.PointerEvent) => {
    if (!boxRef.current) return pos;
    const r = boxRef.current.getBoundingClientRect();
    return Math.max(2, Math.min(98, ((e.clientX - r.left) / r.width) * 100));
  }, [pos]);

  const onDown = (e: React.PointerEvent) => {
    setDragging(true);
    setPos(posFromEvent(e));
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => { if (dragging) setPos(posFromEvent(e)); };
  const onUp = () => setDragging(false);

  return (
    <Box
      ref={boxRef}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{
        position: "relative",
        height: 320,
        borderRadius: "var(--mantine-radius-lg)",
        overflow: "hidden",
        cursor: "ew-resize",
        touchAction: "none",
        userSelect: "none",
        border: "2px solid var(--gk-border)",
      }}
    >
      {/* BEFORE */}
      <Box
        style={{
          position: "absolute", inset: 0,
          background: "#B7B2AA",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        <Text style={{ fontSize: 48 }}>💧</Text>
        <Text fw={700} size="lg" style={{ color: "#3A3733" }}>Burst water heater</Text>
        <Text size="sm" style={{ color: "#3A3733", opacity: 0.8 }}>Flooded utility closet · day 0</Text>
        <Box
          style={{
            position: "absolute", bottom: 10, right: 12,
            padding: "4px 10px", borderRadius: 999,
            background: "rgba(0,0,0,.3)", color: "#fff",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
          }}
        >BEFORE 📷</Box>
      </Box>

      {/* AFTER (clipped) */}
      <Box
        style={{
          position: "absolute", inset: 0,
          clipPath: `inset(0 ${(100 - pos).toFixed(1)}% 0 0)`,
          background: "var(--gk-bg-sidebar)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          color: "var(--gk-text-sidebar)",
        }}
      >
        <Text style={{ fontSize: 48 }}>🔧</Text>
        <Text fw={700} size="lg">New unit · fully re-piped</Text>
        <Text size="sm" style={{ opacity: 0.85 }}>Sealed, pressure-tested · 5 hrs</Text>
        <Box
          style={{
            position: "absolute", top: 10, left: 12,
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 11px", borderRadius: 10,
            background: "var(--gk-bg-surface)", color: "var(--gk-bg-sidebar)",
            border: "1px solid var(--gk-border)",
            fontSize: 13, fontWeight: 700,
          }}
        >
          ✅ Endorsed by <span style={{ color: "var(--gk-accent-primary)", marginLeft: 4 }}>Dana R.</span>
        </Box>
        <Box
          style={{
            position: "absolute", bottom: 10, left: 12,
            padding: "4px 10px", borderRadius: 999,
            background: "var(--gk-accent-primary)", color: "var(--gk-bg-sidebar)",
            fontSize: 11, fontWeight: 700, letterSpacing: 1,
          }}
        >AFTER ✨</Box>
      </Box>

      {/* Handle */}
      <Box style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 3, background: "var(--gk-accent-primary)", transform: "translateX(-1.5px)" }}>
        <Box
          style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--gk-accent-primary)",
            border: "2px solid var(--gk-bg-surface)",
            display: "grid", placeItems: "center",
            color: "var(--gk-bg-sidebar)", fontWeight: 800, fontSize: 15,
          }}
        >⇄</Box>
      </Box>
    </Box>
  );
}
