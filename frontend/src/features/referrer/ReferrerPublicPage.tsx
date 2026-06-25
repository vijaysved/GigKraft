import {
  Alert,
  Avatar,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconUserCheck, IconUsers } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { API_BASE_URL } from "../../config";
import type { ReferrerPublicOut } from "./types";
import { FollowModal } from "./components/FollowModal";
import { ReferrerProCard } from "./components/ReferrerProCard";
import { RequestReferralModal } from "./components/RequestReferralModal";

export function ReferrerPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<ReferrerPublicOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [followerState, setFollowerState] = useState<{ follower_id: number; name: string } | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE_URL}/api/referrer/${slug}`, { credentials: "include" });
      if (!r.ok) throw new Error("Not found");
      const data = await r.json() as ReferrerPublicOut;
      setPage(data);
      setFollowerState(data.follower_state);
    } catch {
      setError("This page could not be found.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [slug]);

  useEffect(() => {
    if (page) {
      document.title = `${page.display_name}'s Trusted Pros · gigKraft.com`;
      return () => { document.title = "gigKraft.com"; };
    }
  }, [page?.display_name]);

  if (loading) return <Center h="100vh"><Loader /></Center>;

  if (error || !page) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="xs">
          <Text fw={600}>Page not found</Text>
          <Text c="dimmed" size="sm">This referrer page may not exist.</Text>
        </Stack>
      </Center>
    );
  }

  const isFollower = !!followerState;

  return (
    <>
      <Stack gap="xl" p="xl" maw={960} mx="auto" py={48}>
        {/* Header */}
        <Stack gap="sm" align="center" ta="center">
          <Avatar src={page.avatar_url || undefined} size={80} radius="50%" color="teal">
            {page.display_name[0]?.toUpperCase()}
          </Avatar>
          <Title order={2}>{page.display_name}'s Trusted Pros</Title>
          {page.bio && (
            <Text size="sm" c="dimmed" maw={480}>{page.bio}</Text>
          )}
          <Group gap="sm" justify="center">
            <Badge color="teal" variant="light" leftSection={<IconUsers size={13} />} size="lg">
              {page.follower_count} follower{page.follower_count !== 1 ? "s" : ""}
            </Badge>
            <Badge color="gray" variant="outline" size="lg">
              {page.referral_count} referral{page.referral_count !== 1 ? "s" : ""} sent
            </Badge>
          </Group>

          {!page.is_owner && (
            <Group gap="sm" mt="xs">
              {!isFollower ? (
                <Button
                  radius="xl"
                  leftSection={<IconUserCheck size={16} />}
                  style={{ background: "var(--gk-brand-gradient)" }}
                  onClick={() => setFollowOpen(true)}
                >
                  Follow
                </Button>
              ) : (
                <Alert color="teal" variant="light" py={6} px={12}>
                  Following as {followerState!.name}
                </Alert>
              )}
              {isFollower && (
                <Button
                  radius="xl"
                  variant="outline"
                  onClick={() => setRequestOpen(true)}
                >
                  Request a referral
                </Button>
              )}
            </Group>
          )}
        </Stack>

        {/* Pro grid */}
        {page.pros.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            {page.display_name} hasn't added any pros yet. Check back soon!
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {page.pros.map((pro) => (
              <ReferrerProCard
                key={pro.id}
                pro={pro}
                slug={slug!}
                referrerName={page.display_name}
                allPros={page.pros}
                isFollower={isFollower}
                onNeedFollow={() => setFollowOpen(true)}
              />
            ))}
          </SimpleGrid>
        )}

        <Text ta="center" size="xs" c="dimmed" mt="xl">
          Powered by <a href="https://gigkraft.com" style={{ color: "inherit" }}>gigKraft.com</a>
        </Text>
      </Stack>

      <FollowModal
        opened={followOpen}
        onClose={() => setFollowOpen(false)}
        slug={slug!}
        referrerName={page.display_name}
        onFollowed={(id, name) => setFollowerState({ follower_id: id, name })}
      />

      <RequestReferralModal
        opened={requestOpen}
        onClose={() => setRequestOpen(false)}
        slug={slug!}
        referrerName={page.display_name}
        selectedPro={null}
        pros={page.pros}
        onRequested={load}
      />
    </>
  );
}
