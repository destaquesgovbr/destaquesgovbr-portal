# Portal DestaquesGovBr

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Run Typesense locally

First, start the Typesense server. In this repository you'll find a docker container and a script `run-typesense-server.sh` that runs the container and loads the news dataset from Huggingface: https://github.com/destaquesgovbr/typesense

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Update your `.env.local` file with the local development API key:

```env
NEXT_PUBLIC_TYPESENSE_HOST=localhost
NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY=govbrnews_api_key_change_in_production
```

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Running Tests

```bash
# Run unit tests in watch mode
pnpm test

# Run unit tests once
pnpm test:unit

# Run tests with coverage report
pnpm test:coverage

# Open Vitest UI
pnpm test:ui

# Run E2E tests
pnpm test:e2e

# Open Playwright UI
pnpm test:e2e:ui
```

### Test Structure

```
src/
├── __tests__/               # Test utilities and mocks
│   ├── setup.ts             # Global test setup
│   ├── test-utils.tsx       # Custom render with providers
│   └── mocks/
│       └── fixtures/        # Test data fixtures
├── lib/__tests__/           # Unit tests for lib/
│   ├── result.test.ts       # Result type tests
│   └── utils.test.ts        # Utility function tests
└── config/__tests__/        # Unit tests for config/
    └── prioritization.test.ts

e2e/                         # Playwright E2E tests
```

### Writing Tests

**Unit tests** use Vitest with React Testing Library:

```typescript
import { describe, expect, it } from 'vitest'
import { render, screen } from '@/__tests__/test-utils'
import MyComponent from './MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

**E2E tests** use Playwright against the production site:

```typescript
import { test, expect } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toBeVisible()
})
```

### CI Integration

Tests run automatically on every PR via GitHub Actions (`.github/workflows/test.yml`).

## Troubleshooting

### Typesense 401 Unauthorized Error

If you see errors like:

```
RequestUnauthorized: Request failed with HTTP code 401 | Server said: Forbidden - a valid `x-typesense-api-key` header must be sent.
```

**Solution:**

1. Check if the Typesense container is running:
   ```bash
   docker ps | grep typesense
   ```

2. Get the actual API key from container logs:
   ```bash
   docker logs govbrnews-typesense | grep "API Key:"
   ```

3. Update your `.env.local` file with the correct API key

4. Restart the development server:
   ```bash
   pnpm dev
   ```

### Typesense Connection Issues

**Check if Typesense is running:**
```bash
curl http://localhost:8108/health
```

Expected response: `{"ok":true}`

**Verify API key works:**
```bash
curl -H "X-TYPESENSE-API-KEY: your-api-key" http://localhost:8108/collections
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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

The infrastructure (Typesense VM, secrets, IAM bindings) is managed via Terraform in the [infra](https://github.com/destaquesgovbr/infra) repository.
