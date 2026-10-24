# Huncho HMS — Hostel Management System

A role-aware web platform for running a student hostel: rooms and allocations, fees and payments, the mess, visitors, complaints, attendance, and staff operations. It replaces paper registers and scattered spreadsheets with one system. Each of the seven staff and student roles sees only what it should, and the database itself enforces that through Row-Level Security.

> Built with React 18, TypeScript and Supabase (PostgreSQL, Auth, Realtime). Briefly piloted at a student hostel.

<!-- Add a hero screenshot here, e.g. docs/screenshots/dashboard.png -->

---

## Roles

| Role | What they do in the system |
|---|---|
| **Admin** | Full control: users, buildings, settings, institutional finances, audit trail |
| **Warden** | Day-to-day hostel operations: students, allocations, attendance, directives, complaints |
| **Finance Officer** | Fee invoices, payments, fund requisitions, expenses, revenue reports |
| **Security** | Visitor check-in and check-out, incidents, access control |
| **Maintenance Staff** | Assigned complaints and maintenance tasks, inventory |
| **Auditor** | Read-only oversight across operations and finances |
| **Student** | Own room, invoices and payments, mess subscription and meal bookings, complaints, visitors |

---

## Modules

| Module | Highlights |
|---|---|
| **Dashboard** | Role-specific KPIs and live operational overview |
| **Students & Enrollment** | Enrollment protocol that automatically raises the initial invoices (room, mess, deposit) and sends a welcome notification |
| **Rooms & Allocations** | Buildings, rooms, capacity and inspection status; allocations kept in sync with room occupancy by trigger |
| **Payments & Finance** | Invoices, payment tracking, fund requisitions, institutional expenses, ledger details |
| **Mess** | Meal plans, menus, subscriptions, meal bookings, feedback, stock levels |
| **Visitors** | Visitor registration and check-in/out log for security staff |
| **Complaints** | Submission, assignment, status tracking and resolution |
| **Attendance** | Student attendance records |
| **Analytics & Reports** | Charts (Recharts) and report generation for oversight and audits |
| **Notifications** | In-app notifications pushed live via Supabase Realtime |
| **Settings** | System-wide configuration |

---

## Architecture

```
 React 18 + TypeScript + Vite + Tailwind v4 (shadcn/ui)
   ├─ pages/      13 feature pages (one per module)
   ├─ hooks/      12 data hooks (useStudents, usePayments, useMess, …)
   └─ contexts/   auth + realtime notifications
            │
            ▼  supabase-js
 Supabase
   ├─ Auth                 email/password sign-in, role from users table
   ├─ PostgreSQL           21 tables (see supabase/schema.sql)
   ├─ Row-Level Security   ~60 policies, helper fns check_is_staff / check_is_admin_or_warden
   ├─ Triggers             room occupancy sync, enrollment → invoices, updated_at stamps
   └─ Realtime             live notification feed
```

### Data model
`users` · `students` · `buildings` · `rooms` · `room_allocations` · `payments` · `fund_requisitions` · `institutional_expenses` · `mess_plans` · `mess_menus` · `student_mess_subscriptions` · `meal_bookings` · `inventory_items` · `visitors` · `complaints` · `incidents` · `attendance` · `directives` · `missions` · `notifications` · `audit_logs` · `system_settings`

---

## Getting started

### 1. Database
1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`.
3. Apply the patches in `supabase/patches/` in this order:
   `RLS_FIX` → `MESS_MANAGEMENT_UPDATE` → `ENROLLMENT_PROTOCOL` → `SCHEMA_CASCADE_FIX` → `RLS_ENROLLMENT_FIX` → `FIX_STAFF_RLS`
4. Optionally load the demo data from `supabase/seed/`.

### 2. App
```bash
cp .env.example .env        # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev                 # http://localhost:5173
npm run build               # production build in dist/
```

---

## Repository layout

```
src/app/pages/        Feature pages
src/app/hooks/        Supabase data hooks
src/app/components/   UI components (shadcn/ui based)
src/app/contexts/     Auth and notifications
src/lib/supabase.ts   Supabase client
supabase/schema.sql   Full schema, RLS policies, functions and triggers
supabase/patches/     Incremental fixes applied after the base schema
supabase/seed/        Demo data
docs/                 Design notes: architecture, API, deployment
```

---

## Status and roadmap

- [x] All modules implemented against a live Supabase backend
- [x] Database-level RBAC with RLS
- [x] Realtime notifications
- [ ] Consolidate `supabase/patches` into numbered migrations
- [ ] Code-split the bundle (the main chunk is over 500 kB)
- [ ] Online payment gateway (payments are currently recorded manually)
- [ ] Automated tests

---

## Credits

Developed by **Owan Brandon Leku** ([GitHub](https://github.com/OwenBrandon)), with Ambe Precious Neba.
