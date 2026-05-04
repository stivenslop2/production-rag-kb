---
id: api-reference
title: API Reference
description: REST API for managing billing configs, plans, and subscriptions.
source_url: https://staging.orbiill.com/docs/api-reference
category: api-reference
---

# API Reference

The Orbiill REST API lets you programmatically manage billing configurations, plans, subscriptions, and customers. All endpoints return JSON and require authentication via API key.

## Base URL

```
https://api.orbiill.com/v1
```

All requests must use HTTPS. HTTP requests are rejected with a 400 error.

## Authentication

Authenticate every request with your API key in the Authorization header:

```
Authorization: Bearer sk_live_abc123...
```

Test mode keys start with `sk_test_` and live mode keys start with `sk_live_`. Keep your live keys secret — never expose them in client-side code.

You can rotate your API keys from Settings → API Keys in the dashboard. Old keys remain valid for 24 hours after rotation to allow for safe transitions.

## Rate limits

The API enforces rate limits per organization:

- 100 requests per second sustained
- 200 requests per second burst (10-second window)

When you exceed the limit, the API returns a 429 Too Many Requests response with a Retry-After header indicating how many seconds to wait before retrying.

Implement exponential backoff in your client to handle 429 responses gracefully. Most SDK clients do this automatically.

## Endpoints

### Plans

#### List plans

```
GET /api/v1/plans
```

Returns a paginated list of billing plans for your organization.

Query parameters:

- `limit` (integer, optional) — number of results per page, default 20, max 100
- `cursor` (string, optional) — pagination cursor from the previous response
- `status` (string, optional) — filter by status: `draft`, `validated`, `deployed`

Example response:

```json
{
  "data": [
    {
      "id": "plan_abc123",
      "name": "Pro Plan",
      "status": "deployed",
      "stripe_product_id": "prod_xyz789",
      "created_at": "2026-04-01T10:00:00Z"
    }
  ],
  "next_cursor": "plan_def456"
}
```

#### Get plan

```
GET /api/v1/plans/{plan_id}
```

Returns a single plan by ID. Returns 404 if the plan does not exist or belongs to another organization.

#### Create plan

```
POST /api/v1/plans
```

Creates a new draft plan. The plan must be validated before it can be deployed.

Request body:

```json
{
  "name": "Enterprise Plan",
  "description": "Custom plan for large customers",
  "currency": "usd",
  "tiers": [
    {
      "name": "Standard",
      "price": 9900,
      "interval": "month"
    }
  ]
}
```

Returns 201 Created on success.

#### Validate plan

```
POST /api/v1/plans/{plan_id}/validate
```

Runs validation checks on a draft plan. Returns 200 with a validation report or 422 Unprocessable Entity if validation fails.

#### Deploy plan

```
POST /api/v1/plans/{plan_id}/deploy
```

Deploys a validated plan to Stripe. Creates the corresponding Products, Prices, and Meters in your Stripe account.

Returns 400 Bad Request if the plan has not been validated. Returns 200 OK with deployment status on success.

### Subscriptions

#### List subscriptions

```
GET /api/v1/subscriptions
```

Returns subscriptions associated with your plans. Supports filtering by plan, customer, and status.

#### Get subscription

```
GET /api/v1/subscriptions/{subscription_id}
```

Returns a single subscription with its current state, plan, and customer info.

## Error codes

The API uses standard HTTP status codes:

- 200 OK — request succeeded
- 201 Created — resource created
- 400 Bad Request — invalid request, see error message
- 401 Unauthorized — missing or invalid API key
- 403 Forbidden — API key valid but lacks permission
- 404 Not Found — resource does not exist
- 422 Unprocessable Entity — validation failed
- 429 Too Many Requests — rate limit exceeded
- 500 Internal Server Error — server-side error, retry with backoff

All error responses include a JSON body with details:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Plan must have at least one tier",
    "field": "tiers"
  }
}
```

## Pagination

List endpoints use cursor-based pagination. Pass the `next_cursor` from a response as the `cursor` parameter on the next request to fetch the following page.

Pagination is forward-only. To navigate backwards, restart from the beginning.

## Idempotency

POST endpoints accept an optional `Idempotency-Key` header. Requests with the same idempotency key within 24 hours return the same response without re-executing the operation. Use UUIDs for idempotency keys.

```
Idempotency-Key: 7d3a8f2c-1b4e-4a9c-9e6d-2f8a1b3c5d7e
```

This is critical for safe retries on network failures.