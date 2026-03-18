# Installation

Get Trackion up and running on your system.

## Prerequisites

- **Go 1.21+** (for building from source)
- **Node.js 18+** (for the dashboard)
- **PostgreSQL 13+** (for data storage)
- **Docker & Docker Compose** (recommended)

## Quick Install with Docker

The fastest way to get started:

```bash
git clone https://github.com/p8labs/trackion
cd trackion
docker-compose up -d
```

This will start:

- **Backend server** on `localhost:8080`
- **Dashboard** on `localhost:5173`
- **PostgreSQL database** on `localhost:5432`

## Manual Installation

### 1. Clone the Repository

```bash
git clone https://github.com/p8labs/trackion
cd trackion
```

### 2. Set Up the Database

Create a PostgreSQL database and user:

```sql
CREATE DATABASE trackion;
CREATE USER trackion WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE trackion TO trackion;
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgres://trackion:your-password@localhost:5432/trackion
JWT_SECRET=your-random-secret-key
PORT=8080
```

### 4. Run Database Migrations

```bash
go run cmd/migrate/main.go up
```

### 5. Start the Backend

```bash
go mod download
go run cmd/server/main.go
```

### 6. Start the Dashboard

In a new terminal:

```bash
cd dashboard
npm install
npm run dev
```

## Production Installation

### Using Docker Compose

For production, create a `docker-compose.prod.yml`:

```yaml
version: "3.8"
services:
  trackion:
    image: trackion:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://trackion:${DB_PASSWORD}@db:5432/trackion
      - JWT_SECRET=${JWT_SECRET}
      - ENV=production
    depends_on:
      - db

  dashboard:
    image: trackion-dashboard:latest
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://your-domain.com

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=trackion
      - POSTGRES_USER=trackion
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Building from Source

```bash
# Build backend
go build -o trackion cmd/server/main.go

# Build dashboard
cd dashboard
npm run build

# Serve dashboard with your web server (nginx, apache, etc.)
```

## Environment Variables

| Variable               | Description                          | Default        |
| ---------------------- | ------------------------------------ | -------------- |
| `DATABASE_URL`         | PostgreSQL connection string         | Required       |
| `JWT_SECRET`           | Secret for JWT tokens                | Required       |
| `PORT`                 | Backend server port                  | `8080`         |
| `ENV`                  | Environment (development/production) | `development`  |
| `ADMIN_TOKEN`          | Admin authentication token           | Auto-generated |
| `GITHUB_CLIENT_ID`     | GitHub OAuth client ID               | Optional       |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret                  | Optional       |

## Verification

Once installed, verify everything is working:

### 1. Check Backend Health

```bash
curl http://localhost:8080/health
# Should return: "all good"
```

### 2. Access Dashboard

Open `http://localhost:5173` in your browser. You should see the Trackion login page.

### 3. Test Tracking Script

```bash
curl http://localhost:8080/t.js
# Should return JavaScript tracking code
```

## Next Steps

1. [Create your first project](/guide/projects)
2. [Add tracking to your website](/guide/quick-start)
3. [Send custom events](/guide/events)

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U trackion -d trackion
```

### Port Already in Use

```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Build Failures

```bash
# Clean Go modules
go mod tidy
go clean -cache

# Update dependencies
go mod download
```

### Docker Issues

```bash
# Clean up Docker
docker-compose down -v
docker system prune -a

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d
```
