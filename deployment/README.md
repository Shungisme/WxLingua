# WxLingua Deployment

This directory contains all deployment-related configurations and version history.

## Directory Structure

```
deployment/
├── README.md                          # This file
├── docker-compose.dev.yml             # Development environment
├── docker-compose.staging.yml         # Staging environment
├── docker-compose.prod.yml            # Production environment
├── docker-compose.monitoring.yml      # Monitoring stack
├── nginx/                             # Nginx configurations
│   ├── nginx.conf                     # Main config
│   ├── sites-enabled/                 # Virtual hosts
│   └── ssl/                           # SSL certificates
├── scripts/                           # Deployment scripts
│   ├── deploy.sh                      # Main deployment script
│   ├── backup.sh                      # Backup script
│   ├── restore.sh                     # Restore script
│   └── health-check.sh                # Health check script
└── versions/                          # Version history
    ├── v0.0.1/
    │   ├── CHANGES.md                 # Change log for this version
    │   ├── migration.sql              # Database migrations
    │   └── rollback.sql               # Rollback script
    └── README.md                      # Version documentation
```

## Quick Start

### Development

```bash
docker-compose -f deployment/docker-compose.dev.yml up -d
```

### Staging

```bash
docker-compose -f deployment/docker-compose.staging.yml up -d
```

### Production

```bash
docker-compose -f deployment/docker-compose.prod.yml up -d
```

## Environment Variables

Copy and configure environment files:

```bash
cp deployment/.env.dev.example deployment/.env.dev
cp deployment/.env.staging.example deployment/.env.staging
cp deployment/.env.prod.example deployment/.env.prod
```

## Deployment Process

1. **Backup current database**

   ```bash
   ./deployment/scripts/backup.sh
   ```

2. **Deploy new version**

   ```bash
   ./deployment/scripts/deploy.sh v1.0.0
   ```

3. **Run health checks**

   ```bash
   ./deployment/scripts/health-check.sh
   ```

4. **Rollback if needed**
   ```bash
   docker-compose -f deployment/docker-compose.prod.yml down
   ./deployment/scripts/restore.sh v0.9.0
   ```

## Monitoring

Access monitoring tools:

- **Grafana**: http://localhost:3300
- **Prometheus**: http://localhost:9090
- **PostgreSQL Exporter**: http://localhost:9187

## Version Management

Each version should have:

- `CHANGES.md`: Detailed changes
- `migration.sql`: Database changes
- `rollback.sql`: Rollback procedure
- `deployment-notes.md`: Special deployment instructions

## Security

- Store sensitive data in `.env` files (not committed)
- Use secrets management in production
- Enable SSL/TLS for all external connections
- Regular security updates

## Support

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for detailed deployment guide.
