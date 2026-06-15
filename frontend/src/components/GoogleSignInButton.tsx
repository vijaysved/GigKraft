import { GoogleLogin } from "@react-oauth/google";

interface Props {
  label?: "signin_with" | "signup_with" | "continue_with";
  onSuccess: (idToken: string) => Promise<void>;
  onError?: (message: string) => void;
  fullWidth?: boolean;
}

export function GoogleSignInButton({ label = "continue_with", onSuccess, onError, fullWidth }: Props) {
  return (
    <div style={{ width: fullWidth ? "100%" : undefined }}>
      <GoogleLogin
        text={label}
        shape="rectangular"
        size="large"
        width={fullWidth ? "400" : undefined}
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
