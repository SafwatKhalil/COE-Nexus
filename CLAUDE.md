# COE-Nexus — Claude Code Guide

Enterprise platform for hyperscale datacenter land readiness, utility tracking,
permitting, scheduling, and capacity forecasting.

## Stack
- **Web**: Next.js 15 App Router, React 19, TypeScript, Tailwind 3, shadcn/ui, TanStack Query, Zustand
- **API**: NestJS 10, Prisma 6 + Postgres, Passport/JWT, BullMQ + Redis
- **Shared**: packages/shared — TypeScript types used on both sides

## Local dev
```bash
docker compose up -d          # Postgres + Redis
npm install                   # root — installs all workspaces
cd apps/api && npx prisma migrate dev && npx ts-node prisma/seed.ts
cd ../.. && npm run dev       # API :3001  Web :3000
```

## Workflow rules
- Feature branch: `git checkout -b <branch>`
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`
- After every change: `npm run typecheck && npm run lint`
- Never force-push main. Never commit .env files. Never delete migrations.
- New API response shapes → define in packages/shared/src/types/ first

## Architecture
- All tenant-scoped queries must filter by `tenantId` from the JWT payload
- `TenantId` and `CurrentUser` decorators are in `src/common/decorators/tenant.decorator.ts`
- New hooks go in `apps/web/src/hooks/` following the `use-sites.ts` pattern
- New API list endpoints need: pagination, filter DTO, tenant scoping

## Design rules
- No emojis in product UI — use lucide icons
- No hardcoded color values — CSS variables only
- Status = dot + label (not filled pills)
- Stage badges: stage-early (gray) | stage-active (amber) | stage-live (blue/green)
- Icons: 14px dense UI, 16px toolbars, 20px empty states
- Cards: 1px border, no default shadow
- Sidebar uses CSS vars — works in both light and dark mode
