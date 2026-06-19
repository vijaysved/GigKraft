# Functional Specifications: GK Admin Outreach & Email Automation Module

## 1. System Overview & Architecture
The **GigKraft Prospect Outreach Module** is designed for the `GK Admin` (Vijay) to ingest, track, nurture, and convert prospective service professionals (`Pros`) into paying subscribers. 

Pros are sourced primarily via multi-channel networking across **Nextdoor, Craigslist, and WhatsApp**. The platform provides automated email nurturing sequences via **Resend** for prospects with known email addresses, and manual copy-paste template actions for text-based channels (like WhatsApp groups or Nextdoor DMs).

### Core Pricing Logic To Communicate:
*   **Monthly Recurring:** $24.99/month
*   **Annual Recurring:** $249.99/year (Saves ~16%)
*   **Value Hook:** A zero-transaction-fee, independent, "sovereign" reference and portfolio layer where the worker completely owns their local reputation, independent of traditional bidding marketplaces.

---

## 2. Database Schema (Prisma Data Model)

```prisma
enum Role {
  PRO
  HOMEOWNER
}

enum LeadSource {
  NEXTDOOR
  CRAIGSLIST
  WHATSAPP
  DIRECT
}

enum LeadStatus {
  PROSPECT      // Imported/Created, not yet contacted
  IN_PROGRESS   // Currently inside the active outreach sequence
  CONVERTED     // Signed up as a paid customer on GigKraft
  ON_HOLD       // Temporarily paused contact (Admin choice or lead requested later follow-up)
  ABANDONED     // Finished sequence with no response, opted out, or explicitly declined
}

model Prospect {
  id                   String       @id @default(uuid())
  name                 String
  email                String?      @unique
  phone                String?
  role                 Role         @default(PRO)
  primaryZip           String
  neighborhood         String?      // Optional: highly effective for Nextdoor personalization
  source               LeadSource
  status               LeadStatus   @default(PROSPECT)
  currentSequenceStep  Int          @default(0) // 0 = not started, 1 = Step 1 sent, 2 = Step 2 sent, 3 = Step 3 sent
  lastContactedAt      DateTime?
  createdAt            DateTime     @default(now())
  updatedAt            DateTime     @updatedAt

  @@index([status, currentSequenceStep, lastContactedAt])
}
```

---

## 3. State Machine & Automation Logic

### A. The Outreach Lifecycle
```
[ PROSPECT ] ---> (Admin Triggers Sequence) ---> [ IN_PROGRESS ]
                                                       |
         +-------------------+-------------------------+-------------------------+
         |                   |                         |                         |
  (Auto-Sequencing)   (User Registers)         (Lead Requests Pause)     (No Response/Declines)
         |                   |                         |                         |
         v                   v                         v                         v
   [ Next Step ]      [ CONVERTED ]               [ ON_HOLD ]              [ ABANDONED ]
```

### B. Automated Resend Flow Engine (Cron Job / Worker Logic)
A background worker evaluates all entries matching `status == IN_PROGRESS` every 24 hours:

1.  **Step 1 (Day 0):** Sent immediately when an Admin moves a record from `PROSPECT` to `IN_PROGRESS`.
    *   *Action:* Dispatches **Template 1**, updates `currentSequenceStep = 1`, and sets `lastContactedAt = NOW()`.
2.  **Step 2 (Day 3):** Evaluated if `currentSequenceStep == 1` AND `lastContactedAt <= NOW() - 3 days`.
    *   *Action:* Dispatches **Template 2**, updates `currentSequenceStep = 2`, and sets `lastContactedAt = NOW()`.
3.  **Step 3 (Day 7):** Evaluated if `currentSequenceStep == 2` AND `lastContactedAt <= NOW() - 4 days` (7 full days from initial start).
    *   *Action:* Dispatches **Template 3**, updates `currentSequenceStep = 3`, and sets `lastContactedAt = NOW()`.
4.  **Auto-Closure (Day 12):** Evaluated if `currentSequenceStep == 3` AND `lastContactedAt <= NOW() - 5 days`.
    *   *Action:* Automatically transitions `status` to `ABANDONED`. No further automated emails are sent.

### C. Immediate Sequence Interrupts
The automated campaign must cease immediately under either condition:
*   **System Event:** A user signs up on GigKraft using an email address matching an active `Prospect.email`. The hook changes `status` to `CONVERTED` and stops workflows.
*   **Admin Action:** The GK Admin manually changes a prospect’s status to `CONVERTED`, `ON_HOLD`, or `ABANDONED` via the panel.

---

## 4. Omni-Channel Outreach Templates

### Option A: Email Templates (Resend / HTML Format)

#### Template 1: The Hook (Day 0)
*   **Subject:** Showcase your work to local homeowners (GigKraft)
*   **Body:**
    ```text
    Hi {name},

    I came across your services on {source} and wanted to reach out. I’m Vijay, one of the admins at GigKraft—a local community platform built specifically for trusted, independent pros in the {primaryZip} area.

    Unlike traditional bidding networks that eat into your margins or charge you for fake leads, GigKraft acts as your sovereign digital portfolio. It’s an independent reference layer where you own your local reputation, showcase past projects, and let homeowners verify your work directly.

    We keep things simple and completely transparent: it’s $24.99/month or $249.99/year to host your verified profile. No hidden transaction fees, and zero payment for leads.

    If you're open to securing more local jobs through real local word-of-mouth, you can claim your profile here: [Sign Up Link]

    Best regards,

    Vijay
    GK Admin, GigKraft
    ```

#### Template 2: Value & Control (Day 3)
*   **Subject:** Own your professional reputation, {name}
*   **Body:**
    ```text
    Hi {name},

    Just following up on my note from a few days ago. 

    A lot of local pros tell us they are tired of corporate platforms shifting algorithms or hiding their best client reviews behind expensive paywalls. With GigKraft, your profile is yours to keep and share anywhere—whether you're talking to clients on WhatsApp, Nextdoor, or Craigslist.

    For $24.99 a month, you get a clean, verified portfolio link that proves to nearby homeowners you are the real deal.

    If you have 2 minutes today, you can set your profile up right here: [Sign Up Link]

    Best,

    Vijay
    GK Admin, GigKraft
    ```

#### Template 3: The Breakup / Final Check (Day 7)
*   **Subject:** Closing out your pending profile request on GigKraft
*   **Body:**
    ```text
    Hi {name},

    I haven't heard back from you, so I'll assume right now isn't the right time to expand your local client base or set up your digital portfolio. 

    I will go ahead and put your profile invite on hold so we don't crowd your inbox. If you change your mind down the road and want to build a verified reputation layer in {primaryZip} for $24.99/mo, you can always activate your account here: [Sign Up Link].

    Wishing you the absolute best with your business this quarter!

    Cheers,

    Vijay
    GK Admin, GigKraft
    ```

---

### Option B: Chat Templates (Optimized for WhatsApp / Nextdoor DMs)
*Note: Designed for rapid copy/paste workflow. Uses native text-star markdown (`*text*`) formatting supported by WhatsApp.*

#### Chat Step 1:
```text
Hi {name}! Noticed your excellent work on {source}. I'm Vijay, admin for *GigKraft*—a local trust network for pros in {primaryZip}. We build sovereign digital portfolios for independent contractors. No lead fees or hidden cuts—just your own verified link to show clients. It's *$24.99/mo* or *$249.99/yr* flat. 

If you'd like to reserve your profile link, check it out here: [Sign Up Link]
```

#### Chat Step 2:
```text
Hey {name}, just following up! Local pros are loving *GigKraft* because they fully own their reviews and portfolio link, bypassing unpredictable platform algorithms. Great for dropping directly into your WhatsApp groups or Nextdoor replies. 

Set up your verified local profile in 2 mins: [Sign Up Link]
```

#### Chat Step 3:
```text
Hi {name}, closing out your pending invite for now so I don't bug you. If you ever want to stand out to nearby homeowners with a clean profile for *$24.99/mo*, you can unlock it anytime here: [Sign Up Link]. Wish you all the best!
```

---

## 5. UI/UX & Functional Dashboard Requirements

### Component 1: Lead Ingestion Drawer
*   **Single Addition:** Form fields for `Name`, `Email`, `Phone`, `Role` (default to Pro), `Primary Zip`, `Neighborhood`, and `Source` (Dropdown: Nextdoor, Craigslist, WhatsApp, Direct).
*   **Bulk CSV Upload:** Maps columns `name`, `email`, `phone`, `primary_zip`, `neighborhood`, `source` to execute batch database inserts.

### Component 2: The Action Queue ("The Hub")
*   A centralized data grid displaying all prospects where `status == IN_PROGRESS` or `status == PROSPECT`.
*   **Columns:** Name, Contact (Email/Phone), Source Tag (color-coded), Current Sequence Step, Days Since Last Contact, and Action controls.
*   **Interactive Row Actions:**
    *   **"Convert" Button:** instantiates a manual override marking status as `CONVERTED`.
    *   **"Hold" Button:** changes status to `ON_HOLD`.
    *   **"Abandon" Button:** changes status to `ABANDONED`.

### Component 3: Omni-Channel Copy Modal (WhatsApp/Nextdoor Assist)
*   For records lacking an email or marked with chat sources, clicking the **"Execute Chat Step"** button must launch a modal window.
*   **Features:**
    1. Displays the corresponding Chat Template step with token variables fully parsed.
    2. A prominent **"Copy to Clipboard"** button.
    3. A **"Confirm Sent"** button which manually pushes the state machine forward (sets `lastContactedAt = NOW()`, increments `currentSequenceStep`, sets status to `IN_PROGRESS`).

---

## 6. Prompt to Provide to Cursor

```text
Please build the GK Admin Outreach and Lead Management module for GigKraft based on the comprehensive markdown specifications attached.

1. Implement the Prisma database schema for the Prospect model precisely as outlined.
2. Build a backend cron job/worker utilizing Resend to automatically manage the 3-step email sequence (Day 0, Day 3, Day 7) checking for elapsed times, and ensuring absolute stop triggers if a prospect signs up or status changes.
3. Parse and inject variables like {name}, {source}, and {primaryZip} into the provided markdown email text dynamically.
4. Develop a clean React dashboard for the GK Admin featuring a master Prospect directory tracking state machine transitions (Prospect, In_Progress, Converted, On_Hold, Abandoned), alongside a modal utility optimized for parsing and copying clean text templates formatted for WhatsApp and Nextdoor messaging streams.
```