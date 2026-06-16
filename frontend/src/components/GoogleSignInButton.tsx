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
          console.log("[GK Auth] Google onSuccess fired, credential present:", !!credential);
          if (!credential) {
            console.error("[GK Auth] No credential returned from Google");
            onError?.("Google did not return a credential.");
            return;
          }
          try {
            console.log("[GK Auth] Calling onSuccess handler with idToken...");
            await onSuccess(credential);
            console.log("[GK Auth] onSuccess handler completed");
          } catch (err) {
            console.error("[GK Auth] onSuccess handler threw:", err);
            onError?.("Google sign-in failed.");
          }
        }}
        onError={() => {
          console.error("[GK Auth] Google onError fired");
          onError?.("Google sign-in failed.");
        }}
      />
    </div>
  );
}
