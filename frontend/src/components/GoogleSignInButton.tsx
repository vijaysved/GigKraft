import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

interface Props {
  label?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: (idToken: string) => Promise<void>;
  onError?: (message: string) => void;
  fullWidth?: boolean;
  shape?: "rectangular" | "pill" | "circle" | "square";
  size?: "large" | "medium" | "small";
}

export function GoogleSignInButton({ label = "continue_with", onSuccess, onError, fullWidth, shape = "rectangular", size = "large" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(300);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay one microtask so StrictMode's double-mount settles before GSI init
    const id = setTimeout(() => setMounted(true), 0);
    return () => { clearTimeout(id); setMounted(false); };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    // Debounced: a modal's open transition resizes this container across many
    // animation frames, and each width change forces GSI to fully redraw the
    // button — without debouncing, that reads as the button "flashing"/reloading
    // repeatedly while the modal animates open. Settle on the final width instead.
    let timeout: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (!w) return;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setButtonWidth((prev) => (Math.abs(prev - w) > 1 ? Math.round(w) : prev));
      }, 150);
    });
    observer.observe(containerRef.current);
    return () => { clearTimeout(timeout); observer.disconnect(); };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: fullWidth ? "100%" : undefined,
      }}
    >
      {mounted && (
        <GoogleLogin
          text={label}
          shape={shape}
          size={size}
          width={buttonWidth}
          logo_alignment="left"
          onSuccess={async ({ credential }) => {
            if (!credential) { onError?.("Google did not return a credential."); return; }
            try { await onSuccess(credential); }
            catch { onError?.("Google sign-in failed."); }
          }}
          onError={() => onError?.("Google sign-in failed.")}
        />
      )}
    </div>
  );
}
