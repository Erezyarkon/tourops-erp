
# TourOps ERP – Full Pack (Supabase + React / Lovable)

**What's inside**
- SQL schema with sample data
- Supabase Edge Functions for all modules
- React pages & services
- PDF generation (EN/HE)
- Matrix pricing with hotel free pax (1 per 20)
- Create booking from quote
- Tours private/daily, finance basics
- i18n JSON (EN/HE)

## 1) Supabase: run SQL
Run `supabase/sql/schema_full.sql` in your project's SQL editor.

## 2) Deploy functions
```
supabase functions deploy clients
supabase functions deploy suppliers
supabase functions deploy rate-cards
supabase functions deploy quotes
supabase functions deploy orders
supabase functions deploy booking-from-quote
supabase functions deploy tours-private
supabase functions deploy tours-daily
supabase functions deploy finance
supabase functions deploy passengers-import
```
Add secrets in Functions:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional `CORS_ORIGIN`

## 3) Frontend
Install:
```
pnpm add @react-pdf/renderer
```
ENV:
```
VITE_SUPABASE_FUNCTIONS_URL=https://<project-ref>.functions.supabase.co
```
Add routes to your router:
- `/customers` → CustomersPage
- `/suppliers` → SuppliersPage
- `/client-card` → ClientCard
- `/quotes` → QuotesPage
- `/quotes/:id` → QuoteBuilderPage
- `/bookings` → BookingsPage
- `/tours` → ToursHub
- `/finance` → FinancePage

## Notes
- Policies/RBAC: included basic example on `profiles` (extend as needed). Edge functions use service role key; restrict CORS origins in prod.
- Free pax: hotels get 1 free per 20 paying on per-person components. Matrix sizes: 15/20/30/40/50.
- PDF: uses @react-pdf/renderer, bilingual.
