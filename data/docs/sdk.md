---
id: sdk
title: TypeScript SDK
description: Official TypeScript/JavaScript SDK for the Orbiill API.
source_url: https://staging.orbiill.com/docs/sdk
category: sdk
---

# TypeScript SDK

The official Orbiill SDK provides typed, idiomatic access to the Orbiill API from Node.js and browser environments. It handles authentication, retries, pagination, and error parsing automatically.

## Installation

Install the SDK from npm:

```
npm install @orbiill/sdk
```

The SDK supports Node.js 18+ and modern browsers. ES modules and CommonJS are both supported.

## Quick start

Initialize the client with your API key:

```typescript
import { OrbiillClient } from '@orbiill/sdk';

const orbiill = new OrbiillClient({
  apiKey: process.env.ORBIILL_API_KEY!,
});
```

The client reads your API key from the constructor or from the `ORBIILL_API_KEY` environment variable. Never hardcode keys in source code.

## Resources

The SDK exposes one method namespace per API resource: `plans`, `subscriptions`, `customers`, `webhooks`, and `usage`.

### Plans

List, create, and manage billing plans.

```typescript
// List plans
const { data: plans, nextCursor } = await orbiill.plans.list({
  limit: 20,
  status: 'deployed',
});

// Get a single plan
const plan = await orbiill.plans.get('plan_abc123');

// Create a draft plan
const draft = await orbiill.plans.create({
  name: 'Pro Plan',
  currency: 'usd',
  tiers: [
    { name: 'Standard', price: 2900, interval: 'month' },
  ],
});

// Validate the plan
const validation = await orbiill.plans.validate(draft.id);
if (!validation.valid) {
  console.error('Validation failed:', validation.errors);
  return;
}

// Deploy to Stripe
const deployed = await orbiill.plans.deploy(draft.id);
console.log('Deployed:', deployed.stripe_product_id);
```

### Subscriptions

Query subscriptions associated with your plans.

```typescript
// List active subscriptions for a plan
const { data: subs } = await orbiill.subscriptions.list({
  plan_id: 'plan_abc123',
  status: 'active',
});

// Get a subscription
const sub = await orbiill.subscriptions.get('sub_xyz789');
console.log('Status:', sub.status);
console.log('Current period end:', sub.current_period_end);
```

### Customers

Look up customer information across plans.

```typescript
const customer = await orbiill.customers.get('cus_abc123');
console.log('Email:', customer.email);
console.log('Total subscriptions:', customer.subscriptions.length);
```

## Pagination

List endpoints return a `nextCursor` field. Use the `paginate` helper to iterate through all results automatically:

```typescript
for await (const plan of orbiill.plans.paginate({ status: 'deployed' })) {
  console.log(plan.name);
}
```

The helper handles cursor management and stops when there are no more pages.

## Error handling

The SDK throws typed errors for all API failures. Catch them by class:

```typescript
import {
  OrbiillError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
} from '@orbiill/sdk';

try {
  const plan = await orbiill.plans.deploy('plan_abc123');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Plan failed validation:', error.details);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited, retry after:', error.retryAfter);
  } else if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof NotFoundError) {
    console.error('Plan not found');
  } else if (error instanceof OrbiillError) {
    console.error('API error:', error.code, error.message);
  } else {
    throw error;
  }
}
```

All SDK errors extend `OrbiillError`, which provides:

- `code` — machine-readable error code
- `message` — human-readable description
- `statusCode` — HTTP status code
- `requestId` — request ID for support inquiries

## Retries

The SDK automatically retries failed requests with exponential backoff for these conditions:

- Network errors and timeouts
- 429 Too Many Requests (respects Retry-After header)
- 500, 502, 503, 504 server errors

Default retry config:

- 3 retries maximum
- Initial delay 500ms, doubling each attempt
- Jitter applied to avoid thundering herd

You can customize retry behavior in the client constructor:

```typescript
const orbiill = new OrbiillClient({
  apiKey: process.env.ORBIILL_API_KEY!,
  maxRetries: 5,
  retryInitialDelayMs: 1000,
});
```

Set `maxRetries: 0` to disable retries entirely.

## Webhook signature verification

The SDK includes a helper to verify webhook signatures. See the Webhooks guide for full details.

```typescript
import { verifyWebhookSignature } from '@orbiill/sdk';

const isValid = verifyWebhookSignature({
  payload: rawBody,
  signature: req.headers['orbiill-signature'],
  secret: process.env.ORBIILL_WEBHOOK_SECRET!,
});

if (!isValid) {
  return res.status(401).send('Invalid signature');
}
```

Always use the raw request body — not the parsed JSON — for signature verification.

## TypeScript types

All API objects are fully typed. Import types directly:

```typescript
import type {
  Plan,
  Subscription,
  Customer,
  WebhookEvent,
} from '@orbiill/sdk';

function processSubscription(sub: Subscription) {
  // sub is fully typed
}
```

Type definitions are generated from the API spec and stay in sync with releases.

## Best practices

- **Store your API key in environment variables**, never in source code or version control.
- **Use test mode keys** during development. Test mode operations don't affect your live Stripe account.
- **Handle rate limits gracefully** by relying on the SDK's automatic retry logic.
- **Verify webhook signatures** on every incoming webhook to prevent forged events.
- **Use idempotency keys** for POST requests to safely retry on network failures.
- **Log the `requestId`** from errors when reporting issues to support.