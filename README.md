# Arzaq

Arzaq is an Arabic RTL local marketplace platform for Gaza. It connects clients who need work or services with providers who can submit offers, build trusted public profiles, and communicate externally through WhatsApp with privacy-aware rules.

> Current status: advanced development version being prepared for beta launch.

## Product Overview

Arzaq is designed as a lightweight, mobile-first local services marketplace for:

- Clients: individuals, small shops, NGOs, and teams that need a worker or service.
- Service providers: designers, developers, teachers, data entry workers, technicians, and field workers.
- Youth and graduates: people who want to build a portfolio, gain trust, and find real opportunities.

## Core Features

- Two account types: client and service provider.
- Login with email or phone number.
- Email verification through official verification codes.
- Job/service requests reviewed by admins before public publishing.
- Clear job states: pending review, needs edit, open, and closed.
- Offers can only be submitted by service providers.
- A client can accept one offer, which closes the request workflow.
- Client privacy protection: the client's WhatsApp number is only visible to the accepted provider.
- Providers can enable or disable their public WhatsApp contact button.
- Public provider profiles with skills, reviews, portfolio links, ratings, and verification progress.
- Interactive star rating after completed work.
- Internal notification system, with gradual real-time improvements.
- Admin dashboard for jobs, users, verification requests, reports, and audit logs.
- Secure image uploads to Cloudflare R2 with file type and size restrictions.
- Arabic RTL-first interface, mobile-first design, and low-bandwidth-friendly UX.

## Tech Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | Next.js 16 App Router                                            |
| Language       | TypeScript strict mode                                           |
| UI             | Tailwind CSS v3 + shadcn/ui                                      |
| Direction      | Arabic RTL-first                                                 |
| Forms          | React Hook Form + Zod                                            |
| Auth           | NextAuth.js v5 Credentials + JWT                                 |
| ORM            | Prisma                                                           |
| Database       | Neon PostgreSQL                                                  |
| Storage        | Cloudflare R2                                                    |
| Email          | Gmail SMTP for development + Resend-ready for production domains |
| Rate limiting  | Upstash Redis                                                    |
| Icons          | Lucide React                                                     |
| Toasts         | Sonner                                                           |
| Image handling | browser-image-compression + server-side upload validation        |

## Architecture

```text
src/
  app/                 App Router pages, route handlers, layouts
  actions/             Server Actions for mutations and sensitive flows
  services/            Business logic and Prisma access layer
  components/          Domain-oriented UI components
  lib/                 Auth, Prisma, security, email, SEO, uploads
  schemas/             Zod validation schemas
  constants/           Shared labels, navigation, and configuration
  hooks/               Client-side React hooks
  types/               Shared TypeScript types
  mock/                Legacy/fallback UI data
  providers/           React context providers
  styles/              Global CSS and font setup
```

Key architectural rules:

- Prisma calls are kept inside `services/` or server-only route code.
- Sensitive mutations go through Server Actions.
- User input follows this flow: Zod validation, sanitization, then database write.
- Client Components are used only for interaction, hooks, or browser APIs.
- Sensitive fields such as `passwordHash` and private contact details are never exposed to the public UI.

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file:

```bash
cp .env.example .env
```

Then fill in the required values. The most important variables are:

```env
DATABASE_URL=""
DATABASE_URL_UNPOOLED=""
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_R2_ACCESS_KEY_ID=""
CLOUDFLARE_R2_SECRET_ACCESS_KEY=""
CLOUDFLARE_R2_BUCKET_NAME=""
CLOUDFLARE_R2_PUBLIC_URL=""
NEXT_PUBLIC_R2_PUBLIC_URL=""

EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER=""
SMTP_PASSWORD=""
EMAIL_FROM="Arzaq <your-email@gmail.com>"
```

Do not use a normal Gmail password. Use a Gmail App Password for SMTP during development.

### 3. Prepare the database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Useful Commands

```bash
npm run dev                 # Start Next.js with Turbopack
npm run build               # Production build
npm run lint                # Run ESLint
npm run format              # Format files with Prettier
npm run db:studio           # Open Prisma Studio
npm run db:migrate          # Run development migrations
npm run db:deploy           # Apply migrations in production
npm run test:e2e:smoke      # Run the main smoke E2E scenario
npm run security:audit      # Run npm audit at moderate level
```

## Verification Before Deployment

Run the following before any deployment:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e:smoke
npm run security:audit
```

There is a currently reviewed `npm audit` warning related to a transitive dependency inside `next-auth@5 beta` and `nodemailer`. Arzaq does not pass user-controlled values into the affected SMTP options, and `npm audit fix --force` is intentionally avoided because it downgrades/breaks the current NextAuth v5 App Router setup.

## Security

The system includes several security layers:

- Security headers in `next.config.ts`.
- CSRF protection for sensitive API routes.
- Rate limiting through Upstash Redis.
- Password hashing with bcryptjs.
- Zod validation for important forms and Server Actions.
- Input sanitization for text, links, and phone numbers.
- Server-side authorization checks, not UI-only checks.
- Account-type restrictions for job posting and offer submission.
- Privacy-aware contact visibility rules.
- Audit logging for sensitive actions.
- Secure upload constraints for file type, size, and generated storage keys.

See [SECURITY.md](./SECURITY.md) for more details.

## SEO

Arzaq includes a structured SEO setup:

- Central SEO helpers in `src/lib/seo.ts`.
- Public metadata for core pages.
- Dynamic metadata for job details and provider profiles.
- `robots.txt` through `src/app/robots.ts`.
- `sitemap.xml` through `src/app/sitemap.ts`.
- JSON-LD for the website, job details, and provider profiles.
- `noindex` for auth, dashboard, admin, and private application areas.

## Recommended Launch Stack

- App hosting: Vercel
- Database: Neon PostgreSQL
- Storage: Cloudflare R2
- Redis/rate limiting: Upstash
- Email: Gmail SMTP for development, Resend or domain-based SMTP for production
- DNS/CDN/security edge: Cloudflare

Review [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) before launching.

## Near-Term Roadmap

- Improve real-time notifications.
- Improve infinite scroll and optimistic UI in marketplace lists.
- Turn hero metrics into live statistics or explicitly stated launch goals.
- Improve admin analytics and moderation workflows.
- Connect a production email domain and enable Resend for production.
- Add a final manual QA pass before public launch.

## License

This project is currently private. All rights reserved by the Arzaq team.
