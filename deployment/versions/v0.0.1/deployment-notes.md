# Deployment Notes for v0.0.1

## Pre-Deployment Checklist

- [ ] Review all environment variables
- [ ] Change default JWT_SECRET
- [ ] Set strong database passwords
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Setup SSL certificates (Let's Encrypt)
- [ ] Prepare backup strategy
- [ ] Test on staging environment first

## Special Instructions

### First-Time Setup

This is the initial release, so there's no existing data to migrate.

1. **Environment Configuration**

   ```bash
   cp deployment/.env.prod.example deployment/.env.prod
   # Edit .env.prod with production values
   ```

2. **Database Initialization**

   ```bash
   # Start database
   docker-compose -f deployment/docker-compose.prod.yml up -d postgres redis

   # Wait for PostgreSQL to be ready (about 10 seconds)
   docker-compose -f deployment/docker-compose.prod.yml exec postgres pg_isready

   # Run Prisma migrations
   docker-compose -f deployment/docker-compose.prod.yml run --rm backend npx prisma migrate deploy

   # Seed initial data (radicals, sample words)
   docker-compose -f deployment/docker-compose.prod.yml run --rm backend npx prisma db seed
   ```

3. **Create Admin User**

   After deployment, create an admin user via API:

   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@yourdomain.com",
       "password": "secure_password",
       "name": "Admin User"
     }'
   ```

   Then manually update role in database:

   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@yourdomain.com';
   ```

4. **Upload Initial Audio Files**

   Upload audio files to S3, then store the returned public URL in `Word.audioUrl`.

### SSL/TLS Setup

For production with Coolify:

1. **Connect Domains in Coolify**

   Add your app domains in the Coolify service settings (for example: `yourdomain.com`, `api.yourdomain.com`).

2. **Enable HTTPS in Coolify**

   Coolify can provision and renew Let's Encrypt certificates automatically.

3. **Configure App URLs**

   Ensure `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` match your configured production domains.

### Performance Tuning

For production deployment, consider:

1. **PostgreSQL**
   - Already tuned in docker-compose.prod.yml
   - Monitor `pg_stat_statements` for slow queries
   - Setup regular VACUUM and ANALYZE

2. **Redis**
   - Configure maxmemory based on server RAM
   - Currently set to 512MB in docker-compose.prod.yml
   - Monitor memory usage with `redis-cli info memory`

3. **Backend**
   - Resource limits set in docker-compose.prod.yml
   - Scale horizontally if needed: `docker-compose up -d --scale backend=3`
   - Use Coolify load balancing for multiple instances

4. **Frontend**
   - Next.js already optimized with standalone output
   - Enable CDN for static assets (planned)
   - Consider Redis cache for pages (planned)

### Monitoring Setup

1. **Enable Health Checks**

   Health endpoints are already configured:
   - Backend: `http://backend:3000/health`
   - Frontend: `http://frontend:3001/`

2. **Log Collection**

   Logs are in JSON format with rotation:

   ```bash
   docker-compose -f deployment/docker-compose.prod.yml logs -f backend
   ```

3. **Metrics** (Optional)

   Setup Prometheus + Grafana:

   ```bash
   docker-compose -f deployment/docker-compose.monitoring.yml up -d
   ```

### Backup Strategy

1. **Automated Backups**

   Setup daily backups:

   ```bash
   # Add to crontab
   0 2 * * * /path/to/deployment/scripts/backup.sh production
   ```

2. **Backup Retention**

   Backups older than 30 days are automatically deleted

   Modify retention in `scripts/backup.sh` if needed

3. **Test Restore**

   Regularly test backup restoration on staging:

   ```bash
   ./deployment/scripts/restore.sh backups/wxlingua_production_20260222_020000.sql.gz staging
   ```

### Security Hardening

1. **Firewall Rules**

   ```bash
   # Allow only necessary ports
   ufw allow 22/tcp   # SSH
   ufw allow 80/tcp   # HTTP
   ufw allow 443/tcp  # HTTPS
   ufw enable
   ```

2. **Database Access**

   PostgreSQL and Redis are bound to 127.0.0.1 in docker-compose.prod.yml

   Only accessible from backend container

3. **Rate Limiting** (Planned)

   Will be implemented in v0.1.0

### Post-Deployment Verification

1. **Health Checks**

   ```bash
   ./deployment/scripts/health-check.sh production
   ```

2. **Smoke Tests**

   ```bash
   # Test user registration
   curl -X POST https://api.yourdomain.com/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

   # Test login
   curl -X POST https://api.yourdomain.com/auth/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"test123"}'

   # Test words endpoint
   curl https://api.yourdomain.com/words
   ```

3. **Frontend Access**

   Visit https://yourdomain.com and verify:
   - [ ] Homepage loads
   - [ ] Can register
   - [ ] Can login
   - [ ] Dashboard displays
   - [ ] Can browse words/radicals/decks
   - [ ] Can start study session

### Rollback Procedure

If something goes wrong:

1. **Stop services**

   ```bash
   docker-compose -f deployment/docker-compose.prod.yml down
   ```

2. **Restore database**

   ```bash
   ./deployment/scripts/restore.sh backups/latest_backup.sql.gz production
   ```

3. **Restart with previous version**
   ```bash
   git checkout v0.0.0  # Or previous stable version
   docker-compose -f deployment/docker-compose.prod.yml up -d
   ```

## Known Issues & Workarounds

### Issue: Audio files not playing on iOS Safari

**Workaround**: Ensure your Coolify-managed proxy serves correct MIME types for audio files (`mp3`, `wav`, `ogg`, `m4a`).

### Issue: CORS errors on production

**Solution**: Verify CORS_ORIGIN in .env.prod matches your frontend domain exactly

## Support Contacts

- **DevOps Lead**: devops@wxlingua.com
- **Backend Lead**: backend@wxlingua.com
- **Frontend Lead**: frontend@wxlingua.com
- **Emergency**: emergency@wxlingua.com

## Timeline

- **Development Complete**: 2026-02-20
- **Staging Deployment**: 2026-02-21
- **Production Deployment**: 2026-02-22
- **Monitoring Period**: 7 days post-deployment

## Success Criteria

- [ ] All health checks passing
- [ ] User registration working
- [ ] Study sessions functional
- [ ] No critical errors in logs
- [ ] Response times < 200ms
- [ ] Uptime > 99.9%
