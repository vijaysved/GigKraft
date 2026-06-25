import {
  Alert,
  Avatar,
  Badge,
  Button,
  Center,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconLock, IconUserCheck, IconUsers } from "@tabler/icons-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CircleSearchBar } from "./components/CircleSearchBar";
import { CircleSearchResults } from "./components/CircleSearchResults";
import { useCircleSearch } from "./hooks/useCircleSearch";

import { getAccessToken } from "../../api/tokens";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../../auth/AuthContext";
import { CirclePublicProCard } from "./components/CirclePublicProCard";
import { useCircle } from "./hooks/useCircle";

export function CircleLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { status } = useAuth();
  const { circle, loading, error, refetch } = useCircle(slug!);
  const { results, searching, runSearch, query } = useCircleSearch(slug!);
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [followError, setFollowError] = useState<string | null>(null);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (error || !circle) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text fw={600}>Circle not found</Text>
          <Text c="dimmed" size="sm">This link may be invalid or the circle has been deactivated.</Text>
        </Stack>
      </Center>
    );
  }

  async function requestFollow() {
    if (status !== "authenticated") {
      navigate(`/login?next=/circle/${slug}`);
      return;
    }
    setFollowing(true);
    setFollowError(null);
    try {
      const token = getAccessToken();
      const r = await fetch(`${API_BASE_URL}/api/circles/${slug}/follow`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) {
        const d = (await r.json()) as { detail?: string };
        throw new Error(d.detail ?? "Failed to send follow request.");
      }
      refetch();
    } catch (e) {
      setFollowError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setFollowing(false);
    }
  }

  const isFullAccess = circle.follow_status === "approved" || circle.follow_status === "curator";

  return (
    <Stack gap="xl" p="xl" maw={900} mx="auto" py={48}>
      {/* Header */}
      <Stack gap="sm" align="center" ta="center">
        <Avatar
          src={circle.curator_avatar_url}
          size={80}
          radius="50%"
          color="teal"
        >
          {circle.curator_name[0]?.toUpperCase()}
        </Avatar>
        <Title order={2}>{circle.curator_name}'s Circle of Trusted Pros</Title>
        <Badge
          color="teal"
          variant="light"
          leftSection={<IconUsers size={13} />}
          size="lg"
        >
          {circle.pro_count} trusted pro{circle.pro_count !== 1 ? "s" : ""}
        </Badge>
      </Stack>

      {isFullAccess && (
        <CircleSearchBar onSearch={runSearch} loading={searching} />
      )}

      {/* Access gate */}
      {!isFullAccess && (
        <Stack
          align="center"
          gap="md"
          p="xl"
          style={{
            border: "1px dashed var(--mantine-color-gray-4)",
            borderRadius: "var(--mantine-radius-md)",
            background: "var(--mantine-color-gray-0)",
          }}
        >
          <IconLock size={32} color="var(--mantine-color-gray-5)" />

          {circle.follow_status === null && (
            <>
              <Text fw={600} ta="center">Sign in to request access</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                {circle.curator_name}'s Circle is private. Sign in and request to follow to see their trusted pros.
              </Text>
              <Button
                radius="xl"
                style={{ background: "var(--gk-brand-gradient)" }}
                onClick={() => navigate(`/login?next=/circle/${slug}`)}
              >
                Sign in
              </Button>
            </>
          )}

          {circle.follow_status === "none" && (
            <>
              <Text fw={600} ta="center">Request access to this Circle</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                {circle.curator_name} will review your request and approve access to their {circle.pro_count} trusted pro{circle.pro_count !== 1 ? "s" : ""}.
              </Text>
              {followError && <Alert color="red" variant="light" w="100%" maw={400}>{followError}</Alert>}
              <Button
                radius="xl"
                leftSection={<IconUserCheck size={16} />}
                loading={following}
                style={{ background: "var(--gk-brand-gradient)" }}
                onClick={requestFollow}
              >
                Request to Follow
              </Button>
            </>
          )}

          {circle.follow_status === "pending" && (
            <>
              <Text fw={600} ta="center">Request pending</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Your request to follow {circle.curator_name}'s Circle is waiting for approval. You'll be notified once it's reviewed.
              </Text>
              <Badge color="yellow" variant="light" size="lg">Awaiting approval</Badge>
            </>
          )}

          {circle.follow_status === "rejected" && (
            <>
              <Text fw={600} ta="center">Access not approved</Text>
              <Text size="sm" c="dimmed" ta="center" maw={400}>
                Your request to follow this Circle was not approved. You can contact {circle.curator_name} directly for more information.
              </Text>
            </>
          )}
        </Stack>
      )}

      {/* Full pro list — approved followers and curator */}
      {isFullAccess && (
        query ? (
          <CircleSearchResults
            results={results}
            searching={searching}
            circleName={circle.curator_name}
            slug={slug!}
            showTier2Prompt={false}
          />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {circle.pros.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl" style={{ gridColumn: "1 / -1" }}>
                {circle.curator_name} hasn't added any pros yet. Check back soon!
              </Text>
            ) : (
              circle.pros.map((cp) => (
                <CirclePublicProCard
                  key={cp.id}
                  cp={cp}
                  slug={slug!}
                  curatorName={circle.curator_name}
                />
              ))
            )}
          </SimpleGrid>
        )
      )}
    </Stack>
  );
}
