import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useRef, useState } from "react";

interface Props {
  label?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: (idToken: string) => Promise<void>;
  onError?: (message: string) => void;
  fullWidth?: boolean;
}

export function GoogleSignInButton({ label = "continue_with", onSuccess, onError, fullWidth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(300);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setButtonWidth(Math.round(w));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: fullWidth ? "100%" : undefined,
      }}
    >
      <GoogleLogin
        text={label}
        shape="rectangular"
        size="large"
        width={buttonWidth}
        logo_alignment="left"
        onSuccess={async ({ credential }) => {
          if (!credential) { onError?.("Google did not return a credential."); return; }
          try { await onSuccess(credential); }
          catch { onError?.("Google sign-in failed."); }
        }}
        onError={() => onError?.("Google sign-in failed.")}
      />
    </div>
  );
}
