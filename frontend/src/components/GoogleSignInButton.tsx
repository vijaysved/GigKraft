import { Button } from "@mantine/core";
import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";

import { MOCK_GOOGLE_OAUTH } from "../config";

interface Props {
  label?: string;
  mockEmail?: string;
  onSuccess: (idToken: string) => Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
}

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.25-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
);

export function GoogleSignInButton({
  label = "Continue with Google",
  mockEmail,
  onSuccess,
  onError,
  disabled,
  fullWidth,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleMockClick() {
    const email = mockEmail ?? prompt("Mock Google: enter email to sign in as") ?? "";
    if (!email) return;
    setLoading(true);
    try {
      await onSuccess(`mock-google:${email}`);
    } catch {
      onError?.("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  if (MOCK_GOOGLE_OAUTH) {
    return (
      <Button
        variant="default"
        fullWidth={fullWidth}
        loading={loading}
        disabled={disabled}
        onClick={() => void handleMockClick()}
        leftSection={!loading && GOOGLE_ICON}
      >
        {label} (mock)
      </Button>
    );
  }

  // Real Google OAuth — renders Google's own button, styled to fill width.
  return (
    <div style={{ width: fullWidth ? "100%" : undefined, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : undefined }}>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) {
            onError?.("Google did not return a credential.");
            return;
          }
          setLoading(true);
          try {
            await onSuccess(credentialResponse.credential);
          } catch {
            onError?.("Google sign-in failed.");
          } finally {
            setLoading(false);
          }
        }}
        onError={() => onError?.("Google sign-in failed.")}
        width={fullWidth ? "100%" : undefined}
        text={label.toLowerCase().includes("up") ? "signup_with" : "signin_with"}
        shape="rectangular"
        size="large"
      />
    </div>
  );
}
