# Sales Tracker

Web app sederhana untuk melacak sales project dengan Next.js 14 (App Router), Tailwind CSS, Lucide React, dan Supabase.

## Fitur

- **Auth**: Login dengan Supabase Auth
- **Roles**: `admin` dan `sales` (disimpan di tabel `profiles`)
- **Customers**: CRUD master customer (admin & sales)
- **Projects**: Input project (customer, no quote, project name, value, progress type Budgetary/Tender, weekly update), list di dashboard dengan filter Progress Type
- **Security**: Row Level Security (RLS) di Supabase; sales bisa input & edit milik sendiri, admin bisa edit semua

## Setup

### 1. Install dependencies

```bash
cd sales-tracker
npm install
```

### 2. Supabase

1. Buat project di [Supabase Dashboard](https://supabase.com/dashboard).
2. Di **Project Settings > API** ambil:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Di **SQL Editor**, jalankan script di `supabase/schema.sql` untuk membuat tabel `profiles`, `customers`, `projects` dan RLS.
4. Di **Authentication > Users** buat user (atau pakai Sign Up). Untuk set role `admin`, setelah user dibuat bisa update manual di tabel `profiles` (role = 'admin').

### 3. Environment

```bash
cp .env.local.example .env.local
```

Isi `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Halaman utama akan redirect ke `/login` atau `/dashboard` jika sudah login.

## Struktur Project

```
sales-tracker/
├── src/
│   ├── app/
│   │   ├── (dashboard)/     # Layout + auth check
│   │   │   ├── dashboard/   # List project + filter
│   │   │   ├── projects/
│   │   │   │   ├── new/     # Form project baru
│   │   │   │   └── [id]/edit/
│   │   │   └── customers/   # CRUD customers
│   │   ├── login/
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Redirect ke login/dashboard
│   │   └── globals.css
│   ├── components/
│   │   ├── DashboardNav.tsx
│   │   ├── ProjectsTable.tsx
│   │   ├── ProgressTypeFilter.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── CustomersTable.tsx
│   │   └── CustomerForm.tsx
│   ├── lib/
│   │   └── supabase/       # client, server, middleware
│   ├── types/
│   │   └── database.ts
│   └── middleware.ts
├── supabase/
│   └── schema.sql          # Tabel + RLS
├── .env.local.example
└── package.json
```

## Database (Supabase)

- **profiles**: `id` (uuid, FK auth.users), `email`, `full_name`, `role` ('admin' | 'sales')
- **customers**: `id`, `name`
- **projects**: `id`, `created_at`, `no_quote`, `project_name`, `customer_id`, `value`, `status`, `progress_type` ('Budgetary' | 'Tender'), `weekly_update`, `created_by`

RLS: lihat `supabase/schema.sql` untuk policy detail.
