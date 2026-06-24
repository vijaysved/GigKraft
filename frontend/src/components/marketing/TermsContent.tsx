import { Divider, List, Stack, Text, Title } from "@mantine/core";

export function TermsContent() {
  return (
    <Stack gap="xl">

      {/* ── T&C ── */}
      <Stack gap="xs">
        <Title order={2}>GigKraft.com Terms & Conditions</Title>
        <Text size="sm" c="dimmed">Last Updated: June 24, 2026</Text>
        <Text size="sm">
          Welcome to GigKraft.com (the "Platform"). These Terms & Conditions ("Terms") govern your access to and
          use of the website, mobile applications, and services provided by GigKraft Inc. ("GigKraft," "we," "us,"
          or "our"). By registering for an account, uploading content, or using the Platform in any capacity, you
          agree to be bound by these Terms. If you do not agree, you may not use the Platform.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>1. The Nature of Our Services</Title>
        <Text size="sm">
          GigKraft is a professional networking and digital portfolio platform for skilled tradespeople
          ("Professionals"). GigKraft is <strong>not</strong> a contractor, employment agency, or directory
          service. We do not perform trade services, we do not employ Professionals, and we do not act as an
          agent for any user. Any agreement, transaction, or interaction between a Professional and a hiring
          party, homeowner, general contractor, or enterprise client ("Clients") is strictly between those parties.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>2. User Accounts & Eligibility</Title>
        <List size="sm" spacing="xs">
          <List.Item><strong>Age:</strong> You must be at least 18 years old to create an account.</List.Item>
          <List.Item>
            <strong>Accuracy:</strong> You agree to provide accurate, current, and complete information during
            registration and to maintain the accuracy of your profile.
          </List.Item>
          <List.Item>
            <strong>Account Security:</strong> You are entirely responsible for maintaining the confidentiality
            of your login credentials and for all activities that occur under your account.
          </List.Item>
        </List>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>3. Worker Profiles & Data Ownership</Title>
        <List size="sm" spacing="xs">
          <List.Item>
            <strong>Portable Reputation:</strong> GigKraft recognizes that a Professional's reputation belongs
            to them. You own the rights to the structured data, metrics, and profiles you compile on GigKraft.
          </List.Item>
          <List.Item>
            <strong>License to GigKraft:</strong> To operate our platform, you grant GigKraft a worldwide,
            non-exclusive, royalty-free, sublicensable license to host, display, reproduce, and distribute your
            User Content (including before/after photos, descriptions, and credentials) solely to provide and
            promote the Platform.
          </List.Item>
          <List.Item>
            <strong>Portability Export:</strong> You may export your public profile data at any time. GigKraft
            will not artificially restrict or hold your reputation data hostage if you choose to close your account.
          </List.Item>
        </List>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>4. User-Generated Content & Portfolio Rules</Title>
        <Text size="sm">
          Professionals and Clients may upload photos, project metrics, and text ("User Content"). You represent
          and warrant that:
        </Text>
        <List size="sm" spacing="xs">
          <List.Item>
            You own or have the necessary permissions to use and upload the photos (e.g., homeowner permission
            for job site photos).
          </List.Item>
          <List.Item>
            Your Before/After photos are genuine, unmanipulated, accurate representations of your own handiwork.
          </List.Item>
          <List.Item>
            Your content does not infringe on any third-party intellectual property or privacy rights.
          </List.Item>
          <List.Item>
            Clients submitting "Project Trust Verification" forms must provide honest, factual, and
            non-defamatory responses regarding project scope, budget, and binary performance metrics.
          </List.Item>
        </List>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>5. Credentials Disclaimer</Title>
        <Text size="sm">
          Professionals may upload state licenses, OSHA certifications, background checks, and insurance documents
          ("Credentials") to their GigKraft profile for display purposes only.{" "}
          <strong>
            GigKraft does not independently verify, validate, cross-reference, or guarantee the current validity,
            accuracy, or legal standing of any uploaded Credential documents.
          </strong>{" "}
          All credential information is self-declared by the Professional. Displaying a document on GigKraft does
          not constitute GigKraft's endorsement, authentication, or confirmation of that document. It remains the
          sole responsibility of the Client to independently verify a Professional's licensing, bonding, and
          insurance prior to commencing any physical work or entering into any contract.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>6. Prohibited Conduct</Title>
        <Text size="sm">You agree not to:</Text>
        <List size="sm" spacing="xs">
          <List.Item>
            Manipulate the Project Trust Graph by submitting fraudulent reviews, peer-to-peer vouchers, or fake
            project verification metrics.
          </List.Item>
          <List.Item>Create ghost profiles or misrepresent your trade qualifications.</List.Item>
          <List.Item>Upload false, fabricated, or doctored credential documents.</List.Item>
          <List.Item>
            Use automated systems or software (scraping) to extract data from the Platform for competitive or
            commercial purposes.
          </List.Item>
        </List>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>7. Termination</Title>
        <Text size="sm">
          We reserve the right to suspend or terminate your account and access to the Platform at our sole
          discretion, without notice, if we believe you have violated these Terms, manipulated the reputation
          metrics, or engaged in conduct detrimental to the GigKraft community.
        </Text>
      </Stack>

      <Divider />

      {/* ── Limitation of Liability ── */}
      <Stack gap="xs">
        <Title order={2}>Limitation of Liability & Indemnification</Title>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>1. "As Is" and "As Available" Services</Title>
        <Text size="sm" style={{ textTransform: "uppercase" }}>
          The platform and all content, metrics, portfolios, and credentials provided therein are offered on an
          "as is" and "as available" basis without warranties of any kind, either express or implied. To the
          fullest extent permitted by law, GigKraft disclaims all warranties, including implied warranties of
          merchantability, fitness for a particular purpose, title, and non-infringement.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>2. Exclusion of Damages for Third-Party Conduct</Title>
        <Text size="sm" style={{ textTransform: "uppercase" }}>
          GigKraft is not responsible for the conduct, whether online or offline, of any Professional, Client,
          enterprise user, or third-party service. GigKraft does not guarantee the quality, safety, legality, or
          timeliness of any work discussions, contracts, or completed projects arranged via contact originating on
          the Platform.
        </Text>
        <Text size="sm" style={{ textTransform: "uppercase" }}>
          In no event shall GigKraft, its affiliates, officers, employees, or agents be liable for any indirect,
          incidental, special, punitive, or consequential damages whatsoever (including, without limitation, lost
          profits, loss of data, property damage, personal injury, or work stoppage) arising out of or in
          connection with: your use or inability to use the Platform; any interaction, contract, or dispute
          between Professionals and Clients; the failure of a Professional to maintain valid state licensing,
          insurance, or certifications; or any inaccurate, fraudulent, or fabricated credential documents,
          reviews, before/after photographs, or metrics posted to the Trust Graph.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>3. Cap on Total Liability</Title>
        <Text size="sm" style={{ textTransform: "uppercase" }}>
          Under no circumstances will GigKraft's aggregate liability to you for all claims arising out of the use
          of the Platform exceed the greater of $100 USD or the total amount paid by you to GigKraft for premium
          services or portal access in the twelve (12) months preceding the claim.
        </Text>
      </Stack>

      <Stack gap="xs">
        <Title order={4}>4. Indemnification</Title>
        <Text size="sm">
          You agree to defend, indemnify, and hold harmless GigKraft Inc., its directors, officers, and employees
          from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt
          (including reasonable attorneys' fees) arising from:
        </Text>
        <List size="sm" spacing="xs">
          <List.Item>Your use of and access to the Platform.</List.Item>
          <List.Item>Your violation of any clause within these Terms.</List.Item>
          <List.Item>Your violation of any third-party right, including copyright, property, or privacy rights.</List.Item>
          <List.Item>
            Any physical damage, financial dispute, or contractual breach resulting from a trade project executed
            between you and another user of the Platform.
          </List.Item>
        </List>
      </Stack>

    </Stack>
  );
}
