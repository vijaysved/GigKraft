# Recommendation & Trust Loop Requirements

## 1. Frictionless Collection Funnel
* **Authenticationless Submission**: Generate unique request payloads (e.g., `/pros/recommend/request?id={pro_id}`) that allow customers to write and submit reviews without forcing them through an account registration or password verification process.
* **Input Sanity Constraints**: Enforce client-side character validation requiring a minimum length of 30 characters for the primary text field.
* **Contextual Fields**: Mandate a verified local 5-digit zip code entry and an optional project category tag to explicitly tie the review to a specific type of trade service[cite: 1].

## 2. Isolation & Staging State
* **Draft Isolation Queue**: Direct all newly submitted customer recommendations into a non-public `pending` state by default.
* **Feed Filtering Rules**: The public profile's review engine must strictly filter out and omit entries unless their state is explicitly marked as active/published.

## 3. Professional Moderation Mechanics
* **Dedicated Approvals UI**: Provide a standalone management card displaying all current pending submissions awaiting action, completely isolated from performance metrics.
* **Publish Action Interceptor**: Clicking `Approve` must transition the targeted recommendation state to `published` and stamp a current validation timestamp, instantly rendering the asset live on the public profile.
* **Rejection/Spam Mitigation**: Clicking `Reject` must mark the item as `rejected` or purge the entry entirely, permanently excluding it from public distribution.