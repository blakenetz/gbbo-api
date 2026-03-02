# Cloudflare Migration Guide

This document outlines the migration from Railway to Cloudflare Pages + Workers for cost optimization.

## Architecture Overview

### Current (Railway - $5/month)
- FastAPI (Python) backend
- Next.js frontend  
- SQLite database
- Single deployment unit

### New (Cloudflare - ~$0-2/month)
- Workers API (TypeScript + Hono)
- Pages frontend (Next.js static export)
- D1 database (SQLite-compatible)
- Separate deployments for better scaling

## Migration Steps

### 1. Database Setup
```bash
# Create D1 database
cd packages/api-workers
npm run d1:create

# Apply schema
npm run d1:migrate

# Import data (run from project root)
node packages/api-workers/scripts/import-data.js
wrangler d1 execute gbbo-db --file=./packages/api-workers/migrations/0002_import_data.sql
```

### 2. API Deployment
```bash
# Deploy Workers API
cd packages/api-workers
npm run deploy
```

### 3. Frontend Deployment
```bash
# Build for static export
cd packages/frontend
npm run build

# Deploy to Pages (via Cloudflare dashboard or CLI)
npx wrangler pages deploy out --project-name=gbbo-frontend
```

### 4. Environment Configuration

#### Workers API
Set in Cloudflare dashboard:
- `ENVIRONMENT=production`
- D1 database binding

#### Frontend
Set in Cloudflare Pages:
- `NEXT_PUBLIC_API_URL=https://gbbo-api.your-subdomain.workers.dev`

## Cost Comparison

| Service | Current | New | Monthly Savings |
|---------|---------|-----|-----------------|
| Platform | Railway $5 | Workers $0-2 | $3-5 |
| Database | Included | D1 Free | $0 |
| Frontend | Included | Pages Free | $0 |
| **Total** | **$5** | **$0-2** | **$3-5** |

## API Compatibility

All existing endpoints are preserved:
- `GET /recipe` - List recipes with filters
- `GET /recipe/count` - Recipe count
- `GET /recipe/{id}` - Recipe by ID
- `GET /baker` - List bakers
- `GET /diet` - List diets
- `GET /category` - List categories
- `GET /bake_type` - List bake types

## Performance Benefits

- **Global CDN**: Workers and Pages deployed globally
- **Edge Computing**: API runs closer to users
- **Static Generation**: Frontend served from CDN
- **Auto-scaling**: No cold start concerns for demo traffic

## Development Workflow

### Local Development
```bash
# API
cd packages/api-workers
npm run dev

# Frontend
cd packages/frontend
npm run dev
```

### Deployment
- Push to `main` or `cloudflare-migration` branch
- GitHub Actions automatically deploys both API and frontend
- Manual deployment available via npm scripts

## Rollback Plan

If issues arise:
1. Update Railway environment variables to point back
2. Deploy current Railway version
3. Investigate Cloudflare issues separately
4. Migrate when ready

## Monitoring

- Workers: Cloudflare Analytics dashboard
- Pages: Cloudflare Analytics dashboard  
- D1: Cloudflare D1 dashboard
- Errors: Cloudflare Logs

## Next Steps

1. [ ] Create Cloudflare account
2. [ ] Generate API token
3. [ ] Set up GitHub secrets
4. [ ] Run database migration
5. [ ] Deploy API
6. [ ] Deploy frontend
7. [ ] Update DNS if needed
8. [ ] Test end-to-end
9. [ ] Decommission Railway
