# CRM — MongoDB → MySQL Migration

This is your CRM backend converted from **Mongoose/MongoDB** to **Sequelize/MySQL**.
The `client/` folder is untouched — same REST API shape, so the frontend needs no changes.

## What changed

| Area | Before | After |
|---|---|---|
| Driver | `mongoose` | `sequelize` + `mysql2` |
| Connection | `server/server.js` → `mongoose.connect()` | `server/config/db.js` → `new Sequelize(...)` |
| Models | 18 files in `server/models/`, Mongoose schemas | Same 18 files, rewritten as Sequelize models, **plus 7 new models** for things that used to be embedded sub-documents/arrays (see below) |
| Relations | `ref: 'Model'` + `.populate()` | `belongsTo`/`hasMany`/`belongsToMany` in `server/models/index.js` + `include` in queries |
| Routes | 17 files, Mongoose query syntax | Same 17 files, rewritten with Sequelize syntax |
| IDs | Mongo `ObjectId`, exposed as `_id` | MySQL `UUID` primary key, **but every model still outputs `_id` in JSON** (see `models/mongoCompat.js`) so the React client needs zero changes |
| Env vars | `MONGO_URI` | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |

### New tables created for previously-embedded data

Mongo let you nest arrays/objects inside a document. MySQL doesn't, so these became their own tables with foreign keys:

- `lead_notes` — was `Lead.notes[]`
- `employee_documents` — was `Employee.documents[]`
- `purchase_order_items` — was `PurchaseOrder.items[]`
- `project_members` — was `Project.members[]`
- `ticket_replies` — was `Ticket.replies[]`
- `user_companies` — was `User.companies[]` (many-to-many join table)
- `ledger_entries.accountName` / `accountCode` — was `LedgerEntry.account: { name, code }`, flattened into two columns

## Setup

1. **Install MySQL** locally (or use a hosted MySQL like PlanetScale, Railway, or AWS RDS).
2. Create a database:
   ```sql
   CREATE DATABASE crm CHARACTER SET utf8mb4;
   ```
3. Copy the env template and fill in your credentials:
   ```bash
   cd server
   cp .env.example .env
   # edit DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the server — tables are auto-created on first run via `sequelize.sync()`:
   ```bash
   npm run dev
   ```
6. Seed the initial company + super admin:
   ```bash
   npm run seed
   ```

## Important notes before going to production

- **`sequelize.sync({ alter: true })`** in `server.js` auto-adjusts tables to match your models in development. This is convenient but risky on production data — switch to proper Sequelize migrations (`sequelize-cli`) once your schema stabilizes, instead of relying on `sync`.
- **UUIDs vs auto-increment ints**: I used UUID primary keys to keep ID *handling* (string-based, no renumbering, frontend-compatible) as close to Mongo's `ObjectId` behavior as possible. If you'd rather have simpler auto-increment integer IDs for performance/readability, that's a follow-up change to each model's `id` field — ask if you want that swapped in.
- **Ticket numbering**: `Ticket.ticketId` is now a true MySQL `AUTO_INCREMENT` column, which is safer under concurrent requests than the old Mongoose `pre('save')` counter hook.
- **Transactions**: Multi-row creates that used to be atomic "for free" inside one Mongo document (Purchase Orders + their items, Projects + their members) now explicitly use Sequelize transactions (`sequelize.transaction()`) to keep that same atomicity.
- **Search**: Mongo's `$regex` case-insensitive search became SQL `LIKE`. MySQL's default collation is usually already case-insensitive, but double-check your DB's collation if search behavior seems off.
- **`_id` compatibility shim**: `server/models/mongoCompat.js` makes every model also emit `_id` (mirroring `id`) in JSON responses, since your React app reads `_id` in 22+ places. If you ever do a deliberate frontend refactor to use `id` instead, you can remove this shim.

## What I verified

- Every file passes `node --check` (syntax valid)
- Every model file and `models/index.js` (all associations) imports and initializes without error
- All 17 route files import cleanly with no missing exports/typos
- The `_id` compatibility shim was tested to correctly alias `id → _id` while still stripping `password` from `User` output

## What I could NOT verify here

I don't have a MySQL server available in this environment, so I could not run actual queries against a live database. Please test thoroughly — especially:
- Login flow (`/api/auth/login`)
- Creating a Lead with a note, then viewing its timeline
- Creating a Purchase Order with line items
- The dashboard stats/activity endpoints (heaviest aggregation logic)
