# Production Setup Guide

## 1. Environment Variables
Ensure all variables from `.env.example` are set in your production environment (e.g., Vercel Dashboard).
- Generate `AUTH_SECRET` with `openssl rand -base64 32`.
- `NEXT_PUBLIC_APP_URL` must be the actual production URL (e.g., `https://boasideias.com.br`). This is required for CSRF protection and Stripe checkout redirects to work properly.

## 2. MongoDB Indexes
Indexes on `orders`, `products`, and `users` are automatically ensured on application startup via `lib/db-indexes.ts`. 
- They are created in the background (`background: true`) so they won't block the deployment or application launch.
- No manual database scripting is required.

## 3. Stripe Webhook
The platform relies on webhooks to register sales, track idempotency, and distribute affiliate commissions.
1. Go to Stripe Dashboard -> Developers -> Webhooks.
2. Add an endpoint pointing to `https://yourdomain.com/api/webhooks/stripe`.
3. Select the event: `checkout.session.completed`.
4. Copy the *Signing Secret* and set it as `STRIPE_WEBHOOK_SECRET`.

## 4. Security Measures (Implemented)
- **CSRF Protection**: Native middleware checks that any state-changing request (`POST`, `PATCH`, `DELETE`) has an `Origin` matching the `Host`. (Webhooks are excluded).
- **Rate Limiting**: An in-memory rate limiter caps IPs to 5 requests per second. *(Note: On serverless environments like Vercel, this limits per isolate, which provides a good baseline defense. For strict distributed rate limiting, consider integrating Vercel KV or Redis in `middleware.ts`).*
- **Structured Logging**: All critical events (product edits, deletions, checkout sessions, and file downloads) output a JSON object to the server console prefixed with `[Action:METHOD]`, enabling easy log parsing.
- **Input Validation**: API routes cleanly filter bodies using an explicit allowlist and sanitize inputs before updating the database.

## 5. Deployment Notes
- Standard Next.js deployment (e.g., Vercel) is fully supported.
- Run `npm run build` to ensure all pages pre-render correctly. 
- Custom error pages (`404` and `500`) are included and handle missing products (e.g. unpublished drafts) cleanly.
