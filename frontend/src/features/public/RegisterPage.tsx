import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { IconHammer, IconHome } from "@tabler/icons-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { ApiError, register } from "../../api/endpoints";
import { GkLogo } from "../../brand/GkLogo";
import { WallpaperBackground } from "../../brand/WallpaperBackground";
import { useAuth } from "../../auth/AuthContext";
import { GoogleSignInButton } from "../../components/GoogleSignInButton";

type Role = "pro" | "homeowner";

export function RegisterPage() {
  const { status, loginWithPassword, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") {
    return <Navigate to="/" replace />;
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
      });
      await loginWithPassword(email, password);
      navigate(role === "pro" ? "/pro/onboarding" : "/home/discover", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box pos="relative" mih="100vh">
      <WallpaperBackground />
      <Center mih="100vh" p="md" pos="relative" style={{ zIndex: 1 }}>
        <Stack w={420} maw="100%">
          <Group justify="center" align="center">
            <GkLogo height={40} />
          </Group>

          <Paper withBorder shadow="md" p="lg" radius="lg" bg="var(--gk-bg-surface)">
            <Stack>
              <Title order={4}>Create account</Title>

              {!role ? (
                <Stack gap="sm">
                  <Text size="sm" c="dimmed">I am a…</Text>
                  <Group grow>
                    <UnstyledButton onClick={() => setRole("pro")}>
                      <Card withBorder radius="md" padding="md" style={{ cursor: "pointer", textAlign: "center" }}>
                        <Stack align="center" gap="xs">
                          <IconHammer size={32} color="var(--gk-accent-primary)" />
                          <Text fw={700}>Handyman Pro</Text>
                          <Text size="xs" c="dimmed">I do the work</Text>
                        </Stack>
                      </Card>
                    </UnstyledButton>
                    <UnstyledButton onClick={() => setRole("homeowner")}>
                      <Card withBorder radius="md" padding="md" style={{ cursor: "pointer", textAlign: "center" }}>
                        <Stack align="center" gap="xs">
                          <IconHome size={32} color="var(--gk-accent-secondary)" />
                          <Text fw={700}>Homeowner</Text>
                          <Text size="xs" c="dimmed">I need work done</Text>
                        </Stack>
                      </Card>
                    </UnstyledButton>
                  </Group>
                  <Divider label="or sign up with" labelPosition="center" />
                  <Stack gap="xs">
                    <Text size="xs" c="dimmed" ta="center">Choose your role first, then Google:</Text>
                    <Group grow>
                      <GoogleSignInButton
                        label="Pro"
                        onSuccess={(idToken) => loginWithGoogle(idToken, "pro").then(() =>
                          navigate("/pro/onboarding", { replace: true })
                        )}
                        onError={(msg) => setError(msg)}
                      />
                      <GoogleSignInButton
                        label="Homeowner"
                        onSuccess={(idToken) => loginWithGoogle(idToken, "homeowner").then(() =>
                          navigate("/home/discover", { replace: true })
                        )}
                        onError={(msg) => setError(msg)}
                      />
                    </Group>
                  </Stack>
                  <Text size="sm" ta="center">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </Text>
                </Stack>
              ) : (
                <form onSubmit={handleRegister}>
                  <Stack>
                    <Group gap="xs" style={{ background: "var(--gk-bg-canvas)", borderRadius: 8, padding: "8px 12px" }}>
                      {role === "pro" ? <IconHammer size={16} /> : <IconHome size={16} />}
                      <Text size="sm" fw={600}>{role === "pro" ? "Handyman Pro" : "Homeowner"}</Text>
                      <Button size="xs" variant="subtle" ml="auto" onClick={() => setRole(null)}>Change</Button>
                    </Group>

                    {error && <Alert color="red" variant="light">{error}</Alert>}

                    <Group grow>
                      <TextInput
                        label="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.currentTarget.value)}
                      />
                      <TextInput
                        label="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.currentTarget.value)}
                      />
                    </Group>
                    <TextInput
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      required
                    />
                    <PasswordInput
                      label="Password"
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      required
                    />
                    <Button type="submit" loading={submitting} fullWidth>
                      Create account
                    </Button>
                    <Text size="sm" ta="center">
                      Already have an account? <Link to="/login">Sign in</Link>
                    </Text>
                  </Stack>
                </form>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Center>
    </Box>
  );
}
