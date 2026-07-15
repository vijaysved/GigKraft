import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { IconMessage2 } from "@tabler/icons-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import { submitFeedback } from "../api/feedback";
import { useAuth } from "../auth/AuthContext";
import { usePublicBrandThemeId } from "../theme/PublicBrandThemeContext";
import { useTheme } from "../theme/ThemeProvider";
import { resolveThemeId, THEMES } from "../theme/themes";

// Marketing routes — feedback button moves to bottom-left to avoid CTA clash.
const MARKETING_PATHS = new Set([
  "/",
  "/for-pros",
  "/for-homeowners",
  "/trust-graph",
  "/enterprise",
  "/pricing",
  "/about",
  "/careers",
  "/contact",
]);

// Marketing orange→lime gradient (matches marketing.css --mk-gradient palette)
const MARKETING_GRADIENT = "linear-gradient(135deg, #FF6B1A 0%, #84CC16 100%)";

// Returns true when the feedback button should sit bottom-left:
//  • Marketing pages (floating CTA on the right)
//  • Pro public profile  /pros/:id   — floating "Request a Quote" at bottom-right
//  • Home pro profile    /home/pros/:id — sticky bottom bar with "Request quote"
function useLeftPosition(pathname: string): boolean {
  if (MARKETING_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/pros/")) return true;
  if (pathname.startsWith("/home/pros/")) return true;
  return false;
}

export function FeedbackWidget() {
  const { user } = useAuth();
  const location = useLocation();
  const { themeId } = useTheme();
  const publicBrandThemeId = usePublicBrandThemeId();

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const showLeft = useLeftPosition(location.pathname);
  // On a public page with its own brand theme (e.g. a community), match that
  // theme instead of the viewer's personal one.
  const { brand } = THEMES[publicBrandThemeId ? resolveThemeId(publicBrandThemeId) : themeId];
  const btnGradient = showLeft ? MARKETING_GRADIENT : brand.brandGradient;

  function handleOpen() {
    setOpen(true);
    setSubmitted(false);
    setError("");
    setText("");
  }

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      await submitFeedback(text.trim(), location.pathname);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button — bottom-left on marketing pages, bottom-right in app */}
      <Box
        style={{
          position: "fixed",
          bottom: 24,
          ...(showLeft ? { left: 24 } : { right: 24 }),
          zIndex: 9999,
        }}
      >
        <Tooltip
          label="Send feedback"
          position={showLeft ? "right" : "left"}
          withArrow
        >
          <ActionIcon
            size={48}
            radius="xl"
            variant="filled"
            onClick={handleOpen}
            style={{
              background: btnGradient,
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            }}
            aria-label="Send feedback"
          >
            <IconMessage2 size={22} />
          </ActionIcon>
        </Tooltip>
      </Box>

      {/* Modal */}
      <Modal
        opened={open}
        onClose={() => setOpen(false)}
        title={
          <Group gap="xs">
            <IconMessage2 size={18} color={brand.accentPrimary} />
            <Text fw={600}>Share feedback</Text>
            {!user && (
              <Badge size="xs" color="gray" variant="light">
                Anonymous
              </Badge>
            )}
          </Group>
        }
        size="sm"
        centered
        styles={{
          content: { background: brand.bgSurface },
          header: { background: brand.bgSurface, borderBottom: `1px solid ${brand.border}` },
        }}
      >
        {submitted ? (
          <Stack gap="md" py="sm" align="center">
            <Text size="sm" ta="center" c="dimmed">
              Thanks for your feedback! We'll review it and follow up if needed.
            </Text>
            <Button variant="light" onClick={() => setOpen(false)}>
              Close
            </Button>
          </Stack>
        ) : (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Tell us what's on your mind — bugs, ideas, or anything else.
            </Text>
            <Textarea
              placeholder="What would you like us to know?"
              minRows={4}
              maxRows={8}
              autosize
              value={text}
              onChange={(e) => setText(e.currentTarget.value)}
              autoFocus
            />
            {error && (
              <Text size="xs" c="red">
                {error}
              </Text>
            )}
            <Group justify="flex-end">
              <Button variant="subtle" color="gray" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={loading}
                disabled={!text.trim()}
                style={{ background: btnGradient }}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
