# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Vercel booking configuration

The booking form saves through a server function. Environment variables configured
in Lovable are not copied to Vercel. In Vercel → Project → Settings → Environment
Variables, configure these for **Production** (and Preview when testing previews):

- `SUPABASE_URL`: the connected Supabase project's URL.
- `SUPABASE_SERVICE_ROLE_KEY`: a modern `sb_secret_...` secret key from that same
  project's Supabase dashboard → Project Settings → API Keys. The variable name
  is retained for compatibility; it does not require a legacy key. Mark it sensitive.
- `SUPABASE_PUBLISHABLE_KEY`: that project's publishable key.
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`: browser-safe project
  settings, if the deployment uses environment-based browser configuration.

Never prefix the service-role key with `VITE_`, commit it, or send it in chat.
After saving environment variables, **redeploy** the production deployment;
existing deployments do not acquire newly configured variables.

Verify by submitting a clearly labelled test booking on the production URL:
the form must show a booking reference, and Supabase's `bookings` table must
contain that reference with a `customer_id` pointing to the new `customers` row.
The customer date and time must match the form selections. A failure must keep
the form editable and must not show a success message.

No additional environment variables are required for customer reuse or pickup
availability. Returning customers can submit new bookings: matching normalized
email **and** phone reuses the customer without changing their stored details.
Each booking saves its own pickup address.

Deploy the latest application code along with the applied pickup-rules migration.
An older unrestricted time field can send a time the database now rejects.
The public failure response intentionally hides infrastructure and customer data;
use Vercel runtime logs at the failed request's timestamp to identify its cause.
