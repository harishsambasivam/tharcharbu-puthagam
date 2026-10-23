# Tharcharbu Puthagam

A field guide to plants, trees, insects, birds and animals, with Tamil, Kannada and Malayalam names.

```
backend/          Express API, runs on Lambda (local: npm run dev)
  src/core/       db, s3, auth, shared schema, CRUD + links
  src/plants/     plant.model.js · plant.manager.js · plant.controller.js
  src/trees/      …same three files per category, each with its own validation
  src/insects/
  src/birds/
  src/animals/
  src/auth/       POST /api/auth/login
  src/catalog/    GET  /api/catalog     (every item, light fields only: fills in links and the link picker)
  src/uploads/    POST /api/uploads      (presigned S3 upload)
  scripts/        seed.js (loads seed/flora-fauna.xlsx), hash-password.js
  seed/           flora-fauna.xlsx: every item and link, one sheet per category
frontend/         React + Tailwind (Vite)
  src/config/     kinds.js drives every page; seasons.js holds the Tamil seasons and lands
  src/pages/list/     ListDesktop · ListMobile · ItemDrawer
  src/pages/detail/   DetailDesktop · DetailMobile
  src/pages/editor/   EditorPage (desktop)
  src/pages/admin/    hidden /admin sign-in
infra/            CDK: DynamoDB, S3, Lambda, CloudFront
```

## Data

One DynamoDB table, `pk` = category (`plant`, `tree`, `insect`, `bird`, `animal`), `sk` = item id.
Each item keeps `data` (the working copy editors save as they type) and `live` (what readers see,
copied over on Publish). Links are written on both items so they show on both pages.

## Run locally

```bash
cd backend
cp .env.example .env          # add AWS keys, table and bucket names
npm run hash-password -- "your password"   # paste the output into .env
openssl rand -hex 32          # paste as JWT_SECRET
npm run seed                  # loads seed/flora-fauna.xlsx; skips existing items (--overwrite, --dry-run)
npm run dev                   # http://localhost:4000

cd ../frontend
npm run dev                   # http://localhost:5173, /api is proxied to :4000
```

Sign in at `/admin` to see drafts, edit and create.

## Deploy

```bash
cd infra
npx cdk bootstrap             # first time only
npm run deploy                # builds the frontend, then deploys everything
```

The output `Url` is the site. Set `TABLE_NAME` and `BUCKET_NAME` in `backend/.env` to the deployed
`TableName` / `MediaBucket` outputs to work locally against them, and `VITE_MEDIA_URL` in
`frontend/.env` to the `Url` so local dev can show uploaded photos.
