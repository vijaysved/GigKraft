import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "./theme/theme.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { GOOGLE_CLIENT_ID } from "./config";
import { ThemeProvider } from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider
        clientId={GOOGLE_CLIENT_ID}
        onScriptLoadError={() => console.error("[GigKraft] Google script failed to load")}
      >
        <AuthProvider>
          <ThemeProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
);
