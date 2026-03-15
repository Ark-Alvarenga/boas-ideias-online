# AUDIT REPORT – MVP Readiness

**Scope:** MVP marketplace with user registration, product creation, Stripe checkout, and buyer access to purchased content.  
**Stack:** Next.js 16, MongoDB, Stripe (Checkout + Connect), AWS S3.

---

## 1. Current Implemented Features

- **Auth:** Register (`POST /api/auth/register`), login (`POST /api/auth/login`), session cookie (HMAC-signed), `GET /api/auth/me`, logout. Login/register and dashboard pages exist.
- **Products:** Create product (`POST /api/products`) with slug, status (draft/active by Stripe onboarding), PATCH/DELETE by creator. GET list (public: `status: 'active'`), GET by slug. Create-product page with PDF upload (`POST /api/upload`) and optional cover (`POST /api/upload/cover`); pdfUrl/coverImage saved on product.
- **Marketplace:** Public listing (`GET /api/products`), product cards, filters, link to `/produto/[slug]`. Product page shows details and "Comprar Agora" → `/checkout/[slug]`.
- **Checkout:** Auth required. `POST /api/checkout` builds Stripe Checkout Session with metadata (productId, userId, buyerName, optional affiliateUserId), success_url `/dashboard`, cancel_url product page. Connect transfer when creator has `stripeAccountId`.
- **Webhook:** `POST /api/webhooks/stripe` verifies signature, handles `checkout.session.completed`, creates order with `stripeSessionId`, prevents duplicates by session id, increments product sales, creates affiliate sale when applicable.
- **Orders:** Stored with productId, userId (from metadata), buyerEmail, buyerName, status `paid`, stripeSessionId. GET `/api/orders` requires auth and returns only `userId: currentUser`.
- **Download:** `GET /api/download/[id]` requires auth, loads order by id and `status: 'paid'`, enforces `order.userId === currentUser`, builds presigned S3 URL from `product.pdfUrl`, redirects or returns JSON. Dashboard "Baixar PDF" links to `/api/download/${order._id}`.
- **Seller earnings:** Dashboard earnings page shows orders where `productId` in creator’s products, status `paid`, with platform fee and estimated earnings. Stripe Connect status/onboarding exists.

---

## 2. Critical Missing Features

- **None.** The 10 MVP requirements are implemented end-to-end: register/login, create and upload product, product in DB, marketplace listing, product page, purchase, Stripe payment, order and payment data stored, seller sees sales, buyer gets access via download.

---

## 3. Backend Gaps

1. **Dashboard crash when user has no products**  
   **File:** `app/dashboard/page.tsx` (around line 143)  
   **Issue:** `<p>{userProducts[0].coverImage?.toString()}</p>` is rendered unconditionally. When `userProducts.length === 0`, `userProducts[0]` is `undefined` and the page throws.  
   **Fix:** Remove this line or render it only when `userProducts.length > 0` (e.g. `{userProducts[0] && <p>...</p>}`).

2. **GET /api/products/[slug] and async params**  
   **File:** `app/api/products/[slug]/route.ts`  
   **Issue:** GET uses `const { slug } = context.params` without `await`. In Next 15+, `context.params` can be a Promise; PATCH/DELETE in the same file use `await context.params`. If the runtime passes a Promise, GET may receive an object with undefined `slug` and return 404 or incorrect data.  
   **Fix:** Use `const { slug } = await Promise.resolve(context.params)` (and type `RouteContext.params` as `Promise<{ slug: string }> | { slug: string }` if desired) so GET is consistent and safe.

3. **No MongoDB indexes documented or applied**  
   **Issue:** No code or migration creates indexes. For MVP, small data may be fine, but missing indexes on e.g. `orders.userId`, `orders.stripeSessionId`, `products.slug`, `products.status` will hurt as data grows.  
   **Fix:** Add indexes (e.g. in a seed script or migration): `orders`: `userId`, `stripeSessionId` (unique); `products`: `slug`, `status`, `creatorId`; `users`: `email` (unique). Not blocking MVP but recommended before production.

---

## 4. Frontend Gaps

1. **Dashboard crash (frontend impact)**  
   Same as §3.1: the dashboard page throws for users with zero products because of `userProducts[0]` access. This is the only blocking frontend bug for MVP.

2. **No explicit “payment success” or “order confirmed” step**  
   After Stripe payment, the user is sent to `success_url` (`/dashboard`). There is no dedicated “Thank you, your order is confirmed” or “Download your file” screen. MVP is still satisfied because the dashboard lists orders and the download link is there; a success message or redirect param could improve UX later.

---

## 5. Payment System Gaps

1. **Webhook idempotency**  
   Duplicate orders are prevented by checking `orders.stripeSessionId` before insert. The `Order` type includes `stripeSessionId`. No unique index on `stripeSessionId` in code; adding one in the DB would enforce idempotency at the storage level.

2. **Stripe Connect required for seller payout**  
   If the creator has not completed Stripe Connect onboarding, checkout still creates a session but without `transfer_data`; payment is captured by the platform only. This is intentional; sellers must connect Stripe to receive payouts. No code gap for MVP.

3. **Orders without userId**  
   Webhook sets `order.userId` from `metadata.userId` when valid; otherwise `userId` is undefined. Checkout requires auth and always sends `userId`, so in practice all new orders have `userId`. If `userId` were missing, the order would not appear in the buyer dashboard (filter is `userId: user._id`) and download would 403. No change required for current flow; document that checkout must remain authenticated so metadata includes userId.

---

## 6. Data Model Problems

- **Orders:** Have `productId`, `productTitle`, `productPrice`, `userId`, `buyerEmail`, `buyerName`, `status`, `createdAt`, `updatedAt`, `stripeSessionId`. Sufficient for MVP. Optional: unique index on `stripeSessionId`.
- **Products:** Have `pdfUrl`, `coverImage`, `slug`, `status`, `creatorId`, etc. Sufficient. Products without `pdfUrl` correctly return “No file available” from the download route.
- **Users:** Have `stripeAccountId`, `stripeOnboardingComplete`. Sufficient for Connect and product status.
- No missing collections or fields required for the 10 MVP requirements.

---

## 7. Security Issues

1. **Download access**  
   Implemented correctly: auth required, order must be `paid`, and `order.userId` must equal the current user. No change needed for MVP.

2. **Orders list**  
   GET `/api/orders` is authenticated and scoped to `userId: currentUser`. No change needed.

3. **Product mutation**  
   PATCH and DELETE `/api/products/[slug]` verify session and that `product.creatorId` equals the current user. No change needed.

4. **Webhook**  
   Stripe signature is verified with `constructEvent(payload, signature, webhookSecret)`. Invalid signature returns 400. No change needed.

---

## 8. Exact MVP Completion Checklist

- [ ] **Fix dashboard crash:** In `app/dashboard/page.tsx`, remove the line `<p>{userProducts[0].coverImage?.toString()}</p>` or guard it so it only renders when `userProducts.length > 0` (e.g. `userProducts[0] && (...)`).
- [ ] **Stabilize product-by-slug API:** In `app/api/products/[slug]/route.ts`, in the GET handler, resolve params safely (e.g. `const { slug } = await Promise.resolve(context.params)`). Ensure the type of `context.params` allows a Promise if the framework passes one.
- [ ] **Production config:** Set all required env vars (e.g. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MONGODB_URI`, `AUTH_SECRET`, `AWS_*`, `NEXT_PUBLIC_APP_URL`). Register the Stripe webhook URL (`https://<domain>/api/webhooks/stripe`) and subscribe to `checkout.session.completed`.
- [ ] **(Recommended)** Add MongoDB indexes for `orders` (e.g. `userId`, unique `stripeSessionId`), `products` (e.g. `slug`, `status`), and `users` (e.g. unique `email`) before or shortly after launch.

---

## 9. Estimated Effort

| Task | Effort | Notes |
|------|--------|--------|
| Remove or guard `userProducts[0]` on dashboard | **Trivial** | Single line change or conditional. |
| Await/resolve params in GET `/api/products/[slug]` | **Trivial** | One-line change in the GET handler. |
| Production env and Stripe webhook setup | **Small** | Documentation + config; no code. |
| Add MongoDB indexes | **Small** | Script or manual index creation; no app logic change. |

**Overall:** The MVP is functionally complete. The only blocking defect is the dashboard crash when the user has no products. The params handling in GET `/api/products/[slug]` is a small robustness fix. The rest are production hardening and optional improvements.
