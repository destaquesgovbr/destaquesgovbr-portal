This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the typesense locally:
In this repository you'll find a docker container and a script `run-typesense-server.sh` that runs the container and load the news dataset taken from Huggingface: https://github.com/destaquesgovbr/destaquesgovbr-typesense

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

This project uses **Vitest** for unit/integration tests and **Playwright** for E2E tests.

### Running Tests

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:unit

# Run tests with coverage report
npm run test:coverage

# Open Vitest UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Open Playwright UI
npm run test:e2e:ui
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
