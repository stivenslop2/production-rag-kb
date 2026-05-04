---
id: faq
title: Frequently Asked Questions
description: Common questions about Orbiill — pricing, security, integrations, and technical details.
source_url: https://staging.orbiill.com/faq
category: faq
---

# Frequently Asked Questions

Answers to the most common questions about Orbiill.

## General

### What is Orbiill?

Orbiill is billing infrastructure for modern software companies. It connects to your Stripe account and lets you design, validate, and deploy billing plans through an AI-assisted builder. You describe your pricing in plain language, and Orbiill generates the corresponding Products, Prices, and Meters in Stripe.

### Who is Orbiill for?

Orbiill is built for SaaS companies, developer tools, and any software business that uses Stripe for billing. It is especially useful for teams that iterate on pricing frequently or run experiments across customer segments.

### Do I need a Stripe account?

Yes. Orbiill requires a connected Stripe account. All billing objects (Products, Prices, Subscriptions, Meters) live in your Stripe account — Orbiill orchestrates them but never holds your billing data.

### Can I use Orbiill with payment processors other than Stripe?

Not currently. Stripe is the only supported processor. Support for additional processors may be added based on customer demand.

## Technical

### How does the AI builder work?

The builder uses a large language model to parse your plain-language pricing description and generate a structured billing configuration. The model is constrained to produce valid Stripe schemas and runs validation checks before showing the result. You always review and edit the generated config before deployment.

### Where are my billing objects stored?

In your own Stripe account. Orbiill stores configuration metadata, deployment history, and audit logs in our database, but the actual Products, Prices, and Meters are created and owned by your Stripe account.

### Can I deploy plans without using the AI builder?

Yes. You can create plans directly through the API or by editing the JSON config in the dashboard. The AI builder is one of several authoring options.

### Does Orbiill support usage-based billing?

Yes. Orbiill creates Stripe Meters for usage-based pricing. You can define metered features in your plan config and report usage events through the API or SDK.

### What happens if a plan deployment fails halfway through?

Orbiill uses Stripe's idempotency keys for all deployment operations. If a deployment fails partway, you can retry safely — already-created objects will be reused rather than duplicated. The dashboard shows the deployment status and any error details.

### How do I roll back a deployed plan?

Stripe does not support deleting Products or Prices that have been used in subscriptions. Instead of rolling back, you typically deprecate the old plan (mark it as inactive in Stripe) and deploy a new version. Orbiill maintains version history so you can see what changed between deployments.

## Pricing

### How much does Orbiill cost?

Orbiill is currently in private beta with select customers. Pricing for general availability has not been finalized — contact us through the website to discuss your use case.

### Is there a free trial?

Beta access includes a free evaluation period. Reach out through the contact form on orbiill.com to request access.

### Will I be charged Stripe fees on top of Orbiill fees?

Yes. Stripe processing fees apply to all transactions in your Stripe account independently of Orbiill. Orbiill does not handle payment processing or take a cut of your revenue.

## Security

### How is my Stripe account protected?

Orbiill connects to your Stripe account via Stripe Connect (OAuth). You authorize specific permissions and can revoke access at any time from your Stripe dashboard. Orbiill never sees or stores your Stripe API keys directly.

### Where is my data stored?

Configuration metadata is stored in encrypted PostgreSQL databases hosted in AWS. All data is encrypted at rest using AES-256 and in transit using TLS 1.3.

### Are webhook deliveries encrypted?

Yes. All webhook deliveries are sent over HTTPS only. HTTP endpoints are rejected. Every payload is also signed with HMAC-SHA256 so you can verify authenticity.

### What happens to my data if I cancel?

You can export all your configuration data at any time through the API or dashboard. After cancellation, your data is retained for 30 days for recovery purposes and then permanently deleted. Stripe data remains untouched in your Stripe account.

### Is Orbiill SOC 2 compliant?

SOC 2 Type II audit is in progress. Compliance documentation will be shared with enterprise customers under NDA once the audit is complete.

### Who can access my organization's data?

Only members of your organization who have been invited and granted access. Orbiill staff can access customer data only for support purposes with explicit customer consent, and all such access is audited.