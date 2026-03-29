# Albania Car Rentals – TIA Airport Marketplace

A minimal, functional web demo for a **multi-vendor car rental marketplace** focused on **Tirana International Airport (TIA)**. Built with Next.js (App Router), Prisma, SQLite, and Leaflet + OpenStreetMap.

> **No API keys or accounts required.** The map is powered by the free [OpenStreetMap](https://www.openstreetmap.org/) tiles via [Leaflet](https://leafletjs.com/).

---

## Features

- 🔍 **Date-range availability search** – finds cars with no overlapping booking blocks
- 📍 **Interactive map** – free Leaflet/OpenStreetMap pins for each pickup point, colour-coded by type
- 🏪 **Multi-dealer, multi-pickup-point** – each dealer can have multiple pickup locations
- 🚗 **Car listings** – cars grouped by their default pickup point
- 🧩 **Pickup point types** – Self Pickup · Key Delivery · Meet & Greet (with instructions + optional fee)
- 📦 **Demo seed data** – 2 dealers, 3 pickup points, 5 cars, 5 availability blocks

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | SQLite (via `@prisma/adapter-libsql` + `@libsql/client`) |
| ORM | Prisma 7 |
| Map | Leaflet + OpenStreetMap (free, no account needed) |
| Styling | Tailwind CSS 4 |

---

## Running Locally

### Prerequisites

- **Node.js 18+** – [download](https://nodejs.org/)
- **npm** (comes with Node.js)

### 1. Clone and install

```bash
git clone https://github.com/renisosmani/albania-car-rentals.git
cd albania-car-rentals
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

The default `.env.local` works out of the box — no tokens or accounts required:

```env
DATABASE_URL="file:./dev.db"
```

### 3. Set up the database

Run migrations (creates `dev.db` in the project root):

```bash
npm run db:migrate
```

### 4. Seed demo data

```bash
npm run db:seed
```

This inserts:
- **2 dealers**: TIA Express Rentals, Adriatic Auto
- **3 pickup points**: TIA Terminal 1 Self Pickup, TIA Terminal 1 Meet & Greet, TIA Airport Road Key Delivery
- **5 cars**: VW Polo, Toyota Corolla, BMW X3, Hyundai i20, Mercedes GLC
- **5 availability blocks** (relative to today's date, so they're always in the future)

### 5. Start the development server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **All five steps at once** (copy-paste friendly):
> ```bash
> git clone https://github.com/renisosmani/albania-car-rentals.git
> cd albania-car-rentals
> npm install
> cp .env.example .env.local
> npm run db:migrate
> npm run db:seed
> npm run dev
> ```

---

## Usage

1. Select a **Pickup Date** and **Return Date**
2. Click **Search**
3. The list shows pickup points with the count of available cars for your dates
4. The map shows coloured pins for each pickup point (blue = Self Pickup, green = Key Delivery, amber = Meet & Greet)
5. Click a list item or map pin to see **detailed car listings** and **pickup instructions**

---

## Data Model

```
Dealer
  ├── PickupPoint (name, lat, lng, type, instructions, fee)
  └── Car (make, model, year, category, pricePerDay, defaultPickupPointId)
        └── AvailabilityBlock (startDate, endDate)
```

### Availability logic

A car is **available** for `[requestStart, requestEnd)` if **no** block overlaps:

```
block overlaps  ↔  blockStart < requestEnd  AND  requestStart < blockEnd
```

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset DB and re-seed |
| `npm run lint` | Run ESLint |

---

## API

### `GET /api/search`

Query params:

| Param | Type | Required | Example |
|---|---|---|---|
| `pickupDate` | `YYYY-MM-DD` | ✅ | `2026-04-10` |
| `returnDate` | `YYYY-MM-DD` | ✅ | `2026-04-15` |

Response:

```json
{
  "results": [
    {
      "pickupPoint": { "id": "...", "name": "...", "lat": 41.414, "lng": 19.720, "type": "SELF_PICKUP", "instructions": "...", "fee": 0 },
      "dealerName": "TIA Express Rentals",
      "availableCarCount": 2,
      "cars": [
        { "id": "...", "make": "Volkswagen", "model": "Polo", "year": 2022, "category": "ECONOMY", "pricePerDay": 28, "imageUrl": "..." }
      ]
    }
  ],
  "requestStart": "2026-04-10T00:00:00.000Z",
  "requestEnd": "2026-04-15T00:00:00.000Z"
}
```

---

## Project Structure

```
albania-car-rentals/
├── app/
│   ├── api/search/route.ts    # Availability search API
│   ├── layout.tsx             # Root layout with header/footer
│   ├── page.tsx               # Search UI (client component)
│   └── globals.css
├── components/
│   └── MapView.tsx            # Leaflet map with pickup-point markers
├── lib/
│   ├── prisma.ts              # Prisma client singleton
│   └── types.ts               # Shared TypeScript types
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── seed.ts                # Demo data seed script
│   └── migrations/            # SQL migration history
├── prisma.config.ts           # Prisma 7 config (datasource URL)
└── .env.example               # Environment variable template
```

---

## Out of Scope (not built yet)

- Auth (dealer login, renter OTP)
- Request-to-book flow
- Dealer dashboard UI
- Billing / invoicing
- PostgreSQL (uses SQLite for local demo; swap `DATABASE_URL` + adapter for production)

