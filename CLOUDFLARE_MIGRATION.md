# Cloudflare Migration Guide

Complete migration from Railway ($5/month) to Cloudflare Pages + Workers (~$0-2/month).

## Architecture

### Current (Railway)
- FastAPI (Python) backend
- Next.js frontend  
- SQLite database
- Cost: $5/month

### New (Cloudflare)
- Workers API (TypeScript + Hono)
- Pages frontend (Next.js static export)
- D1 database (SQLite-compatible)
- Cost: $0-2/month

## Migration Steps

### 1. Database Setup
```bash
# Create D1 database
cd packages/api-workers
npm run d1:create

# Apply schema
npm run d1:migrate

# Export existing data
node scripts/export-data.js

# Generate import SQL
node scripts/import-data.js

# Import data
wrangler d1 execute gbbo-db --file=./migrations/0002_import_data.sql
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

# Deploy to Pages
npx wrangler pages deploy out --project-name=gbbo-frontend
```

## API Compatibility

All endpoints preserved:
- `GET /recipe` - List recipes with filters
- `GET /recipe/count` - Recipe count
- `GET /recipe/{id}` - Recipe by ID
- `GET /baker` - List bakers
- `GET /diet` - List diets
- `GET /category` - List categories
- `GET /bake_type` - List bake types

## Cost Savings

| Service | Current | New | Savings |
|---------|---------|-----|---------|
| Platform | Railway $5 | Workers $0-2 | $3-5 |
| Database | Included | D1 Free | $0 |
| Frontend | Included | Pages Free | $0 |
| **Total** | **$5** | **$0-2** | **$3-5** |

## Environment Variables

### Workers API
- `ENVIRONMENT=production`
- D1 database binding

### Frontend
- `NEXT_PUBLIC_API_URL=https://gbbo-api.your-subdomain.workers.dev`

## Development

### Local Development
```bash
# 1. Set up local D1 database (run once)
cd packages/api-workers
npm run d1:local

# 2. Start both API and frontend
cd ../..
npm run dev
```

The API runs at http://localhost:8787 and the frontend at http://localhost:3000. The frontend is configured to use the local API by default. For production builds, set `NEXT_PUBLIC_API_URL` to your deployed Workers URL.

### Deployment
- Push to `feat/cloudflare-migration` branch
- GitHub Actions auto-deploys both API and frontend
- Manual deployment available via npm scripts

## Performance Benefits

- Global CDN deployment
- Edge computing
- Static generation
- Auto-scaling
- Better demo performance

## Rollback

If issues occur:
1. Update Railway environment variables
2. Deploy current Railway version
3. Debug Cloudflare separately
4. Migrate when ready
