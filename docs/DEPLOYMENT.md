# Deployment Guide

## Deployment Options

WxLingua can be deployed using various methods:

1. Docker Compose (Recommended for small-medium scale)
2. Kubernetes (For large scale, high availability)
3. Platform-as-a-Service (Vercel, Railway, Render)
4. Manual deployment on VPS

## Docker Compose Deployment

### Prerequisites

- Docker 24.x or higher
- Docker Compose 2.x or higher
- Domain name (optional, for SSL)
- SSL certificates (Let's Encrypt recommended)

### Production Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/wxlingua.git
cd wxlingua
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with production values:

```env
# Database
DB_USER=postgres
DB_PASSWORD=<strong-random-password>
DB_NAME=wxlingua
DB_PORT=5432

# Redis
REDIS_PORT=6379

# Backend
BACKEND_PORT=3000
JWT_SECRET=<strong-random-secret-min-32-chars>
CORS_ORIGIN=https://yourdomain.com

# Frontend
FRONTEND_PORT=3001
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# AWS SES (email delivery)
SES_REGION=ap-southeast-1
SES_ACCESS_KEY_ID=<aws-access-key-id>
SES_SECRET_ACCESS_KEY=<aws-secret-access-key>
SES_FROM_EMAIL=no-reply@yourdomain.com

# Production mode
NODE_ENV=production
```

**Generate strong secrets:**

```bash
# JWT secret (32+ characters)
openssl rand -base64 32

# Database password
openssl rand -base64 24
```

#### 3. Build and Start Services

```bash
# Build images
docker-compose build

# Start services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

#### 4. Initialize Database

```bash
# Run migrations (first time only)
docker-compose exec backend npx prisma migrate deploy

# Seed data (optional)
docker-compose exec backend npx prisma db seed
```

#### 5. Verify Deployment

```bash
# Check backend health
curl http://127.0.0.1:3000/health

# Check frontend
curl http://localhost:3001

# Check logs
docker-compose logs backend
docker-compose logs frontend
```

### SSL/TLS Configuration

#### Using Coolify Managed Proxy + SSL

When deploying with Coolify, reverse proxy and HTTPS should be managed directly by the platform.

1. Configure domains in the service settings (for example `yourdomain.com` and `api.yourdomain.com`).
2. Enable automatic Let's Encrypt certificates in Coolify.
3. Set app environment variables to match production domains:

```env
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

4. Keep only application services (frontend/backend/postgres/redis) in Docker Compose.

### Backup Strategy

#### Database Backups

Create `backup-db.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wxlingua_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U postgres wxlingua > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

#### Automated Backups with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-db.sh
```

#### Restore from Backup

```bash
# Decompress
gunzip wxlingua_20260222_020000.sql.gz

# Restore
docker-compose exec -T postgres psql -U postgres wxlingua < wxlingua_20260222_020000.sql
```

### Monitoring & Logging

#### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 backend
```

#### Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Performance Optimization

#### Enable PostgreSQL Performance Tuning

Edit `docker-compose.yml`:

```yaml
postgres:
  image: postgres:16-alpine
  command: >
    postgres
    -c shared_buffers=256MB
    -c effective_cache_size=1GB
    -c maintenance_work_mem=64MB
    -c checkpoint_completion_target=0.9
    -c wal_buffers=16MB
    -c default_statistics_target=100
    -c random_page_cost=1.1
    -c effective_io_concurrency=200
    -c work_mem=4MB
    -c min_wal_size=1GB
    -c max_wal_size=4GB
```

#### Redis Optimization

```yaml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
    --appendonly yes
```

## Platform-as-a-Service Deployment

### Vercel (Frontend Only)

#### Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel
```

#### Configure Environment Variables

In Vercel Dashboard:

- `NEXT_PUBLIC_API_URL`: Your backend URL

### Railway (Full Stack)

#### Setup

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Configure Services

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "healthcheckPath": "/health"
  }
}
```

### Render

#### Backend Deployment

1. Connect GitHub repository
2. Create new Web Service
3. Configure:
   - **Build Command**: `cd backend && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Environment Variables**: Add all from `.env`

#### Frontend Deployment

1. Create new Static Site
2. Configure:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/.next`

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- kubectl configured
- Helm 3.x (optional)

### Kubernetes Manifests

#### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: wxlingua
```

#### PostgreSQL

```yaml
# k8s/postgres.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: wxlingua
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_DB
              value: wxlingua
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: username
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          ports:
            - containerPort: 5432
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: wxlingua
spec:
  ports:
    - port: 5432
  selector:
    app: postgres
  clusterIP: None
```

#### Backend Deployment

```yaml
# k8s/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: wxlingua
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: yourusername/wxlingua-backend:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: database-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: app-secret
                  key: jwt-secret
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: wxlingua
spec:
  selector:
    app: backend
  ports:
    - port: 3000
      targetPort: 3000
  type: ClusterIP
```

#### Deploy

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check status
kubectl get pods -n wxlingua
kubectl get services -n wxlingua

# View logs
kubectl logs -f deployment/backend -n wxlingua
```

## Maintenance

### Updates

#### Docker Compose

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec backend npx prisma migrate deploy
```

#### Rolling Updates (Kubernetes)

```bash
# Update image
kubectl set image deployment/backend backend=yourusername/wxlingua-backend:v1.1.0 -n wxlingua

# Check rollout status
kubectl rollout status deployment/backend -n wxlingua

# Rollback if needed
kubectl rollout undo deployment/backend -n wxlingua
```

### Scaling

#### Docker Compose

```bash
# Scale backend
docker-compose up -d --scale backend=3
```

#### Kubernetes

```bash
# Scale backend pods
kubectl scale deployment/backend --replicas=5 -n wxlingua

# Auto-scaling
kubectl autoscale deployment/backend --min=3 --max=10 --cpu-percent=80 -n wxlingua
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up intrusion detection
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Secrets management (Vault, AWS Secrets Manager)
- [ ] Regular backups
- [ ] Monitoring and alerting

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Restart service
docker-compose restart backend
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d wxlingua

# Reset database (CAUTION!)
docker-compose down -v
docker-compose up -d
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check database performance
docker-compose exec postgres psql -U postgres -d wxlingua -c "SELECT * FROM pg_stat_activity;"
```

## Monitoring Solutions

### Recommended Tools

- **Application**: New Relic, DataDog, or Sentry
- **Infrastructure**: Prometheus + Grafana
- **Uptime**: UptimeRobot, Pingdom
- **Logs**: ELK Stack (Elasticsearch, Logstash, Kibana)

## Support

For deployment assistance:

- Email: devops@wxlingua.com
- Documentation: https://docs.wxlingua.com
- GitHub Issues: https://github.com/wxlingua/wxlingua/issues
