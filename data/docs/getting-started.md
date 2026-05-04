---
id: getting-started
title: Getting Started
description: Go from zero to a live billing plan in minutes.
source_url: https://staging.orbiill.com/docs/getting-started
category: guide
---

# Getting Started

Go from zero to a live billing plan in minutes. This guide walks you through account setup, Stripe integration, and your first deployment.

## 1. Create your account

Sign up at app.orbiill.com with your email address. You will receive a verification email — click the link to confirm your account and access the dashboard.

After verifying, you will be prompted to create an organization. This is the workspace where your team collaborates on billing configurations.

## 2. Connect Stripe

Navigate to Settings → Stripe in your dashboard and click Connect with Stripe. You will be redirected to Stripe's OAuth flow where you authorize Orbiill to manage Products, Prices, and Meters on your behalf.

Orbiill uses Stripe Connect (OAuth), so all billing objects live in your own Stripe account. You retain full control and can revoke access at any time.

Tip: Use a Stripe test-mode account during development. You can switch to live mode later in Settings.

## 3. Create your first billing plan

Go to Dashboard → Builder and describe your pricing in plain language. For example:

```
Create a SaaS plan with three tiers:
- Free: 0/month, 1 project, community support
- Pro: $29/month, unlimited projects, priority support, 14-day trial
- Enterprise: $99/month, unlimited everything, SSO, dedicated support
```

Orbiill's AI parses your description and generates a structured billing configuration with Products, Prices, and Features. The result appears in the builder for review.

## 4. Review and validate

Review the generated plans in the builder. You can edit names, prices, features, and trial periods. Validation runs automatically and checks for:

- Duplicate product or price names
- Invalid currency or interval combinations
- Missing required fields
- Stripe-specific constraints

Fix any validation errors before proceeding to deployment.

## 5. Deploy to Stripe

Once validation passes, click Deploy. Orbiill creates the corresponding Products, Prices, and Meters in your connected Stripe account. The deployment status updates in real time.

After deployment, your plans are live in Stripe and ready for subscriptions.

Important: Billing configs must pass validation before they can be deployed. Attempting to deploy an unvalidated config will return a 400 error.

## 6. Embed the widget

Go to the Widget tab in your dashboard to customize the look and feel of your pricing page. Once configured, copy the embed code and paste it into your marketing site.

## 7. Set up webhooks

Navigate to Settings → Webhooks and add your endpoint URL. Select the events you want to receive (e.g., subscription.created, invoice.payment_failed).

Orbiill signs every webhook delivery with HMAC-SHA256. Use the signing secret from your endpoint settings to verify payloads. See the Webhooks guide for details.

## 8. Integrate the SDK

Install the TypeScript SDK to interact with the Orbiill API from your backend:

```
npm install @orbiill/sdk
```

Initialize the client and start querying plans, subscriptions, and billing configs:

```typescript
import { OrbiillClient } from '@orbiill/sdk';

const orbiill = new OrbiillClient({
  apiKey: process.env.ORBIILL_API_KEY!,
});

const plans = await orbiill.plans.list();
console.log(plans);
```

See the full SDK reference for all available methods and error handling.