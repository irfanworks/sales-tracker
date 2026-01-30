# Sales Tracker

Web app sederhana untuk melacak sales project dengan Next.js 14 (App Router), Tailwind CSS, Lucide React, dan Supabase.

## Fitur

- **Auth**: Login dengan Supabase Auth
- **Roles**: `admin` dan `sales` (disimpan di tabel `profiles`)
- **Customers**: Master data customer + **Sector** (Data Center, Oil and Gas, Commercial, Industrial, Mining) + **PIC** (optional, multi: Nama, Email, No. HP, Jabatan); hanya sales/admin yang bisa add/edit/delete
- **Projects**: Input project dengan Customer, No Quote, Project Name, Value, Progress Type (Budgetary / Tender / Win / Lose), Prospect (Hot Prospect / Normal), dan Project Update
- **Project updates**: Riwayat update project tersimpan dan bisa dipantau
- **Dashboard**: Metrik CRM (Total Value, Total Projects, Hot Lead → Win %, Win/Lose) berdasarkan filter + tabel project dengan filter Progress Type, Prospect, dan Sales
- **Settings**: Ganti password + **Display Name** (nama yang tampil di Dashboard/Filter/header)
- **RLS**: Row Level Security aktif; Sales lihat/input data sendiri, Admin bisa edit semua

## Setup

### 1. Dependencies

```bash
cd sales-tracker
npm install
```

### 2. Environment

Salin template env dan isi credential Supabase:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: URL project dari Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key dari halaman yang sama

### 3. Database di Supabase

Jalankan migration SQL di Supabase:

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → pilih project
2. **SQL Editor** → New query
3. Jalankan migration SQL **berurutan** di SQL Editor:
   - `001_initial_schema.sql`
   - `002_fix_profiles_rls_recursion.sql` (perbaikan rekursi RLS)
   - `003_customers_pics_sector_profiles_display.sql` (sector, PIC, display_name)

Setelah itu tabel `profiles`, `customers`, `customer_pics`, `projects`, `project_updates` dan RLS terbentuk. User baru yang sign up lewat Auth akan dapat baris di `profiles` dengan role default `sales`. Untuk menjadikan user sebagai admin, update manual di tabel `profiles`: set `role = 'admin'`.

### 4. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Sign in dengan user yang sudah didaftarkan di Supabase Auth (Authentication → Users).

## Struktur project

```
sales-tracker/
├── app/
│   ├── dashboard/          # Layout + halaman setelah login
│   │   ├── customers/       # Master customer
│   │   ├── projects/        # List project, new, detail [id]
│   │   └── page.tsx         # Dashboard (list project + filter)
│   ├── login/               # Halaman login
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Home (redirect ke dashboard jika sudah login)
├── components/              # UI components
├── lib/
│   ├── supabase/            # Client, server, middleware
│   └── types/               # Database types
├── supabase/
│   └── migrations/          # SQL schema + RLS
├── .env.local.example       # Template env
├── package.json
├── tailwind.config.ts
└── README.md
```

## Tech stack

- Next.js 14 (App Router)
- Tailwind CSS
- Lucide React
- Supabase (Auth + Database + RLS)
# sales-tracker-v2
