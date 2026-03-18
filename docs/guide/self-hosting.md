# Self-hosting

Complete guide to deploying Trackion in production.

## Overview

Trackion is designed to be self-hosted, giving you complete control over your analytics data. This guide covers production deployment strategies.

## Docker Deployment (Recommended)

### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: "3.8"
services:
  trackion:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://trackion:${DB_PASSWORD}@db:5432/trackion
      - JWT_SECRET=${JWT_SECRET}
      - ENV=production
    depends_on:
      - db

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

### Environment Configuration

Create `.env.prod`:

```env
DB_PASSWORD=your-secure-database-password
JWT_SECRET=your-random-jwt-secret-key
```

### Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Manual Installation

### Requirements

- **Go 1.21+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Reverse Proxy** (nginx/traefik)

### Build from Source

```bash
# Backend
go build -o trackion cmd/server/main.go

# Dashboard
cd dashboard
npm install
npm run build

# Copy dashboard build to web server
cp -r dist/* /var/www/trackion-dashboard/
```

### Database Setup

```sql
CREATE DATABASE trackion;
CREATE USER trackion WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE trackion TO trackion;
```

Run migrations:

```bash
./trackion migrate up
```

### Systemd Service

Create `/etc/systemd/system/trackion.service`:

```ini
[Unit]
Description=Trackion Analytics Server
After=network.target

[Service]
Type=simple
User=trackion
WorkingDirectory=/opt/trackion
ExecStart=/opt/trackion/trackion
Restart=always
Environment=DATABASE_URL=postgres://trackion:password@localhost/trackion
Environment=JWT_SECRET=your-secret
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable trackion
sudo systemctl start trackion
```

## Reverse Proxy Setup

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name analytics.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL with Let's Encrypt

```bash
sudo certbot --nginx -d analytics.yourdomain.com
```

## Security Considerations

### Database Security

- Use strong passwords
- Enable SSL connections
- Regular backups
- Network isolation

### Application Security

- Keep JWT secret secure
- Regular updates
- Monitor logs
- Rate limiting

### Network Security

- Firewall configuration
- VPN access for admin
- Regular security updates

## Monitoring

### Health Checks

```bash
curl http://localhost:8080/health
```

### Log Monitoring

```bash
journalctl -u trackion -f
```

### Database Monitoring

```sql
-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Check database size
SELECT pg_database_size('trackion');
```

## Backup Strategy

### Database Backup

```bash
# Daily backup
pg_dump trackion > trackion_$(date +%Y%m%d).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups/trackion"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump trackion | gzip > $BACKUP_DIR/trackion_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "trackion_*.sql.gz" -mtime +30 -delete
```

### Full System Backup

Include in your regular backup:

- Database dumps
- Application binary
- Configuration files
- SSL certificates

## Scaling

### Vertical Scaling

- Increase CPU/RAM
- Faster storage (SSD)
- Better database configuration

### Horizontal Scaling

- Multiple application instances
- Load balancer
- Read replicas for database
- Redis for session storage

## Troubleshooting

### Common Issues

**Database Connection Issues:**

```bash
# Check connection
psql -h localhost -U trackion -d trackion

# Check if port is open
netstat -tulpn | grep 5432
```

**Application Won't Start:**

```bash
# Check logs
journalctl -u trackion -n 50

# Check configuration
./trackion --config-test
```

**Dashboard Not Loading:**

```bash
# Check nginx logs
tail -f /var/log/nginx/error.log

# Test backend connection
curl http://localhost:8080/health
```

## Maintenance

### Regular Tasks

- **Weekly:** Check logs and disk space
- **Monthly:** Update dependencies and security patches
- **Quarterly:** Review backup and recovery procedures

### Updates

```bash
# Backup before updating
pg_dump trackion > pre_update_backup.sql

# Update application
git pull
go build -o trackion cmd/server/main.go

# Restart service
sudo systemctl restart trackion
```

For more deployment options, check the [installation guide](/guide/installation).
