# The Forge — Project Spec
---

## Project Overview

**The Forge** is a commission/crafting request web app for a private Discord community. Members submit crafting requests, track order status, and admins manage the queue. Access is gated behind Discord OAuth — only authenticated community members can use the app.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Backend | Express.js + TypeScript + scss |
| Auth | Discord OAuth 2.0 → Firebase Custom Auth |
| Database | Firebase Realtime Database |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Client state | Zustand |
| Routing | React Router v7 |
| Deployment | Render (single service — Express serves built React app) |

---

## Repository Structure

```
the-forge/
  .env                        ← local secrets (never committed)
  .env.example                ← committed template
  .gitignore
  package.json                ← root scripts with concurrently
  client/
    src/
      lib/
        firebase.ts           ← Firebase client SDK init
        api.ts                ← axios instance pointed at /api
        queryClient.ts        ← TanStack Query client
      store/
        authStore.ts          ← Zustand auth store
      pages/
        public/
          Landing.tsx         ← login/splash page
          RequestForm.tsx     ← submit a commission request
          MyOrders.tsx        ← user's own order history
        admin/
          Dashboard.tsx       ← order queue overview
          OrderDetail.tsx     ← single order management
          Members.tsx         ← manage user roles
      components/
        ui/                   ← shadcn/ui primitives
        forge/
          Navbar.tsx
          OrderCard.tsx
          StatusBadge.tsx
          ProtectedRoute.tsx  ← redirects if not authed
          AdminRoute.tsx      ← redirects if not ADMIN role
      pages/
        auth/
          Callback.tsx        ← handles /auth/callback#token=
      hooks/
        useAuth.ts
        useOrders.ts
      types/
        order.ts
        user.ts
      App.tsx
      main.tsx
    vite.config.ts
    tailwind.config.ts
    package.json
  server/
    src/
      lib/
        firebase-admin.ts     ← Admin SDK init
      routes/
        index.ts
        auth.ts               ← Discord OAuth + custom token mint
        orders.ts             ← CRUD for commission orders
        users.ts              ← role management
      middleware/
        requireAuth.ts        ← verify Firebase ID token
        requireAdmin.ts       ← verify ADMIN role
      index.ts                ← Express entry point
    tsconfig.json
    package.json
```

---

## Environment Variables

### `.env` (root, local dev)

```bash
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Firebase Client SDK — MUST be prefixed VITE_ so Vite bakes them in at build time
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Firebase Admin SDK — no VITE_ prefix, server only, never exposed to browser
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Render Production

Set every variable above in the Render dashboard. Additionally:
- `NODE_ENV=production`
- `CLIENT_URL=https://your-app.onrender.com`
- `DISCORD_REDIRECT_URI=https://your-app.onrender.com/api/auth/discord/callback`

`PORT` is set automatically by Render — do not override it.

---

## Auth Flow

```
1. User visits / → not authed → redirect to /login
2. User clicks "Login with Discord"
   → window.location.href = '/api/auth/discord'
3. Express redirects to Discord OAuth consent screen
4. Discord redirects to /api/auth/discord/callback?code=...
5. Express exchanges code → gets Discord user info
6. Express mints Firebase Custom Token (uid = "discord:{discordId}")
7. Express writes/updates user record in Realtime DB with role
8. Express redirects to {CLIENT_URL}/auth/callback#token={customToken}
9. React /auth/callback page reads token from hash, clears URL
10. signInWithCustomToken(auth, token) → Firebase session established
11. Zustand authStore listens to onAuthStateChanged → stores user
12. Redirect to /
```

### Role Hierarchy

```
USER    → can only view their own orders, cannot submit (must be promoted)
MEMBER  → can submit commission requests, view own orders
ADMIN   → full access: manage all orders, promote/demote users
```

New users always start as `USER`. Admins promote them via the Members panel.

---

## Data Models

### User (`/users/{uid}`)

```ts
interface ForgeUser {
  uid: string;              // "discord:{discordId}"
  discordId: string;
  username: string;
  email: string | null;
  avatar: string | null;    // full CDN URL
  role: 'USER' | 'MEMBER' | 'ADMIN';
  createdAt: number;        // timestamp
  updatedAt: number;
}
```

### Order (`/orders/{orderId}`)

```ts
type OrderStatus =
  | 'PENDING'       // submitted, awaiting admin review
  | 'ACCEPTED'      // admin accepted, work not started
  | 'IN_PROGRESS'   // being crafted
  | 'READY'         // ready for delivery
  | 'COMPLETED'     // delivered and closed
  | 'REJECTED';     // declined with reason

type Category =
  | 'WEAPON'
  | 'ARMOUR'
  | 'POTION'
  | 'SCROLL'
  | 'JEWELLERY'
  | 'OTHER';

interface Order {
  id: string;
  userId: string;
  discordUsername: string;
  category: Category;
  itemName: string;
  description: string;
  quantity: number;
  specialRequests: string | null;
  status: OrderStatus;
  adminNote: string | null;     // shown to user (e.g. rejection reason)
  internalNote: string | null;  // admin-only note
  createdAt: number;
  updatedAt: number;
}
```

---

## API Routes

All `/api/*` routes are handled by Express. Routes marked 🔒 require a valid Firebase ID token in `Authorization: Bearer <idToken>`. Routes marked 👑 additionally require `role === 'ADMIN'`.

```
GET    /api/health                    → health check

GET    /api/auth/discord              → redirect to Discord OAuth
GET    /api/auth/discord/callback     → OAuth callback, mint token, redirect to client

GET    /api/orders                  🔒 → MEMBER: own orders. ADMIN: all orders
POST   /api/orders                  🔒 → MEMBER+ creates order
GET    /api/orders/:id              🔒 → owner or ADMIN
PATCH  /api/orders/:id              👑 → update status, notes
DELETE /api/orders/:id              👑 → hard delete

GET    /api/users                   👑 → list all users
PATCH  /api/users/:uid/role         👑 → promote/demote role
```

### Auth Middleware

`requireAuth.ts` — verifies `Authorization: Bearer <idToken>` using `admin.auth().verifyIdToken()`. Attaches decoded token to `req.user`.

`requireAdmin.ts` — reads `req.user.uid`, checks `/users/{uid}/role === 'ADMIN'` in Realtime DB. Returns 403 if not.

---

## Frontend Pages

### Public (requires MEMBER or ADMIN)

**`/` — Landing / Home**
- If not authed: show login page with "Login with Discord" button
- If authed as USER (not yet promoted): show "Awaiting access" message
- If authed as MEMBER/ADMIN: redirect to `/orders`

**`/orders` — My Orders**
- List of the user's own submitted orders
- Status badge per order (colour-coded)
- Link to order detail (read-only for members)

**`/orders/new` — Submit Request**
- Form: Category (select), Item Name, Description, Quantity, Special Requests
- Validation via Zod + React Hook Form
- POST to `/api/orders`

**`/auth/callback` — Auth Callback**
- Reads `#token=` from URL hash
- Calls `signInWithCustomToken`
- Redirects to `/`

### Admin (`/admin/*`, requires ADMIN)

**`/admin` — Dashboard**
- Kanban or table view of all orders grouped by status
- Filter by category, status
- Click order → `/admin/orders/:id`

**`/admin/orders/:id` — Order Detail**
- Full order info
- Status dropdown (change status)
- Admin note field (visible to member)
- Internal note field (admin only)
- Save changes

**`/admin/members` — Members Panel**
- List all users with current role
- Promote USER → MEMBER, demote MEMBER → USER
- Cannot demote/edit other ADMINs

---

## UI Theme — Medieval Parchment

The entire UI should feel like an illuminated manuscript or guild ledger from a fantasy medieval world. This is not a generic "dark fantasy" game UI — it should feel tactile, warm, and aged like real parchment.

### Visual Language

- **Background**: Warm aged parchment texture — `#f4e4bc` base with noise/grain overlay. Use a CSS `background-image` with SVG noise filter or a repeating subtle texture. Pages should feel like paper, not screens.
- **Ink colours**: Deep sepia `#3b2a1a` for body text, near-black `#1a0f00` for headings, faded brown `#7a5c3a` for secondary text and borders.
- **Accent**: Deep wax-seal red `#8b1a1a` for primary actions (submit, confirm). Aged gold `#c9952a` for highlights, active states, and decorative elements.
- **Borders**: Hand-drawn style — use CSS `border` with slightly rough appearance, or SVG corner ornaments on cards and modals. Avoid sharp modern box shadows; prefer `box-shadow: 2px 3px 8px rgba(58,35,12,0.3)`.

### Typography

- **Headings**: `MedievalSharp` or `Cinzel` (Google Fonts) — serif with Roman/inscribed feel
- **Body**: `IM Fell English` or `Lora` — readable old-style serif
- **UI labels / badges**: `Cinzel Decorative` for small caps feel on status labels
- **Avoid**: sans-serif fonts anywhere in the main UI (exception: code/debug output only)

### Components

- **Cards**: Look like torn or cut parchment pieces. Slightly uneven border radius (`border-radius: 2px 4px 3px 5px`). Faint inner shadow to simulate paper depth.
- **Buttons**: Primary buttons look like wax seals or stamped leather — deep red with embossed text effect (`text-shadow: 0 1px 0 rgba(0,0,0,0.4)`). Secondary buttons look like ink stamps.
- **Status badges**: Hand-stamped look. `PENDING` = faded blue ink, `IN_PROGRESS` = amber, `COMPLETED` = forest green ink, `REJECTED` = faded red with strikethrough feel.
- **Forms**: Input fields look like lines ruled on parchment — bottom border only, no box border. Labels above in small caps.
- **Navbar**: Looks like a carved wooden beam or stone lintel across the top. Dark walnut `#2c1a0e` background with gold lettering.
- **Admin dashboard**: Resembles a guild ledger — tabular, dense, ruled lines between rows, column headers in small caps.

### Decorative Details

- Section dividers: SVG quill-drawn horizontal rules — a line with small flourishes at the ends
- Page headers: decorative drop cap on the first letter (CSS `::first-letter`)
- Subtle corner ornaments on modal/card borders (CSS or inline SVG)
- Scrollbars: styled to match (thin, brown track, sepia thumb)
- Login page: large centred emblem/crest above the Discord login button — can be an SVG anvil or forge icon

### Micro-interactions

- Button hover: slight parchment-crinkle scale (`transform: scale(1.02)`) + deepen shadow
- Page transitions: fade in like ink bleeding into parchment (`opacity: 0 → 1, 300ms ease`)
- Form submission: brief "wax seal" stamp animation on the submit button
- Status badge updates: cross-fade between colours

### shadcn/ui Theming

Override shadcn CSS variables in `client/src/index.css` to match the parchment palette:

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

:root {
  --background: #f4e4bc;
  --foreground: #1a0f00;
  --card: #f0d9a8;
  --card-foreground: #3b2a1a;
  --primary: #8b1a1a;
  --primary-foreground: #f4e4bc;
  --secondary: #e8d09a;
  --secondary-foreground: #3b2a1a;
  --muted: #dfc88e;
  --muted-foreground: #7a5c3a;
  --accent: #c9952a;
  --accent-foreground: #1a0f00;
  --destructive: #6b0f0f;
  --border: #c4a96a;
  --input: #e8d09a;
  --ring: #c9952a;
  --radius: 0.25rem;

  --font-heading: 'Cinzel', serif;
  --font-body: 'IM Fell English', serif;
}
```

---

## Key Implementation Notes

1. **`FIREBASE_PRIVATE_KEY` on Render**: The private key is stored with literal `\n` characters. Always replace before use:
   ```ts
   privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
   ```

2. **User role on re-login**: Use `update()` not `set()` on the user record so the role is never overwritten after first login:
   ```ts
   const existing = await userRef.once('value');
   await userRef.update({
     username, avatar, updatedAt,
     ...(!existing.exists() && { role: 'USER', createdAt: Date.now() }),
   });
   ```

3. **Vite proxy in dev**: `vite.config.ts` proxies `/api` to `localhost:3000` so the client never needs to know the Express port.

4. **Express serves React in production**: After `npm run build` compiles both client and server, Express serves `client/dist/` as static files and falls back to `index.html` for all non-API routes.

5. **TanStack Query for all API calls**: Don't use raw `fetch`/`axios` in components — wrap in query/mutation hooks in `hooks/useOrders.ts` etc.

6. **Firebase ID Token in API requests**: After `signInWithCustomToken`, get the ID token via `auth.currentUser.getIdToken()` and attach it as `Authorization: Bearer <token>` on every API request. Set this up in `client/src/lib/api.ts` as an axios interceptor.

---

## Scripts

### Root `package.json`

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build": "cd client && npm run build && cd ../server && npm run build",
    "start": "cd server && npm run start"
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

### Render Build & Start

- **Build command**: `npm run build`
- **Start command**: `npm run start`

---

## Out of Scope (for now)

- Email notifications
- File/image uploads on orders
- Discord bot integration
- Payment handling
- Mobile app
