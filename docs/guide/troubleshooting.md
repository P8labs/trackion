# Troubleshooting

Common issues and solutions when using Trackion.

## Installation Issues

### Database Connection Failed

**Problem:** Can't connect to PostgreSQL database

**Solutions:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection manually
psql -h localhost -U trackion -d trackion

# Check database URL format
DATABASE_URL=postgres://user:password@host:port/database
```

### Port Already in Use

**Problem:** Port 8080 is already occupied

**Solutions:**

```bash
# Find process using port
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=8081
```

### Build Failures

**Problem:** Go build fails with dependencies

**Solutions:**

```bash
# Clean module cache
go clean -modcache

# Download dependencies
go mod download
go mod tidy

# Build again
go build cmd/server/main.go
```

## Tracking Issues

### Script Not Loading

**Problem:** `t.js` script returns 404 or doesn't load

**Checklist:**

1. ✅ Verify server is running: `curl http://localhost:8080/health`
2. ✅ Check script URL: `http://localhost:8080/t.js`
3. ✅ Verify CORS settings for your domain
4. ✅ Check browser console for errors

### No Events Appearing

**Problem:** Dashboard shows no data despite traffic

**Debug Steps:**

```javascript
// 1. Check if script loaded
console.log(window.trackion);

// 2. Check browser network tab for failed requests

// 3. Test with manual event
if (window.trackion) {
  window.trackion.track("test.event", { debug: true });
}

// 4. Verify project key is correct
```

### Project Key Issues

**Problem:** Invalid or missing project key

**Solutions:**

```html
<!-- Verify project key format -->
<script src="http://localhost:8080/t.js" data-project="proj_abc123456"></script>

<!-- Check project exists in dashboard -->
<!-- Copy key directly from dashboard (don't type manually) -->
```

## Dashboard Issues

### Can't Login

**Problem:** Authentication fails

**Solutions:**

```bash
# Check admin token in logs
journalctl -u trackion | grep "admin token"

# Reset admin token
./trackion --reset-admin-token

# Check GitHub OAuth configuration (if using)
echo $GITHUB_CLIENT_ID
echo $GITHUB_CLIENT_SECRET
```

### Dashboard Won't Load

**Problem:** Dashboard shows blank page or errors

**Debug Steps:**

1. Check browser console for JavaScript errors
2. Verify backend is accessible from frontend
3. Check if API endpoints return data:

```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/projects
```

### Slow Loading

**Problem:** Dashboard takes long time to load

**Solutions:**

```bash
# Check database performance
psql -d trackion -c "SELECT count(*) FROM events;"

# Add database indexes if needed
psql -d trackion -c "CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);"

# Check disk space
df -h

# Monitor memory usage
htop
```

## API Issues

### 401 Unauthorized

**Problem:** API requests return authentication errors

**Solutions:**

```bash
# Verify admin token format
curl -H "Authorization: Bearer your-token-here" \
  http://localhost:8080/api/projects

# Check token in environment
echo $ADMIN_TOKEN

# Generate new token if needed
./trackion --generate-token
```

### 400 Bad Request

**Problem:** API requests return validation errors

**Common Issues:**

```json
// Missing required fields
{
  "project": "proj_123",
  "name": "event.name"
  // ✅ properties field optional but can't be null
}

// Invalid project key format
{
  "project": "invalid-key",  // ❌ Must start with proj_
  "name": "event.name"
}

// Invalid JSON
{
  "project": "proj_123",
  "name": "event.name",  // ❌ Extra comma
}
```

### 429 Rate Limited

**Problem:** Too many requests

**Solutions:**

```bash
# Check rate limits in logs
journalctl -u trackion | grep "rate limit"

# Implement request batching
# Wait between requests
# Check for request loops
```

## Performance Issues

### High Memory Usage

**Problem:** Trackion consuming too much RAM

**Investigation:**

```bash
# Check memory usage
ps aux | grep trackion

# Check Go memory stats
curl http://localhost:8080/debug/vars

# Database connection pool
psql -d trackion -c "SELECT count(*) FROM pg_stat_activity;"
```

### Slow Queries

**Problem:** Database queries taking too long

**Debug:**

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC;

-- Add missing indexes
CREATE INDEX idx_events_project_created ON events(project_id, created_at);
```

### Disk Space Issues

**Problem:** Running out of disk space

**Solutions:**

```bash
# Check disk usage
df -h

# Find large files
du -sh /var/lib/postgresql/data/*

# Clean old data (careful!)
psql -d trackion -c "DELETE FROM events WHERE created_at < NOW() - INTERVAL '90 days';"

# Set up automatic cleanup
# Add to crontab: 0 2 * * * /opt/trackion/cleanup.sh
```

## Network Issues

### CORS Errors

**Problem:** Browser blocks requests due to CORS

**Solutions:**

```go
// In Go backend, ensure CORS is configured
r.Use(cors.AllowAll().Handler) // Development

// Or specific domains for production:
r.Use(cors.New(cors.Options{
  AllowedOrigins: []string{"https://yoursite.com"},
  AllowedMethods: []string{"GET", "POST", "OPTIONS"},
  AllowedHeaders: []string{"*"},
}).Handler)
```

### SSL Certificate Issues

**Problem:** HTTPS/SSL related errors

**Solutions:**

```bash
# Check certificate expiry
echo | openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Renew Let's Encrypt certificate
sudo certbot renew

# Test SSL configuration
curl -I https://your-domain.com/health
```

## Docker Issues

### Container Won't Start

**Problem:** Docker containers fail to start

**Debug:**

```bash
# Check container logs
docker-compose logs trackion

# Check database logs
docker-compose logs db

# Verify environment variables
docker-compose exec trackion env | grep DATABASE_URL

# Check container health
docker-compose ps
```

### Volume Issues

**Problem:** Data not persisting between restarts

**Solutions:**

```bash
# Check volume mounts
docker-compose exec trackion ls -la /opt/trackion

# Verify volume configuration in docker-compose.yml
volumes:
  postgres_data:/var/lib/postgresql/data

# Check volume exists
docker volume ls | grep postgres_data
```

## Getting Help

If you're still experiencing issues:

1. **Check the logs** for error messages
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Error messages
   - Steps to reproduce
   - Environment details (OS, Docker version, etc.)
   - Relevant log excerpts

### Useful Commands

```bash
# Collect debug information
./trackion --version
docker --version
psql --version

# System information
uname -a
free -h
df -h

# Service status
sudo systemctl status trackion
sudo systemctl status postgresql
sudo systemctl status nginx
```

For more help:

- [GitHub Issues](https://github.com/p8labs/trackion/issues)
- [Discussions](https://github.com/p8labs/trackion/discussions)
- [Installation Guide](/guide/installation)
