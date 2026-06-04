# BCH Youth Bible Reading — Web App

Mobile-first Bible reading tracker for BCH youth members.

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key.
3. Run the database migration in the Supabase SQL editor:  
   Copy and paste the contents of `supabase/migrations/001_initial.sql`.
4. Create two Storage buckets in Supabase:
   - `avatars` (public)
   - `posters` (public)
5. Install dependencies and start:

```
npm install
npm run dev
```

## Provisioning the first admin

After creating your account via the registration page, open the Supabase Dashboard → Table Editor → `profiles`, find your row, and change `role` from `youth` to `admin`. 

You will then be redirected to the admin panel (`/admin`) on next login.

## Development

- `npm run dev` — start dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — run ESLint
