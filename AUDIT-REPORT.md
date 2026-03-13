# Full Architecture and Code Audit — Boas Ideias Online

**Reviewer role:** Senior Staff Engineer  
**Scope:** Pre–first production deployment (MVP)  
**Stack:** Next.js 16 (App Router), MongoDB, Stripe (Checkout + Connect), AWS S3, TypeScript

---

## SECTION 1 — SYSTEM OVERVIEW

### How the system works

- **Authentication**  
  Custom session-based auth: HMAC-signed JWT-like token in an httpOnly cookie (`session`). Token payload: `userId` + `exp` (7 days). Verified in `lib/auth.ts` via `verifySessionToken()`. Login/register in `app/api/auth/login/route.ts` and `app/api/auth/register/route.ts` set the cookie; `app/api/auth/me/route.ts` returns current user; logout clears the cookie. No NextAuth.

- **Product creation**  
  Authenticated user calls `POST /api/products` with title, description, price, category, etc. (`app/api/products/route.ts`). Slug is derived from title (with duplicate handling). New products are `active` if user has Stripe onboarding complete, else `draft`. PDF URL can be set after upload via `PATCH /api/products/[slug]`. Create-product UI: `app/dashboard/create-product/page.tsx` (auth check client-side, upload via `POST /api/upload`).

- **Checkout**  
  User must be logged in. `POST /api/checkout` (`app/api/checkout/route.ts`) receives `productId`, loads product and creator, resolves affiliate from `affiliate_ref` cookie if present, builds Stripe Checkout Session with metadata (`productId`, `userId`, `buyerName`, optional `affiliateUserId`). If creator has Stripe Connect, session uses `application_fee_amount` and `transfer_data.destination`. Frontend (`app/checkout/[slug]/page.tsx`) uses Stripe.js `redirectToCheckout({ sessionId })` or falls back to `session.url`.

- **Stripe Connect payout**  
  Creators connect via `POST /api/stripe/connect/create-account` (creates Express account, returns account link). Status synced in `GET /api/stripe/connect/status` (retrieves account, sets `stripeOnboardingComplete` when `details_submitted` and `charges_enabled`). On paid checkout, platform fee is taken via `application_fee_amount` and the remainder is transferred to the creator’s Connect account (`app/api/checkout/route.ts`).

- **Affiliate tracking**  
  Ref link: `/produto/[slug]?ref=<userId>`. `middleware.ts` matches `/produto/:slug` and redirects to `/api/affiliate/click?ref=&slug=` which: validates ref/slug, finds product and affiliate, inserts `AffiliateClick`, sets cookie `affiliate_ref` (30 days), redirects to product page. Checkout reads that cookie and sends `affiliateUserId` in session metadata. Webhook `checkout.session.completed` creates `AffiliateSale` and computes commission from `affiliate.commissionPercent` or `product.affiliateCommissionPercent`. Join program: `POST /api/affiliates/join` (auth required, creator cannot join own product).

- **File downloads**  
  Creator uploads PDF via `POST /api/upload` (auth required); file stored in S3 at `products/{userId}/{timestamp}-{uuid}.pdf`; API returns public URL stored in product’s `pdfUrl`. Download: `GET /api/download/[id]` receives order ID, checks order exists and `status === 'paid'`, loads product, builds S3 key from `product.pdfUrl`, generates presigned URL (60s), returns `NextResponse.redirect(signedUrl)`.

- **Creator dashboard**  
  Server-rendered pages behind auth (cookie + redirect to login): dashboard home (`app/dashboard/page.tsx` — “my purchases”, orders with `userId` and `status: 'paid'`), products list (`app/dashboard/products/page.tsx` — by `creatorId`), earnings (`app/dashboard/earnings/page.tsx` — orders for creator’s products, platform fee), product-affiliates analytics (`app/dashboard/product-affiliates/page.tsx`), create product, Stripe Connect card. Affiliate-facing: `app/dashboard/affiliates/page.tsx` and `app/dashboard/affiliate-earnings/page.tsx` use session and affiliate/click/sale collections.

---

## SECTION 2 — CRITICAL BUGS

### 1. Download flow broken (download page never gets JSON)

**Where:** `app/download/[id]/page.tsx` fetches `GET /api/download/[id]`.  
**Problem:** `app/api/download/[id]/route.ts` returns `NextResponse.redirect(signedUrl)`. A client `fetch()` follows the redirect and gets the S3 PDF body; `res.json()` then fails. The download page expects `data.success` and `data.downloadUrl` and never receives them, so it always shows “Não foi possível liberar o download”.

**Fix:** Either (a) change the dashboard link to point directly to the API so the browser performs a full navigation and the redirect to S3 works: in `app/dashboard/page.tsx` use `<Link href={`/api/download/${order._id!.toString()}`}>` (or `<a>` with same `href`) for “Baixar PDF”; or (b) add a mode where the API returns JSON (e.g. `Accept: application/json` or `?format=json`) with `{ success: true, downloadUrl: signedUrl }` and have the download page open that URL (e.g. `window.location.href = data.downloadUrl`). Option (a) is simpler and avoids exposing the presigned URL in client state.

---

### 2. Orders API creates “completed” instead of “paid”

**Where:** `app/api/orders/route.ts` (POST).  
**Problem:** The route creates an order with `status: 'pending'`, then immediately updates to `status: 'completed'`. The rest of the app (dashboard, download) uses `status: 'paid'` for successful payments. So orders created via this endpoint never appear in the buyer dashboard and never allow download (download route filters `status: 'paid'`).

**Fix:** If this route is only for legacy/demo, either remove it or align status: set `status: 'paid'` when marking as completed, and only use this flow for non-Stripe tests. Prefer driving all real orders from the Stripe webhook so a single source of truth exists.

---

### 3. Product PATCH/DELETE have no authentication

**Where:** `app/api/products/[slug]/route.ts` — `PATCH` and `DELETE` handlers.  
**Problem:** Neither checks session. Any client can send `PATCH /api/products/<slug>` or `DELETE /api/products/<slug>` and change or archive any product. The dashboard component `ProductAffiliateCell` calls `PATCH /api/products/${productSlug}`; that call is only intended for the product owner.

**Fix:** At the start of PATCH and DELETE: read session cookie, verify token, load product by slug, require `product.creatorId.equals(currentUser._id)`. Return 401 if unauthenticated and 403 if not the creator.

---

### 4. GET /api/orders returns all orders without auth

**Where:** `app/api/orders/route.ts` (GET).  
**Problem:** The handler does `collection.find({})` with no filter and no auth. Any caller can list every order in the system (buyer email, name, product, etc.).

**Fix:** Require authentication. If this endpoint is for “admin” or “creator” views, filter by either (a) `userId` for buyer dashboard, or (b) product IDs belonging to the current user for creator views. Do not expose a global order list without an admin role.

---

### 5. Duplicate order key not in TypeScript type

**Where:** `app/api/webhooks/stripe/route.ts` uses `stripeSessionId` on the order document; `lib/types.ts` `Order` has no `stripeSessionId`.  
**Problem:** Duplicate check `ordersCollection.findOne({ stripeSessionId: session.id })` and the insert use a field that is not in the type (suppressed with `@ts-expect-error`). Schema and type drift; no unique index to enforce idempotency at DB level.

**Fix:** Add `stripeSessionId?: string` to `Order` in `lib/types.ts`. Create a unique index on `orders.stripeSessionId` (sparse) so duplicate webhook deliveries cannot insert a second order.

---

### 6. Possible Next.js 15+ params handling

**Where:** `app/api/products/[slug]/route.ts` — GET uses `context.params`; `app/produto/[slug]/page.tsx` uses `params` in props.  
**Problem:** In Next.js 15+, route `params` (and `searchParams`) can be Promises. Accessing `context.params.slug` or `params.slug` without `await` may be wrong in some versions.

**Fix:** Use the pattern already used in `app/api/download/[id]/route.ts`: `const { slug } = await context.params` (if your Next version exposes a Promise). For the product page, if the framework passes a Promise, use `const { slug } = await params` before use.

---

## SECTION 3 — SECURITY RISKS

### 1. Unauthorized product mutation (PATCH/DELETE)

**Risk:** As in Section 2, any user or anonymous client can update or archive any product by slug.  
**Fix:** Enforce auth and creator ownership in PATCH and DELETE as described above.

---

### 2. Unauthenticated order list (GET /api/orders)

**Risk:** Full order list is exposed to anyone.  
**Fix:** Require auth and scope orders by user (buyer or creator) as in Section 2.

---

### 3. Download by order ID only (no buyer check)

**Where:** `app/api/download/[id]/route.ts`.  
**Risk:** The API only checks that the order exists and has `status: 'paid'`. It does not verify that the requester is the buyer. Anyone who obtains an order ID (e.g. from a leaked URL, log, or brute force) can get a presigned URL and download the file.

**Fix:** Require authentication. After loading the order, require that the session user’s `_id` matches `order.userId`. If no `userId` on the order (legacy), you may need to match by email or deny download until the order is linked to a user. Return 403 if the current user is not the buyer.

---

### 4. Webhook signature verification

**Where:** `app/api/webhooks/stripe/route.ts`.  
**Status:** Signature is verified with `stripeClient.webhooks.constructEvent(payload, signature, webhookSecret)`. Missing or invalid signature returns 400. This is correct.

**Recommendation:** Ensure `STRIPE_WEBHOOK_SECRET` is the one for the endpoint used in production (no test secret in prod).

---

### 5. Cookie security

**Where:** Session and affiliate cookies set in `app/api/auth/*`, `app/api/affiliate/click/route.ts`.  
**Status:** Session cookie uses `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`. Affiliate cookie same. Good.  
**Recommendation:** Use `secure: true` in production and ensure production is served over HTTPS. Consider short-lived session with refresh if needed later.

---

### 6. Affiliate ref = userId (no signing)

**Where:** Ref link uses `ref=<userId>` (MongoDB ObjectId). Stored in cookie and in checkout metadata.  
**Risk:** A user could try to set another user’s ID as ref to attribute sales to them; the join and click flows validate that the ref user is an affiliate for the product, so only valid affiliates get credit. The main abuse is “self-referral”: buyer uses their own ref link.  
**Current mitigation:** In `app/api/checkout/route.ts`, `if (!affiliateUserIdObj.equals(buyer._id!))` prevents attaching the buyer as affiliate. Webhook also checks `!product.creatorId.equals(new ObjectId(affiliateUserId))`. So self-referral and creator-as-affiliate are blocked.  
**Remaining risk:** Cookie can be overwritten by any ref visit; last ref wins. Optional improvement: sign or encrypt ref in the link so only your server can validate it (e.g. ref = signed(userId, productId)).

---

## SECTION 4 — DATABASE DESIGN REVIEW

### users

- **Fields:** `_id`, `name`, `email`, `passwordHash`, `avatar?`, `bio?`, `stripeAccountId?`, `stripeOnboardingComplete?`, `createdAt`, `updatedAt`.  
- **Assessment:** Adequate for MVP. Consider index on `email` (unique) for login lookups; MongoDB may already have one if you created it. No index on `stripeAccountId` unless you look up by it.

### products

- **Fields:** `_id`, `title`, `description`, `price`, `coverImage?`, `pdfUrl?`, `slug`, `category`, `creatorId`, `creatorName`, `features?`, `status`, `views`, `sales`, `rating`, `reviewCount`, `affiliateEnabled?`, `affiliateCommissionPercent?`, `createdAt`, `updatedAt`.  
- **Assessment:** Slug should be unique for active listing; ensure a unique index on `slug` (or compound with status if you allow reuse). Indexes: `creatorId`, `status`, `category` for listing and dashboard. `slug` + `status` for product page and API.

### orders

- **Fields:** In code: `productId`, `productTitle`, `productPrice`, `userId?`, `buyerEmail`, `buyerName`, `status`, `createdAt`, `updatedAt`; webhook also sets `stripeSessionId` (not in type).  
- **Assessment:** Add `stripeSessionId` to the type and create a **unique sparse index** on `stripeSessionId` to prevent duplicate orders on webhook retries. Index `userId` and `status` for dashboard; `productId` for creator earnings.

### affiliates

- **Fields:** `_id`, `userId`, `productId`, `commissionPercent`, `createdAt`.  
- **Assessment:** Unique compound on `(userId, productId)` to prevent duplicate joins. Index `userId` for “my affiliates” and `productId` for click/checkout lookup.

### affiliateClicks

- **Fields:** `_id`, `affiliateId`, `productId`, `refUserId`, `ip`, `userAgent`, `createdAt`.  
- **Assessment:** Index `affiliateId` for stats aggregation. Optional TTL or archive policy for old clicks if volume grows.

### affiliateSales

- **Fields:** `_id`, `affiliateId`, `productId`, `orderId`, `affiliateUserId`, `creatorUserId`, `saleAmount`, `commissionAmount`, `createdAt`.  
- **Assessment:** Index `affiliateId` and `creatorUserId` for dashboard and earnings. Optional unique constraint on `orderId` if each order can only be attributed to one affiliate (currently one sale per order; no duplicate check).

---

## SECTION 5 — STRIPE FLOW VALIDATION

- **Webhook signature:** Present and enforced; invalid signature returns 400.  
- **Duplicate webhook handling:** Implemented by checking `ordersCollection.findOne({ stripeSessionId: session.id })` before creating the order. Recommend adding a unique index on `stripeSessionId` so the DB enforces it.  
- **Order duplication:** Same as above; idempotency is by `stripeSessionId`.  
- **Metadata:** Session metadata includes `productId`, `userId`, `buyerName`, and optionally `affiliateUserId`. Webhook reads these and creates the order and affiliate sale. Ensure Stripe dashboard is configured to send these metadata fields (they are set at session create; no extra config needed).  
- **Payment status:** Webhook returns early with `received: true` if `session.payment_status !== 'paid'`, so only paid sessions create orders.  
- **Missing:** No explicit handling of `checkout.session.expired` or other events; acceptable for MVP. Consider idempotent handling of `payment_intent.succeeded` if you ever use Payment Intents directly.

---

## SECTION 6 — AFFILIATE SYSTEM REVIEW

- **Ref links:** Format `/produto/<slug>?ref=<userId>`. Correct; validated in click handler against product and affiliate record.  
- **Cookie tracking:** 30-day `affiliate_ref` cookie set by `/api/affiliate/click`. Checkout reads it and passes `affiliateUserId` in metadata. Logic is consistent.  
- **Checkout validation:** Checkout ensures ref user is not the buyer and is an affiliate for the product; only then adds `affiliateUserId` to metadata.  
- **Webhook validation:** Webhook checks `affiliateUserId`, `product.affiliateEnabled`, and that affiliate exists and is not the creator; then creates `AffiliateSale` and computes commission from `affiliate.commissionPercent ?? product.affiliateCommissionPercent ?? 0`.  
- **Commission calculation:** `commissionAmount = (product.price * commissionPercent) / 100`. Correct.  
- **Fraud / bugs:** Self-referral and creator-as-affiliate are blocked. No server-side check that the click’s ref matches the cookie at checkout (cookie could be overwritten by another ref; last ref wins). Optional: store `affiliateId` or a signed token in the cookie instead of raw userId to bind to a specific product. For MVP the current design is acceptable if you accept “last click” attribution.

---

## SECTION 7 — ENVIRONMENT VARIABLES

Required and used in the codebase (source code only, excluding .next):

| Variable | Used in | Purpose |
|----------|---------|--------|
| `STRIPE_SECRET_KEY` | checkout, webhook, stripe/connect | Stripe API (Create Checkout Session, webhooks, Connect accounts). |
| `STRIPE_WEBHOOK_SECRET` | webhooks/stripe | Verify `stripe-signature` on webhook POST. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | checkout page (client) | Stripe.js / redirectToCheckout. |
| `AUTH_SECRET` | lib/auth | HMAC signing of session token. |
| `MONGODB_URI` | lib/mongodb | MongoDB connection. |
| `AWS_ACCESS_KEY_ID` | api/upload, api/download | S3 upload and presign. |
| `AWS_SECRET_ACCESS_KEY` | api/upload, api/download | S3. |
| `AWS_REGION` | api/upload, api/download | S3 client region and URL. |
| `AWS_S3_BUCKET` | api/upload, api/download | Bucket name. |
| `NEXT_PUBLIC_APP_URL` | checkout success/cancel URLs, stripe connect return/refresh, affiliate links, affiliates/stats, affiliates/join | Base URL for redirects and affiliate links. |
| `PLATFORM_FEE_PERCENT` | checkout, dashboard/earnings | Platform fee (0–100) for Connect transfers and earnings display. |

Optional / not referenced in app code: Stripe Connect Client ID is not used (Express accounts created with secret key only). No `NEXTAUTH_*` (custom auth).

---

## SECTION 8 — DEPLOYMENT CHECKLIST

- [ ] **Environment:** Set all variables from Section 7 in production (e.g. Vercel/host env). Use production Stripe keys and webhook secret for the live endpoint.  
- [ ] **Database indexes:** Create: `users.email` (unique); `products.slug` (unique) or (slug, status); `products.creatorId`, `products.status`, `products.category`; `orders.stripeSessionId` (unique, sparse), `orders.userId`, `orders.productId`, `orders.status`; `affiliates` (userId, productId) unique; `affiliateClicks.affiliateId`; `affiliateSales.affiliateId`, `affiliateSales.creatorUserId`.  
- [ ] **Stripe:** Live mode; Connect enabled; webhook endpoint `https://<your-domain>/api/webhooks/stripe` for `checkout.session.completed` (and any others you add).  
- [ ] **S3:** Bucket exists; IAM credentials have `s3:PutObject`, `s3:GetObject` for the bucket; CORS if needed for direct uploads; bucket/keys private (presigned URLs for download).  
- [ ] **Webhook:** After deploy, register URL in Stripe and set `STRIPE_WEBHOOK_SECRET`; test with Stripe CLI or a test payment.  
- [ ] **Production domain:** Set `NEXT_PUBLIC_APP_URL` to production URL (https). Ensure cookies use `secure: true` in production.

---

## SECTION 9 — PERFORMANCE RISKS

- **~100 users:** Current design is fine if indexes above are in place.  
- **~1k users:** Listings and dashboards use `find().sort().skip().limit()`; ensure indexes on filter/sort fields (e.g. products by status/category/createdAt, orders by userId/status). Affiliate stats use aggregation on `affiliateId`; index `affiliateClicks.affiliateId` and `affiliateSales.affiliateId`.  
- **~10k users:** Same indexes; consider pagination caps and rate limiting. Product view count uses `$inc` on every product page load; high traffic could cause contention on the same document; acceptable for MVP, later consider batching or approximate counters. No caching of product or order lists; add later if needed.  
- **Missing indexes:** Without the recommended indexes, product listing, order list, and affiliate aggregations will do collection scans as data grows.  
- **Memory:** No streaming of large responses; order/product lists are bounded by limit (e.g. 20). Upload buffers the file in memory (max 50MB); acceptable for MVP.

---

## SECTION 10 — FINAL VERDICT

**NEEDS FIXES BEFORE LAUNCH**

**Reasons:**

1. **Critical:** Product PATCH/DELETE are unauthenticated and un-scoped — any party can change or archive any product.  
2. **Critical:** GET /api/orders returns all orders unauthenticated — full data leak.  
3. **Critical:** Download API does not verify that the requester is the buyer — anyone with an order ID can download paid content.  
4. **Critical:** The download page flow is broken (API redirects, page expects JSON), so users may never see a successful download from the app.  
5. **High:** Orders created via POST /api/orders use `status: 'completed'` and are invisible to dashboard and download logic.  
6. **Medium:** Order type and schema should include `stripeSessionId` and a unique index for safe webhook idempotency.

Address the four critical items (auth on product mutations, auth and scope on GET orders, buyer verification on download, and working download UX) before first production deploy. The rest can follow in a short post-launch sprint.
