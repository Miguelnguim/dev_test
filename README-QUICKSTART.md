See README.md for full documentation.

Quick start after unzipping:
  corepack enable
  pnpm install
  cp .env.example apps/api/.env        # then fill in MongoDB/R2 credentials
  cp .env.example apps/web/.env.local  # then keep only the NEXT_PUBLIC_* vars
  pnpm dev:api
  pnpm dev:web
