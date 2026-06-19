# GigKraft Functional Requirements: Sovereign Inbox Feature

## Operational Specifications for System Engineering

---

## 1. User Acquisition & Conversion Flow

### 1.1 Anonymous Draft Hook

- The system must permit unauthenticated visitors to type an initial message or input a "Request a Quote" query directly on a professional's public portfolio profile prior to creating an account[cite: 1].

### 1.2 Preservation Gate

- When an unauthenticated user clicks the **Send** action, the interface must halt transmission and display an authentication modal prompting them to secure a free `@handle`[cite: 1].
- The system must preserve the user's drafted message string in-memory while the authentication lifecycle executes[cite: 1].

### 1.3 Post-Signup Execution

- Immediately upon successful user provisioning, the system must write the user profile to the database, claim their unique `@handle`, instantiate the 1-to-1 conversation thread, and deliver the cached draft[cite: 1].

---

## 2. Inbox Layout & Navigation Rules

### 2.1 Intent-Based Tabbed Views

The inbox interface must partition message threads dynamically into three distinct, dedicated views[cite: 1]:

- `**Leads / Quotes`:** Houses all active threads containing structured quote requests, pricing estimations, and client-to-professional business conversions[cite: 1].
- `**Chats`:** Accommodates standard peer-to-peer messaging, general professional networking, and direct interactions with talent agents[cite: 1].
- `**Requests`:** Functions as a quarantine view for unsolicited messages initialized by typing a handle directly into a "New Message" dialog without a shared platform history[cite: 1].

### 2.2 Handle Identity & Metadata Badges

- The interface must visually append an explicit, color-coded metadata badge directly next to user handles in all lists, chat headers, and message feeds to identify account classification[cite: 1]:
  - `PRO` — Trade or Creative Professional[cite: 1].
  - `HO` — Homeowner or General Client[cite: 1].
  - `AGENT` — Talent or Booking Agent[cite: 1].

### 2.3 Structural Constraints

- **Strict P2P Limitation:** The messaging engine must exclusively support 1-to-1 interactions[cite: 1]. Group messaging or multi-party conversation schemas are strictly prohibited[cite: 1].

---

## 3. Inline Interactive Workflows

### 3.1 Inline Form Injection

- When a quote interaction is initialized, the system must inject an interactive "Fill Details" messaging module directly inside the chat thread view instead of using external landing page URLs[cite: 1].

### 3.2 In-App Overlay Capture

- Selecting the inline widget must trigger an overlay pop-up capturing structured inputs[cite: 1]:
  - Project Scope / Description[cite: 1]
  - Estimated Budget Range[cite: 1]
  - Timeline Urgency Flag[cite: 1]
  - Project Location / Neighborhood[cite: 1]
  - File/Image Attachments[cite: 1]

### 3.3 Dynamic State Transformation

- Upon form submission, the raw interactive system bubble must instantly transition into a locked, visually verified **Rich Quote Card** layout visible to both participants[cite: 1].

---

## 4. Anti-Abuse & Spam Controls

### 4.1 The Single-Message Lock

- Within threads classified as a `LEAD`, an unaccepted Homeowner (`HO`) must be mechanically restricted from sending subsequent text messages in the thread until the Professional (`PRO`) responds or explicitly accepts the conversation[cite: 1].

### 4.2 Global Lead Caps

- Free client (`HO`) accounts must be hard-capped at a maximum of **3 active, unaccepted quote requests** across the platform simultaneously[cite: 1]. 
- To initiate a 4th request, the client must explicitly archive an existing unaccepted request or wait for a provider response[cite: 1].

### 4.3 Receipt Quarantine

- Senders operating within the `REQUESTS` view must not receive read receipts or delivery confirmations until the recipient actively clicks an **Accept Request** prompt[cite: 1].