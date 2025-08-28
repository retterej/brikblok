# BrickLink API – Node.js Examples

Minimal, runnable examples for the BrickLink **Store API** using **OAuth 1.0a HMAC-SHA1**.

## What’s inside
- `src/get_examples.js` – authenticated GET requests (item details, price guide, inventories, orders)
- `src/post_example.js` – authenticated POST request (create an inventory entry) ★
- `src/webhook_server.js` – tiny Express server to receive BrickLink **push notifications**

> ★ POST to `/inventories` requires approved seller API access. Use at your own discretion in a test environment first.

## Setup
```bash
npm i
cp .env.example .env
# edit .env with your keys
```

## Run GET examples
```bash
npm run get
```

## Run POST example (create inventory)
```bash
npm run post
```

## Run webhook (push notifications)
```bash
npm run webhook
# Expose publicly (e.g. with ngrok): ngrok http 3000
# Then set your BrickLink callback URL to: https://<your-ngrok-domain>/bricklink/push
```

## Notes
- BrickLink uses **OAuth 1.0a (HMAC-SHA1)** in the `Authorization: OAuth ...` header.
- For JSON POST bodies, parameters are **not** included in the OAuth signature base string (only query + OAuth params are). This matches common implementations.
- Handle **HTTP 429** (rate limits) with backoff/retries.
- Some endpoints are restricted to seller accounts.
