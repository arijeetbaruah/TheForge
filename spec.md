# The Forge — Project Spec

## Overview

A medieval-themed order submission platform where users can commission weapons, armor, poisons, and consumables. Built with React (Vite), Vercel serverless backend, Firebase Auth, and Google Sheets (via Apps Script) as the data store.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + TypeScript, React Router |
| Styling | Bootstrap 5, SCSS |
| Backend | Vercel Serverless Functions (API routes, TypeScript) |
| Auth | Firebase Authentication |
| Data | Google Sheets + Apps Script |
| Hosting | Vercel |

---

## Aesthetic

**Theme: Medieval Parchment**

- Background textures resembling aged parchment paper
- Serif / blackletter typography (e.g. MedievalSharp, Cinzel, or IM Fell English)
- Earth tones: aged cream (`#f5e9c8`), dark ink (`#2b1d0e`), burnt sienna accents
- Decorative dividers, wax-seal style buttons, scroll-like UI panels
- Subtle worn/distressed effects on cards and borders

---

## Routes

| Path | Component | Access |
|---|---|---|
| `/` | `OrderForm` | Public |
| `/orders` | `OrderHistory` | `user`, `member`, `admin` |
| `/forge` | `ForgeQueue` | `member`, `admin` |
| `/admin` | `AdminDashboard` | `admin` only |
| `/login` | `Login` | Public |

---

## Firebase Auth

- Two sign-in methods: **Email/password** and **Google OAuth** (via popup)
- Both methods resolve to the same Firebase user — accounts with the same email are linked automatically
- Auth state managed via React context (`AuthContext`)
- Protected routes redirect to `/login` if unauthenticated
- On first sign-in (either method), a user record is created server-side with role `user` and an empty `discordId`
- Roles: `user`, `member`, `admin` — stored as Firebase custom claims, set by an admin via the Admin Dashboard
- Role is checked server-side on every protected API route by decoding the ID token

| Role | Description |
|---|---|
| `user` | Can submit orders and view their own order history. Discord ID autofills from their profile. |
| `member` | Part of The Forge. Can browse all open orders and claim one to work on. |
| `admin` | Full access — manage users/roles, view and action all orders. |

---

## Pages & Components

### `/` — Order Submission Form

The core page. A parchment-styled scroll form with cascading dropdowns.

**Fields:**

1. **Category** — top-level selector, hardcoded client-side; drives filtering of items and enchantments
   - Weapon
   - Armor
   - Poison
   - Consumable

2. **Base Item** — dropdown populated from `Mundane Items` tab, filtered by category. Each item carries `ItemName`, `PriceAmount`, and `PriceUnit`

3. **Enchantment** — dropdown populated from `Enchantments` tab, filtered by category. Each enchantment carries `Name` and `Tier`

4. **Character** — text input, the player's character name

5. **Discord ID** — text input; autofills from the authenticated user's stored Discord ID, editable before submit

6. **Providing Base Item** — checkbox; whether the user is supplying their own base item

7. **Quantity** — number input (min 1, default 1)

8. **Submit** — POSTs to `/api/orders`, which forwards to Apps Script `doPost` and appends a row to the `Orders` tab

**POST body sent to Apps Script:**
```json
{
  "taskId":       "generated-uuid",
  "discordId":    "user#1234",
  "character":    "Aldric the Bold",
  "category":     "Weapon",
  "baseItem":     "Sword",
  "enchantment":  "Flaming Edge",
  "providingBase": false,
  "quantity":     "2"
}
```

---

### `/orders` — Order History

Accessible to all authenticated roles. Each user sees only their own orders.

- Fetches from `/api/orders`, filtered server-side by the caller's Discord ID
- Displays: category, base item, enchantment, quantity, status badge, submitted date
- Status badges: `Pending` / `In Progress` / `Complete` / `Cancelled`
- Orders sorted by `Submitted At` descending

---

### `/forge` — Forge Queue

Accessible to `member` and `admin` roles only.

- Fetches all `Pending` orders from `/api/forge/orders`
- Members can claim an order — sets `Assignee` to their name and status to `In Progress`
- Members may only hold one active (`In Progress`) order at a time
- Members can mark their claimed order as `Complete`
- Admins can view and action all orders from this view

---

### `/login` — Login Page

Public. Redirects to `/` if already authenticated.

- **"Sign in with Google"** button — triggers Firebase Google popup auth
- **Email/password form** — email input + password input + submit
- Toggle between the two methods on the same page
- On successful sign-in, new users are provisioned server-side with role `user`

---

### `/admin` — Admin Dashboard

Restricted to `admin` role only.

**Order management:**
- View all orders, filterable by status, category, or Discord ID
- Update any order's status
- Reassign or unassign an order's `Assignee`

**User management:**
- View all registered users and their current roles
- Promote `user` → `member`, demote `member` → `user`
- Promote `member` → `admin`
- Remove a user (revokes Firebase account and clears role)

---

## Vercel Backend (API Routes)

Serverless functions under `/api/`. All protected routes validate the Firebase ID token from `Authorization: Bearer <token>` and enforce role requirements server-side.

| Endpoint | Method | Min Role | Description |
|---|---|---|---|
| `/api/sheet-data` | `GET` | Public | Proxy to Apps Script `doGet` — returns `{ items, enchantments }` |
| `/api/auth/provision` | `POST` | Any auth | Called on first sign-in — creates user record, sets role `user` |
| `/api/orders` | `POST` | Any auth | Submit new order → append row to Orders tab |
| `/api/orders` | `GET` | Any auth | Fetch caller's own orders (filtered by Discord ID) |
| `/api/forge/orders` | `GET` | `member` | Fetch all Pending orders |
| `/api/forge/orders/:taskId` | `PATCH` | `member` | Claim order or update status |
| `/api/admin/orders` | `GET` | `admin` | Fetch all orders unfiltered |
| `/api/admin/orders/:taskId` | `PATCH` | `admin` | Update any order's status or assignee |
| `/api/admin/users` | `GET` | `admin` | List all users with roles |
| `/api/admin/users/:uid` | `PATCH` | `admin` | Update a user's role |
| `/api/admin/users/:uid` | `DELETE` | `admin` | Remove a user |

Auth is verified server-side using the Firebase Admin SDK.

---

---

## Google Sheets — Data Store

All app data lives in a single Google Spreadsheet. The Apps Script web app (`Code.gs`) is bound to the sheet and deployed as **Execute as: Me**, **Access: Anyone**. The Spreadsheet ID is stored in Script Properties as `SPREADSHEET_ID` (not hardcoded).

### Sheet Tabs

**`Mundane Items`** — source for base item dropdowns
| Category | Item Name | Price Amount | Price Unit |
|---|---|---|---|
| Weapon | Sword | 15 | gp |
| Armor | Chainmail | 75 | gp |

**`Enchantments`** — source for enchantment dropdowns
| Category | Name | Tier |
|---|---|---|
| Weapon | Flaming Edge | 2 |
| Armor | Iron Will | 1 |

**`Orders`** — append-only order log; header row is auto-written on first submission
| Task ID | Discord ID | Character | Category | Base Item | Enchantment | Providing Base Item | Quantity | Assignee | Status | Submitted At |
|---|---|---|---|---|---|---|---|---|---|---|
| uuid | user#1234 | Aldric | Weapon | Sword | Flaming Edge | No | 2 | | Pending | 2026-06-04T10:00:00Z |

### Apps Script (`Code.gs`)

`doGet` — returns all items and enchantments in a single response:
```json
{
  "items": [
    { "Category": "Weapon", "ItemName": "Sword", "PriceAmount": 15, "PriceUnit": "gp" }
  ],
  "enchantments": [
    { "Category": "Weapon", "Name": "Flaming Edge", "Tier": "2" }
  ]
}
```

`doPost` — appends a new row to `Orders`. Auto-writes header if sheet is empty. Returns `{ success, taskId }`.

### Vercel API Proxy

The React app never calls Apps Script directly. All requests go through Vercel functions to avoid CORS and keep `APPS_SCRIPT_URL` server-side only.

| Vercel Route | Method | What it does |
|---|---|---|
| `/api/sheet-data` | `GET` | Fetches Apps Script `doGet`, returns `{ items, enchantments }` |
| `/api/orders` | `POST` | Verifies Firebase auth token, generates `taskId`, forwards to Apps Script `doPost` |
| `/api/orders` | `GET` | Reads Orders tab, filters rows by caller's Discord ID |
| `/api/admin/orders` | `GET` | Returns all Orders rows (admin only) |
| `/api/admin/orders/:taskId` | `PATCH` | Updates `Status` cell for a given Task ID (admin only) |

> **Note:** Firebase is used for authentication only. The Google Sheet is the sole data store.

### Frontend Data Flow

- On **page load**, one GET to `/api/sheet-data` fetches all items and enchantments at once
- Client-side filtering by `Category` drives the Base Item and Enchantment dropdowns
- Dropdowns show `Fetching from the forge...` while the request is in flight
- Errors fall back to empty lists with an inline warning




---

## TypeScript Conventions

- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- All API route handlers typed with `VercelRequest` / `VercelResponse`
- Shared types in `src/types/` — key interfaces:

```ts
// src/types/index.ts

export type UserRole = "user" | "member" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  discordId: string;
  role: UserRole;
}

export interface SheetItem {
  Category: string;
  ItemName: string;
  PriceAmount: number;
  PriceUnit: string;
}

export interface SheetEnchantment {
  Category: string;
  Name: string;
  Tier: string;
}

export interface SheetDataResponse {
  items: SheetItem[];
  enchantments: SheetEnchantment[];
}

export interface OrderPayload {
  taskId: string;
  discordId: string;
  character: string;
  category: string;
  baseItem: string;
  enchantment: string;
  providingBase: boolean;
  quantity: string;
}

export interface Order extends OrderPayload {
  assignee: string;
  status: "Pending" | "In Progress" | "Complete" | "Cancelled";
  submittedAt: string;
}
```

---

## Styling — Bootstrap 5 + SCSS

Bootstrap is imported via SCSS so variables can be overridden before compilation. No jQuery; Bootstrap JS components use the native ESM bundle (`bootstrap/dist/js/bootstrap.esm`).

### File Structure

```
src/
└── styles/
    ├── _variables.scss   # Bootstrap variable overrides (colors, fonts, spacing)
    ├── _parchment.scss   # Custom parchment texture, worn edges, scroll panels
    ├── _typography.scss  # Blackletter / serif font setup
    └── main.scss         # Entry point — imports variables, then Bootstrap, then partials
```

### `main.scss` pattern

```scss
// 1. Override Bootstrap variables first
@import "variables";

// 2. Import Bootstrap
@import "bootstrap/scss/bootstrap";

// 3. Project-specific partials
@import "parchment";
@import "typography";
```

### Key variable overrides (`_variables.scss`)

```scss
// Colors
$body-bg:       #f5e9c8;   // aged parchment
$body-color:    #2b1d0e;   // dark ink
$primary:       #8b4513;   // saddle brown
$secondary:     #5c3a1e;
$border-radius: 0.125rem;  // sharp edges for a hand-crafted feel

// Typography
$font-family-base: 'IM Fell English', Georgia, serif;
$headings-font-family: 'Cinzel', serif;
```

---

```
the-forge/
├── api/                            # Vercel serverless functions (TypeScript)
│   ├── sheet-data.ts
│   ├── orders.ts
│   ├── forge/
│   │   └── orders.ts
│   └── admin/
│       ├── orders.ts
│       └── users.ts
├── src/
│   ├── components/
│   │   ├── OrderForm.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── ForgeQueue.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── Login.tsx
│   │   ├── ProtectedRoute.tsx        # accepts requiredRole prop
│   │   └── ui/                       # Parchment-themed Bootstrap component wrappers
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── sheetData.ts
│   ├── styles/
│   │   ├── _variables.scss
│   │   ├── _parchment.scss
│   │   ├── _typography.scss
│   │   └── main.scss
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.local
└── vercel.json
```

---

## Environment Variables

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
FIREBASE_ADMIN_SERVICE_ACCOUNT   # Server-side only (JSON string)
APPS_SCRIPT_URL                  # Google Apps Script exec URL, server-side only
```

---

## Out of Scope (v1)

- Payment processing
- Email/notification on order submission
- File uploads (e.g. reference images)
- Multi-language support
