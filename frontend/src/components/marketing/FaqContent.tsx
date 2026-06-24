import { Accordion, Badge, Stack, Text } from "@mantine/core";

const SECTIONS: { audience: string; color: string; items: { q: string; a: string }[] }[] = [
  {
    audience: "Visitors & Searchers",
    color: "blue",
    items: [
      {
        q: "What is GigKraft.com?",
        a: "GigKraft is a dedicated digital portfolio and professional trust network built specifically for the skilled trades and hands-on economy. Think of us as a visual, portable alternative to text-based professional sites like LinkedIn — built entirely around proving craftsmanship through real before/after project photos and structured client feedback.",
      },
      {
        q: "Is GigKraft a lead-generation platform like Angi, Yelp, or Thumbtack?",
        a: "No. GigKraft is not a predatory lead-generation directory. We do not charge tradespeople pay-per-lead fees, hide profiles behind ad spend algorithms, or trap a professional's hard-earned reputation inside our ecosystem. We are a software-as-a-service (SaaS) platform that lets professionals host, own, and share their professional identity.",
      },
      {
        q: "How do I search for a Pro on GigKraft?",
        a: "You can browse Pro profiles by trade type and location using the search page at GigKraft.com/search. Profiles display before/after photo galleries, structured client feedback, self-declared credentials, and response-time estimates so you can compare professionals before reaching out.",
      },
      {
        q: 'What is a "Project Trust Submission"?',
        a: "When a professional requests a recommendation from you on GigKraft, you won't just leave an anonymous comment. You will be asked to confirm basic structural details about the project (e.g., type of job, general budget size) and answer a few simple yes/no questions about timing, pricing transparency, and cleanliness. You can also upload photos of the finished job to back up your recommendation.",
      },
    ],
  },
  {
    audience: "For Pros",
    color: "orange",
    items: [
      {
        q: 'What is a "Portable Reputation"?',
        a: "Traditional consumer review platforms own the reviews clients leave for you. If you change companies, relocate, or go independent, you lose your reviews. On GigKraft, your portfolio and verified project metrics belong entirely to you. You build it once, own the data, and take it with you wherever your career moves.",
      },
      {
        q: "Why doesn't GigKraft use 5-star ratings?",
        a: 'Generic star ratings are fragile, easy to manipulate, and often penalize workers for things outside their control. Instead, GigKraft uses Structured, Contextual Recommendations — measured through verifiable project scopes, binary indicators (e.g., "Was the project completed on time?", "Was cleanup up to standard?"), and visual proof uploaded by your customers.',
      },
      {
        q: "How do Before/After galleries work?",
        a: "Our mobile-first platform lets you quickly upload photo transformations right from the job site. You can tag photos by specific equipment specialties, brands, or niches (e.g., tankless water heaters, smart thermostats) so potential clients or enterprise hiring partners can see exact visual proof of your craftsmanship.",
      },
      {
        q: "What does GigKraft charge?",
        a: "The core Pro subscription is $24.99/month (or save 17% with annual billing). This gives you an active, published profile, unlimited Krafts, homeowner endorsements, zipcode standing, and full data export. See the Pricing page for a complete feature breakdown.",
      },
      {
        q: "How do I get started as a Pro?",
        a: 'Head to GigKraft.com/register. Sign in with Google and you\'ll be set up as a free Member. From there, click "Upgrade to Pro" to subscribe and unlock your published profile. Onboarding takes about 5 minutes — add your trade, bio, skills, and service area, then start posting Krafts.',
      },
      {
        q: "What happens to my profile data if I cancel?",
        a: "Your account and data are retained for 90 days after cancellation in case you want to reactivate. You can export your full profile at any time before or after canceling. After 90 days of inactivity, your profile is removed from search results but your data is archived for an additional 180 days before permanent deletion.",
      },
    ],
  },
  {
    audience: "For Members",
    color: "violet",
    items: [
      {
        q: "What is a GigKraft Member?",
        a: "A Member is a free, registered GigKraft account. You've signed in with Google and established your identity on the platform — but you haven't subscribed to a paid Pro plan yet. Members can browse, build a basic profile, and explore the platform before committing.",
      },
      {
        q: "What can I do as a free Member?",
        a: "As a Member you can browse all published Pro profiles and Krafts, build a basic GigKraft profile with your Google-verified identity, preview what your Pro profile would look like before subscribing, and access your account settings and billing options.",
      },
      {
        q: "What's locked until I upgrade to Pro?",
        a: "Publishing Krafts (before/after job galleries), appearing in homeowner search results, earning structured client endorsements, and seeing your zipcode performance standing are all Pro-only features.",
      },
      {
        q: "How do I upgrade from Member to Pro?",
        a: 'From any page while logged in, click "Upgrade to Pro" or navigate to GigKraft.com/subscribe. Enter your payment info via Stripe — the upgrade is instant. Your profile goes live immediately after payment confirms.',
      },
      {
        q: "Is there a free trial?",
        a: "Not currently. The free Member tier lets you build and preview your profile before you subscribe — that's our way of letting you see the product before paying.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. GigKraft Pro is a month-to-month subscription with no long-term commitment. You can cancel from your Account — Billing tab and your Pro access remains active through the end of the billing period.",
      },
    ],
  },
  {
    audience: "For Homeowners",
    color: "teal",
    items: [
      {
        q: "How do I find a Pro on GigKraft?",
        a: "Use the search page at GigKraft.com/search to browse by trade and location. Each Pro's profile shows their before/after Krafts, structured client feedback, self-declared credentials, and response time. Contact them directly using the info on their profile.",
      },
      {
        q: "Does GigKraft verify the credentials of Pros on the platform?",
        a: "No. GigKraft does not verify, authenticate, or cross-reference any documents uploaded by Professionals. Credentials (licenses, insurance certificates, OSHA records) are self-declared by the Pro and displayed for informational purposes only. You must independently verify a Professional's licensing, bonding, and insurance before signing a contract or allowing work to begin.",
      },
      {
        q: "Does GigKraft guarantee the work of Professionals on the site?",
        a: "No. GigKraft is a portfolio and trust-data platform — not a general contractor. We provide visual history and structured client feedback to help you make well-informed choices, but we do not oversee, manage, warranty, or insure any projects arranged between independent users.",
      },
      {
        q: "How do I leave a recommendation for a Pro?",
        a: "If a Pro requests a recommendation from you, you'll receive a direct link. You'll be asked to confirm a few structural project details and answer simple yes/no questions about the experience. You can also upload photos of the finished job. This structured format creates a more trustworthy and useful record than a free-text review.",
      },
      {
        q: "What if I have a dispute with a Pro I found on GigKraft?",
        a: "GigKraft is not a party to any agreement between a homeowner and a professional. Disputes are between you and the Pro directly. We recommend documenting all agreements in writing before work begins. For serious issues, contact your state contractor licensing board or consult with an attorney.",
      },
      {
        q: "Is my personal information shared with Pros?",
        a: "Your contact information is only shared with a Pro when you choose to initiate contact. GigKraft does not sell your data to third parties or share it with Pros for cold outreach. See our Privacy Policy for full details.",
      },
    ],
  },
];

export function FaqContent() {
  return (
    <Stack gap="xl">
      {SECTIONS.map((section) => (
        <Stack key={section.audience} gap="sm">
          <Badge color={section.color} size="lg" variant="light" w="fit-content">
            {section.audience}
          </Badge>
          <Accordion variant="separated" radius="md">
            {section.items.map((item) => (
              <Accordion.Item key={item.q} value={item.q}>
                <Accordion.Control>
                  <Text size="sm" fw={600}>{item.q}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.7 }}>{item.a}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Stack>
      ))}
    </Stack>
  );
}
