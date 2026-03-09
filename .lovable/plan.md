

# Scaling Digital Savings Box to a Multi-User Platform (GoFundMe-style)

## Current State
Right now there's a single `grid_cells` table with 256 rows -- one savings box, one Stripe account (yours). Everything is public, no auth.

## Target Architecture
A platform where **creators** sign up, create savings boxes, connect their own Stripe account via **Stripe Connect**, and **contributors** pay directly to the creator's Stripe account. You (the platform) can optionally take a fee.

---

## What Needs to Change

### 1. Database Schema

**New tables:**
- `profiles` -- stores creator info (display name, avatar, bio), linked to `auth.users(id)`
- `savings_boxes` -- each box has an owner (profile id), title, description, goal amount, slug (URL), stripe_account_id, created_at
- `grid_cells` gets a new `box_id` column (FK to `savings_boxes`) so cells belong to a specific box

**RLS:**
- `profiles`: users can read all, update only their own
- `savings_boxes`: public read, only owner can create/update/delete
- `grid_cells`: public read, updates only via edge functions (service role)

### 2. Authentication (Creators Only)
- Email/password signup + login pages for box creators
- Contributors do NOT need accounts -- they just visit a box URL and pay
- Password reset flow with `/reset-password` page

### 3. Stripe Connect Integration
- When a creator sets up a box, they go through **Stripe Connect Onboarding** (Standard or Express accounts)
- New edge function: `create-connect-account` -- creates a Stripe Connected Account and returns the onboarding link
- New edge function: `create-connect-onboarding-link` -- generates onboarding URL for returning users
- Update `create-checkout-session` to use `stripe_account` parameter (destination charge) so payment goes to the creator's connected account, with an optional `application_fee_amount` for your platform cut
- Update `stripe-webhook` to handle Connect events

### 4. Multi-Box Routing
- New route: `/box/:slug` -- public page showing a specific savings box
- New route: `/dashboard` -- creator's dashboard to manage their boxes
- New route: `/create` -- form to create a new savings box
- Home page (`/`) becomes a landing page or directory of active boxes

### 5. Creator Dashboard
- List of creator's boxes with progress stats
- Stripe Connect status (onboarded or not)
- Link to create new box

### 6. Updated Edge Functions

| Function | Change |
|----------|--------|
| `create-checkout-session` | Accept `box_id`, look up creator's `stripe_account_id`, create session with destination charge |
| `stripe-webhook` | Handle Connect account events + per-box cell updates |
| `create-connect-account` (new) | Create Stripe Connected Account for creator |
| `verify-payment` | Look up cell by `box_id` + `cell_index` |

---

## Implementation Order

1. **Database migrations** -- add `profiles`, `savings_boxes`, update `grid_cells` with `box_id`, migrate existing data into a default box owned by you
2. **Auth pages** -- signup, login, reset password
3. **Creator dashboard** -- list boxes, create new box
4. **Stripe Connect onboarding** -- edge function + UI flow
5. **Multi-box public pages** -- `/box/:slug` route with the existing grid UI
6. **Update checkout flow** -- destination charges to connected accounts
7. **Landing page** -- browse/discover active savings boxes

---

## Key Decisions

- **Stripe Connect type**: Standard accounts are easiest -- creators manage their own Stripe dashboard. Express accounts give you more control over the UX but require more setup.
- **Platform fee**: Optional. Stripe Connect supports an `application_fee_amount` on each charge (e.g., 5% of each cell payment).
- **Your existing box**: Will be migrated as the first savings box on the platform, preserving your two filled cells.

