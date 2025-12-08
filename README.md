This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the typesense locally:
In this repository you'll find a docker container and a script `run-typesense-server.sh` that runs the container and load the news dataset taken from Huggingface: https://github.com/destaquesgovbr/destaquesgovbr-typesense


Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production Deployment

This project is deployed to Google Cloud Run using GitHub Actions.

### Deployment Architecture

```
┌─────────────────────┐
│  GCP Secret Manager │
│  typesense-search-  │
│    only-api-key     │
└──────────┬──────────┘
           │
    ┌──────┴───────┐
    ▼              ▼
┌─────────┐   ┌─────────┐
│ GitHub  │   │Typesense│
│ Actions │   │   VM    │
│Workflow │   │         │
└────┬────┘   └─────────┘
     │
     ▼
┌──────────────┐
│  Cloud Run   │
│    Portal    │
└──────────────┘
```

### Secrets Management

The production deployment fetches the Typesense API key **directly from GCP Secret Manager** during the Docker build process.

**GitHub Secrets Required:**
- `GCP_WORKLOAD_IDENTITY_PROVIDER` - Workload Identity Federation provider
- `GCP_SERVICE_ACCOUNT` - GitHub Actions service account email
- `NEXT_PUBLIC_TYPESENSE_HOST` - Typesense server IP address

**GCP Secret Manager:**
- `typesense-search-only-api-key` - Search API key (read-only)

**Why this architecture?**
- **Single source of truth**: API key is only maintained in GCP Secret Manager
- **Automatic sync**: Portal always uses the same key as the Typesense VM
- **Easy rotation**: Update key in GCP → rebuild portal → done
- **Audit trail**: All secret access is logged in GCP

### Deployment Workflow

When code is pushed to `main`:

1. GitHub Actions authenticates to GCP via Workload Identity Federation
2. Fetches `typesense-search-only-api-key` from Secret Manager
3. Builds Docker image with API key as build argument
4. Pushes image to Artifact Registry
5. Deploys to Cloud Run

See [.github/workflows/deploy-production.yml](.github/workflows/deploy-production.yml) for details.

### Infrastructure

The infrastructure (Typesense VM, secrets, IAM bindings) is managed via Terraform in the [destaquesgovbr-infra](https://github.com/destaquesgovbr/destaquesgovbr-infra) repository.
