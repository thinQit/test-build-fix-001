# test-build-fix-001

## Features
- Modern SaaS marketing site (hero, pricing, testimonials, contact)
- Admin dashboard CRUD for pricing, testimonials, and leads
- JWT-based admin authentication
- REST API with health check endpoint
- Responsive and accessible UI

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Prisma ORM (SQLite for development)
- Tailwind CSS
- Jest + Testing Library
- Playwright E2E

## Prerequisites
- Node.js 18+
- npm

## Quick Start
```bash
./install.sh
npm run dev
```

Windows PowerShell:
```powershell
./install.ps1
npm run dev
```

## Environment Variables
See `.env.example` for all required values.

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL`

## Project Structure
- `src/app/` - App Router pages and layouts
- `src/app/api/` - API route handlers
- `src/components/` - UI components
- `src/providers/` - React context providers
- `src/lib/` - Utilities and shared logic
- `prisma/` - Prisma schema

## API Endpoints
- `GET /api/health`
- `POST /api/leads`
- `GET /api/leads` (admin)
- `GET /api/leads/:id` (admin)
- `GET /api/testimonials`
- `POST /api/testimonials` (admin)
- `PUT /api/testimonials/:id` (admin)
- `DELETE /api/testimonials/:id` (admin)
- `GET /api/pricing`
- `POST /api/pricing` (admin)
- `PUT /api/pricing/:id` (admin)
- `DELETE /api/pricing/:id` (admin)
- `POST /api/admin/login`
- `GET /api/site-content`
- `PUT /api/site-content` (admin)

## Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run lint` - Lint the project
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run Playwright tests

## Testing
```bash
npm run test
npm run test:e2e
```
