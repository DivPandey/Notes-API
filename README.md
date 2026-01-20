# Notes/Snippets API

A REST API for storing code snippets and notes with tags, search functionality, and API key-based authentication. Built with Node.js, Express, and MongoDB.

## Features

- **Note Management**: Create, read, update, delete notes
- **Tagging**: Organize notes with tags
- **Search**: Full-text search across notes
- **API Key Auth**: Simple API key-based authentication
- **Rate Limiting**: Protection against abuse
- **Statistics**: User analytics and tag statistics
- **Swagger Docs**: Interactive API documentation
- **CI/CD Pipeline**: Automated testing and deployment

---

## CI/CD Pipeline

This project includes a complete CI/CD pipeline using GitHub Actions.

### Pipeline Overview

```
git push --> CI Pipeline --> DockerHub --> CD Pipeline --> Kubernetes (AWS EC2)
```

### CI Pipeline Stages

| Stage | Tool | Purpose |
|-------|------|---------|
| Linting | ESLint | Enforce code standards |
| SAST | CodeQL | Static security analysis |
| SCA | npm audit + Dependency-Check | Find vulnerable dependencies |
| Unit Tests | Jest | Validate business logic |
| Build | Docker | Create container image |
| Image Scan | Trivy | Scan for vulnerabilities |
| Runtime Test | curl | Container smoke test |
| Registry Push | DockerHub | Publish image |

### CD Pipeline Stages

| Stage | Purpose |
|-------|---------|
| Deploy to K8s | SSH to EC2, restart pods |
| Health Check | Verify deployment |
| DAST | Security headers check |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Docker (optional)

### Local Development

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start development server
npm run dev
```

### Using Docker

```bash
# Start with Docker Compose (includes MongoDB)
docker-compose up -d

# View logs
docker-compose logs -f app
```

---

## GitHub Secrets Configuration

To enable CI/CD, add these secrets in GitHub (Settings > Secrets > Actions):

### For CI Pipeline (DockerHub Push)

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username |
| `DOCKERHUB_PASSWORD` | Your DockerHub password |

### For CD Pipeline (EC2 Deployment)

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 instance public IP |
| `EC2_USER` | SSH user (usually `ubuntu`) |
| `EC2_SSH_KEY` | Contents of your .pem file |

---

## Infrastructure Setup (Terraform)

### Prerequisites

- AWS CLI configured
- Terraform installed
- AWS key pair created

### Deploy to AWS

```bash
cd terraform

# Initialize Terraform
terraform init

# Deploy (creates EC2 with K3s + MongoDB + Notes API)
terraform apply -var="key_name=your-key-pair-name"

# Get app URL
terraform output app_url
```

### Cleanup

```bash
terraform destroy -var="key_name=your-key-pair-name"
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user & get API key |
| POST | `/api/auth/regenerate` | Regenerate API key |
| GET | `/api/auth/me` | Get current user info |

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes` | Get all notes (with filters) |
| GET | `/api/notes/:id` | Get single note |
| POST | `/api/notes` | Create new note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |
| PATCH | `/api/notes/:id/favorite` | Toggle favorite |
| GET | `/api/notes/search?q=query` | Search notes |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/message` | Deployment test message |
| GET | `/api/stats` | User statistics |
| GET | `/api/docs` | Swagger documentation |

---

## Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

---

## Project Structure

```
notes-api/
├── .github/workflows/
│   ├── ci.yml              # CI pipeline
│   └── cd.yml              # CD pipeline
├── terraform/              # Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── k8s/                    # Kubernetes manifests
├── src/
│   ├── config/             # Database & app config
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation, errors
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── tests/              # Jest tests
│   └── app.js              # Express app
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `API_KEY_PREFIX` | Prefix for API keys | `napi_` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed origins | `*` |

---
