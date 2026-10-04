# CNH plant desk

Rugged-tablet desk for **Fargo combine final assembly** and **Racine construction dealer-prep**. Operators log a fault (asset, symptom, optional photo). Technicians get ranked failure modes with confidence, TSB-style steps, and BOM SKUs, then open a work order. Supervisors run a live shift board and a trusted changeover handoff.

This is not a CMMS. There is no login, no Postgres, and no live IoT. The catalog ranker always boots without API keys. If `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set, only ranking *copy* may be rewritten; procedures and SKUs never leave `src/lib/knowledge.ts`.

## Local run

```bash
npm install
npm run dev
```

Dev server binds **0.0.0.0:43147**. Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

Production (after a build; this is `npm start`, port **8080**):

```bash
npm run build
npm start
```

| Route | Who |
| --- | --- |
| `/` | Shift board |
| `/faults` | Operator fault log + diagnosis sheet |
| `/work-orders` | Technician jobs |
| `/library` | Mock manuals / TSB / BOM |
| `/handoff` | Supervisor changeover |

Health probe (does not touch the JSON store, models, or a database): `GET /api/health`.

Restore the Saturday overtime demo: **Restore demo seed** on the shift board (`POST /api/dashboard`).

Runtime data: `.data/plant-store.json`. Photos: `public/uploads/`.

## App Runner (GitHub source)

App Runner reads `apprunner.yaml` from this repo:

- Build: `npm ci --include=dev` then `npm run build`
- Start: `npm start` (standalone server, port **8080**)
- Health: `GET /api/health`
- Instance (free-tier pairing): **0.25 vCPU / 1 GB**, no GPU
- Auto-deploy: on when the service is connected to GitHub `main`

Create the GitHub repo, then the App Runner GitHub connection in the AWS console (OAuth). Fill `OWNER`, `REGION`, `ACCOUNT`, and `CONNECTION_ID` in `deploy/apprunner-create-service.json` and run:

```bash
aws apprunner create-service --cli-input-json file://deploy/apprunner-create-service.json
```

A `Dockerfile` remains for ECR if you later want an image-based service instead.

**Ephemeral store:** App Runner disk is not durable. The JSON plant store and uploads reset when the instance is replaced. A real plant would put the desk on RDS (or similar) and photos on S3. Optional live-model keys belong in App Runner environment variables, not in the image.

The process listens on `8080` (`PORT`).
