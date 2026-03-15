# Product lifecycle

This document describes how product status and lifecycle actions work for creators.

---

## Product states

Products have a `status` field with three values:

| Status    | Meaning              | Marketplace | Can be purchased | Creator dashboard |
|-----------|----------------------|-------------|------------------|-------------------|
| **draft** | Not published        | Hidden      | No               | Visible           |
| **active**| Published            | Visible     | Yes              | Visible           |
| **archived** | Removed from sale | Hidden      | No               | Visible           |

### Lifecycle flow

```
draft → active → archived
```

- **draft** – Used when a product is first created (e.g. before Stripe onboarding). Creator can **Publish** (→ active) or **Delete** (permanent).
- **active** – Product is listed in the marketplace and can be bought. Creator can **Archive** (→ archived) or **Delete** (permanent, if no sales).
- **archived** – Product is no longer for sale but still in the database. Creator can **Republish** (→ active) or **Delete** (permanent, if no sales).

---

## Archive

**Action:** Set product status to `archived`.

**Rules:**

- Only the product **creator** can archive (enforced by API).
- Status changes from `active` → `archived`.
- Product **disappears from the marketplace** (all listing and product APIs filter by `status: "active"`).
- Product **cannot be purchased** (checkout only allows `active` products).
- **Orders remain intact** – existing orders and download access are unchanged.
- Product **remains visible** in the creator’s dashboard (products list and “Gerenciar” page).

**API:** `PATCH /api/products/[slug]` with body `{ "status": "archived" }`.

---

## Republish

**Action:** Set product status from `archived` back to `active`.

**Rules:**

- Only the **creator** can republish (same auth as PATCH).
- Status changes from `archived` → `active`.
- Product **reappears in the marketplace** and can be purchased again.

**API:** `PATCH /api/products/[slug]` with body `{ "status": "active" }`.

---

## Delete (permanent)

**Action:** Permanently remove the product document from the database.

**Safety rules:**

- Only the **creator** can delete (enforced by API).
- Product **cannot be deleted if it has any orders** (sales).
  - If the product has at least one order, the API returns:
    - **HTTP 400**
    - Message: `"Product cannot be deleted because it already has sales."`
- If there are **no orders**, the product document is **deleted** from the `products` collection.
- S3 files (PDF, cover) are **not** deleted in this MVP; they may remain in the bucket.

**API:** `DELETE /api/products/[slug]`.

**Invalid status transitions:** The API does not allow arbitrary status values. PATCH only accepts `status` equal to `"draft"`, `"active"`, or `"archived"`.

---

## Marketplace protection

These behaviors are guaranteed:

- **Marketplace list** (`GET /api/products` without `userId`) returns only products with `status: "active"`.
- **Single product** for public page and checkout (`GET /api/products/[slug]`) returns only when `status: "active"`.
- **Checkout** (`POST /api/checkout`) only accepts products with `status: "active"`.
- **Affiliate join** and **affiliate click** only consider `active` products.

Archived (and draft) products never appear in the marketplace or in the purchase flow.

---

## Purchase restrictions

- **Only active products can be purchased.**  
  Checkout (`POST /api/checkout`) loads the product by id; if `status !== "active"` it returns **400** with message: `"This product is not available for purchase."`  
  So draft and archived products cannot be bought.

- **Creators cannot buy their own product.**  
  If the current user is the product creator (`product.creatorId === currentUser._id`), checkout returns **400** with message: `"You cannot purchase your own product."`

- **Public product page (`/produto/[slug]`).**  
  Only products with `status: "active"` are returned. Draft and archived products get **404** (not found), so they are not publicly accessible.

---

## Dashboard status badges

On the creator dashboard product list ("Meus produtos"), each product shows:

- **ACTIVE** – Green badge. Product is visible in the marketplace and can be purchased.
- **ARCHIVED** – Gray badge. Product is hidden from the marketplace.
- **DRAFT** – Yellow badge. Product is not published (e.g. created before Stripe onboarding).

Each product card also shows **Vendas: X**, where X is the number of paid sales for that product (from the `product.sales` field, which is updated when orders are created).

---

## Duplicate slug protection

When **creating** a product (`POST /api/products`), the slug is generated from the title. If a product with that slug **already exists**, the API returns **400** with message: `"A product with this slug already exists."`  
The creator must use a different title (or ensure the resulting slug is unique) before the product can be created.

---

## Creator dashboard

- The creator’s **products list** shows all their products (any status: draft, active, archived).
- The **“Gerenciar”** page for a product shows:
  - **Active:** Archive, Excluir permanentemente.
  - **Archived:** Republicar, Excluir permanentemente.
  - **Draft:** Publicar no marketplace, Excluir permanentemente.
- Destructive actions (Archive, Excluir permanentemente) use confirmation dialogs before calling the API.
