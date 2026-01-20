# Notes/Snippets API

A REST API for storing code snippets and notes with tags, search functionality, and API key-based authentication. Built with Node.js, Express, and MongoDB.

## Features

- 📝 **Note Management**: Create, read, update, delete notes
- 🏷️ **Tagging**: Organize notes with tags
- 🔍 **Search**: Full-text search across notes
- 🔐 **API Key Auth**: Simple API key-based authentication
- ⏱️ **Rate Limiting**: Protection against abuse
- 📊 **Statistics**: User analytics and tag statistics
- 📖 **Swagger Docs**: Interactive API documentation

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone and install
cd notes-api
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

### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get user statistics |
| GET | `/api/stats/tags` | Get most used tags |

### Query Parameters for GET /api/notes
```
?tags=react,nodejs      # Filter by tags
?language=javascript    # Filter by language
?isSnippet=true         # Filter code snippets
?favorited=true         # Only favorited
?sort=createdAt         # Sort by field
?order=desc             # asc or desc
?page=1                 # Page number
?limit=10               # Items per page
```

## Usage Examples

### Register & Get API Key
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "john", "email": "john@example.com"}'
```

### Create a Note
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "React useState Hook",
    "content": "const [count, setCount] = useState(0);",
    "language": "javascript",
    "tags": ["react", "hooks"]
  }'
```

### Get All Notes
```bash
curl http://localhost:5000/api/notes \
  -H "x-api-key: YOUR_API_KEY"
```

## Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## API Documentation

Visit `/api/docs` for interactive Swagger documentation when the server is running.

## Project Structure

```
notes-api/
├── src/
│   ├── config/         # Database & app config
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, validation, errors
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── utils/          # Helpers & utilities
│   ├── tests/          # Jest tests
│   ├── app.js          # Express app setup
│   └── server.js       # Entry point
├── .env.example        # Environment template
├── docker-compose.yml  # Docker setup
├── Dockerfile          # Container config
└── package.json        # Dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | - |
| `API_KEY_PREFIX` | Prefix for API keys | `napi_` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `CORS_ORIGIN` | Allowed origins | `*` |

## License

MIT
