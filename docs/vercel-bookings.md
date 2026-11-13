# Vercel booking setup

The production error `Missing Supabase environment variable(s): SUPABASE_SERVICE_ROLE_KEY` means Vercel lacks the private server credential. Lovable secrets do not transfer to Vercel.

In Vercel > Project > Settings > Environment Variables, configure for Production:

- SUPABASE_URL: the connected Supabase project URL.
- SUPABASE_SERVICE_ROLE_KEY: the service-role key from the same project's Supabase Project Settings > API Keys. Mark sensitive.
- SUPABASE_PUBLISHABLE_KEY: that project's publishable key.

Never prefix the service-role key with VITE_, commit it, or send it in chat. Redeploy after saving variables; existing deployments do not acquire new configuration.

Submit a labelled test booking on production and check the displayed booking reference exists in public.bookings with a customer_id pointing to public.customers and matching date/time. Failures must preserve the form and never report success.
