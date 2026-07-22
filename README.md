# Ganga Guardian AI

Ganga Guardian AI is a React/Vite river-intelligence frontend backed by an Express/MongoDB API and a separate Flask model service.

## Local setup

Requirements: Node.js 20+, MongoDB, Python 3.11+ for the ML service, and Cloudinary only when photo uploads are required.

```powershell
copy backend\.env.example backend\.env
# Set MONGO_URI, JWT_SECRET, FRONTEND_URL, and ML_SERVICE_URL in backend\.env
npm install
Push-Location backend; npm install; Pop-Location
Push-Location backend; npm run migrate; Pop-Location
npm run dev
```

Run the API with `Push-Location backend; npm start; Pop-Location`. Run the model service with `Push-Location ml-service; pip install -r requirements.txt; gunicorn --bind 0.0.0.0:5001 app:app; Pop-Location`.

Create the first administrator only with environment variables:

```powershell
$env:ADMIN_NAME='Your Name'; $env:ADMIN_EMAIL='you@example.com'; $env:ADMIN_PASSWORD='use-a-long-password'
Push-Location backend; npm run provision-admin; Pop-Location
```

Public registration creates citizens. Administrators create invitations for privileged accounts through `POST /api/auth/invites`.

## Data policy

The application does not generate sensor observations. Configure `CPCB_DATA_URL` or `INDIA_WRIS_DATA_URL` with a supported JSON/CSV provider format, then trigger `POST /api/data-sync/cpcb` or `POST /api/data-sync/indiawris`. Every imported reading stores its provider, source URL, and observation timestamp. Empty or unavailable providers produce an explicit no-data state.

The bundled model artifacts are disabled by default because model provenance must be verified. Set `MODEL_ARTIFACT_TRUSTED=true` only after replacing them with artifacts trained on approved data.

## Free deployment

1. Create MongoDB Atlas and Cloudinary accounts.
2. Deploy `ml-service` to Render with `pip install -r requirements.txt` and `gunicorn --bind 0.0.0.0:$PORT app:app`.
3. Deploy `backend` to Render with `npm ci` and `npm start`.
4. Set Render variables: `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `ML_SERVICE_URL`, and the Cloudinary variables.
5. Run `npm run migrate` and `npm run provision-admin` from a secure shell using the production variables.
6. Import the repository into Vercel and set `VITE_API_URL` to the Render API URL.
7. Add `DATA_SYNC_URL` and `DATA_SYNC_TOKEN` GitHub secrets for the scheduled sync workflow.

Free Render services sleep when idle and have ephemeral filesystems. Persistent application data therefore belongs in MongoDB/Cloudinary, not the service disk.

## Verification

```powershell
npm.cmd run build
npm.cmd run lint
Get-ChildItem backend -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

API documentation is in `docs/openapi.yaml`.
