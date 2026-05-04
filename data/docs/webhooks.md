---
id: webhooks
title: Webhooks
description: Real-time event notifications from Orbiill to your application.
source_url: https://staging.orbiill.com/docs/webhooks
category: webhooks
---

# Webhooks

Webhooks let your application react to events in Orbiill in real time. When an event occurs — a subscription is created, a payment fails, a plan is deployed — Orbiill sends an HTTPS POST request to your configured endpoint with the event payload.

## Setting up a webhook endpoint

Navigate to Settings → Webhooks in your dashboard and click Add Endpoint. You will be prompted to provide:

- **Endpoint URL** — the HTTPS URL where Orbiill will POST events. HTTP URLs are rejected.
- **Events** — the list of event types you want to receive. You can select all or pick specific ones.
- **Description** (optional) — internal label to identify the endpoint.

After creating the endpoint, Orbiill generates a **signing secret** unique to that endpoint. Copy this secret immediately and store it securely — it is shown only once.

You can create multiple endpoints per organization, each subscribed to different events. Common patterns include:

- One endpoint for billing events (subscriptions, invoices)
- A separate endpoint for plan lifecycle events (drafts, deployments)
- A staging endpoint and a production endpoint with different URLs

## Event types

Orbiill emits the following event types:

### Subscription events

- `subscription.created` — a new subscription was created
- `subscription.updated` — subscription details changed (plan, status, etc.)
- `subscription.canceled` — subscription was canceled
- `subscription.trial_ending` — trial period ends in 3 days

### Invoice events

- `invoice.created` — a new invoice was generated
- `invoice.payment_succeeded` — payment was collected successfully
- `invoice.payment_failed` — payment attempt failed
- `invoice.finalized` — invoice was finalized and ready for payment

### Plan events

- `plan.created` — a draft plan was created
- `plan.validated` — a plan passed validation
- `plan.deployed` — a plan was successfully deployed to Stripe
- `plan.deploy_failed` — deployment to Stripe failed

### Customer events

- `customer.created` — a new customer was registered
- `customer.updated` — customer details changed

## Payload format

Every webhook delivery has the same envelope:

```json
{
  "id": "evt_abc123def456",
  "type": "subscription.created",
  "created_at": "2026-04-28T15:30:00Z",
  "livemode": true,
  "data": {
    "object": {
      "id": "sub_xyz789",
      "plan_id": "plan_abc123",
      "customer_id": "cus_def456",
      "status": "active",
      "current_period_start": "2026-04-28T15:30:00Z",
      "current_period_end": "2026-05-28T15:30:00Z"
    }
  }
}
```

The `data.object` field contains the resource that changed, with its full current state. The shape of `data.object` varies by event type — refer to the API reference for each resource schema.

## Signature verification

Orbiill signs every webhook delivery with HMAC-SHA256 using your endpoint's signing secret. You **must** verify the signature before processing any webhook to prevent spoofed events.

The signature is sent in the `Orbiill-Signature` header:

```
Orbiill-Signature: t=1714320000,v1=5e8a7b3c4d2f1a9e8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a
```

The header contains:
- `t` — UNIX timestamp when the signature was generated
- `v1` — the HMAC-SHA256 signature

### Verification steps

1. **Extract the timestamp and signature** from the header.
2. **Construct the signed payload string** as `{timestamp}.{raw_request_body}`.
3. **Compute HMAC-SHA256** of the signed payload using your signing secret as the key.
4. **Compare** the computed signature with the `v1` value using constant-time comparison.
5. **Verify the timestamp** is within a tolerance window (5 minutes is recommended) to prevent replay attacks.

### Verification example

```typescript
import crypto from 'node:crypto';

function verifySignature(
  rawBody: string,
  signatureHeader: string,
  secret: string,
  toleranceSeconds = 300,
): boolean {
  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parseInt(parts.t, 10);
  const signature = parts.v1;

  // Reject old timestamps
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex'),
  );
}
```

**Critical**: use `crypto.timingSafeEqual` for the comparison — never compare strings directly with `===`. String comparison is vulnerable to timing attacks that can leak the signature.

**Critical**: use the **raw request body** for signature computation. If you parse the body to JSON before verifying, the re-serialized JSON may differ from the original (whitespace, key order) and the signature will not match.

## Retry behavior

If your endpoint does not return a 2xx status code within 10 seconds, Orbiill considers the delivery failed and retries automatically.

The retry schedule uses exponential backoff:

- 1st retry: 30 seconds after first failure
- 2nd retry: 5 minutes after 1st retry
- 3rd retry: 30 minutes after 2nd retry
- 4th retry: 2 hours after 3rd retry
- 5th retry: 12 hours after 4th retry

After 5 failed attempts (~15 hours total), Orbiill stops retrying and marks the delivery as permanently failed. You can manually replay failed deliveries from the dashboard.

Your endpoint must respond with a 2xx status code (200, 201, 204, etc.) to acknowledge receipt. Any other status — including 3xx redirects — counts as a failure.

## Idempotency

Webhook deliveries are idempotent by event ID. If your endpoint processes the same event multiple times (due to retries or network issues), you should detect duplicates by storing the `id` field of each event and skipping already-processed events.

A simple deduplication pattern:

```typescript
async function handleWebhook(event: WebhookEvent) {
  const alreadyProcessed = await db.events.findOne({ id: event.id });
  if (alreadyProcessed) {
    return { status: 'duplicate' };
  }

  await db.events.insert({ id: event.id, processed_at: new Date() });
  await processEvent(event);
}
```

## Best practices

- **Respond quickly** — return 2xx within seconds. Defer heavy work to a background queue.
- **Verify signatures** on every request. Reject any payload with an invalid or missing signature.
- **Deduplicate by event ID** to handle retries safely.
- **Log the event ID** for debugging and support inquiries.
- **Test with the dashboard** — Orbiill provides a "Send test event" button for each endpoint to verify your handler.
- **Use HTTPS only** — never expose webhook endpoints over HTTP.
- **Rotate signing secrets** periodically and immediately if you suspect compromise.

## Local development

To receive webhooks during local development, use a tunneling tool like ngrok to expose your local server:

```
ngrok http 3000
```

Configure the ngrok HTTPS URL as your webhook endpoint in the dashboard. Remember to update the URL when you deploy to production.

## Troubleshooting

If you are not receiving webhooks, check:

- **Endpoint URL is correct** and uses HTTPS.
- **Server is reachable** from the public internet (not behind a firewall or VPN).
- **Endpoint returns 2xx** within 10 seconds.
- **Subscribed events** include the type you expect to receive.
- **Webhook deliveries log** in the dashboard shows delivery attempts and responses.

If signatures are failing, the most common causes are:

- Using the parsed JSON body instead of the raw body
- Using the wrong signing secret (e.g., from another endpoint)
- Incorrect HMAC algorithm (must be SHA-256, not SHA-1 or SHA-512)
- Comparing signatures with string equality instead of constant-time comparison