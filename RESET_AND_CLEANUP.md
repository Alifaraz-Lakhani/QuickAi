# 🧹 Complete Reset & Cleanup Guide

## ⚠️ WARNING

These commands will **DELETE DATA**. Use only when necessary!

---

## 1️⃣ SOFT RESET (Keep data)

Use this when services are misbehaving but you want to keep volumes/data.

```bash
# Stop all containers (keeps volumes)
docker-compose down

# Remove only containers and networks (not volumes)
# Data in PostgreSQL, Grafana, etc. is preserved

# Start fresh
docker-compose -f docker-compose.full.yml up -d
```

---

## 2️⃣ HARD RESET (Delete everything)

Use this when you want to start completely fresh.

```bash
# Navigate to project directory
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# Stop and remove ALL
docker-compose down -v

# Remove all volumes (WARNING: DATA LOSS!)
docker volume prune -af

# Remove all networks
docker network prune -f

# Verify everything is gone
docker-compose ps        # Should show nothing
docker volume ls         # Should show no quickai volumes

# Start completely fresh
docker-compose -f docker-compose.full.yml up -d

# Wait for services to start
timeout 60 || sleep 60

# Verify
docker-compose ps
```

---

## 3️⃣ NUCLEAR RESET (System-wide cleanup)

Use this as last resort - cleans Docker completely.

```bash
# WARNING: This affects ALL Docker containers/images on your system!

# 1. Stop all containers globally
docker stop $(docker ps -q)

# 2. Remove all containers
docker rm $(docker ps -aq)

# 3. Remove all images
docker rmi $(docker images -q)

# 4. Remove all volumes
docker volume rm $(docker volume ls -q)

# 5. Remove all networks
docker network rm $(docker network ls -q)

# 6. System prune (removes dangling items)
docker system prune -af --volumes

# 7. Verify everything is clean
docker ps -a               # Should be empty
docker images              # Should be empty
docker volume ls           # Should be empty

# 8. Restart Docker daemon (helps sometimes)
# Windows: Restart Docker Desktop
# Linux: sudo systemctl restart docker
# Mac: Restart Docker app

# 9. Start our project fresh
docker-compose -f docker-compose.full.yml up -d
```

---

## 4️⃣ PER-SERVICE RESET

Reset specific services while keeping others running.

### Reset Backend Only
```bash
# Stop backend
docker-compose stop server

# Remove container
docker-compose rm server

# Rebuild
docker-compose build --no-cache server

# Start
docker-compose up -d server

# Check
docker-compose logs -f server
```

### Reset Database Only
```bash
# WARNING: DELETES ALL DATA IN DATABASE!

# Stop database
docker-compose stop postgres

# Remove container and volume
docker-compose rm -v postgres

# Start with fresh database
docker-compose up -d postgres

# Wait for it to be ready
sleep 10

# Verify
docker-compose logs postgres | tail -10
```

### Reset Frontend Only
```bash
# Stop frontend
docker-compose stop client

# Remove container
docker-compose rm client

# Rebuild
docker-compose build --no-cache client

# Start
docker-compose up -d client

# Check
docker-compose logs -f client
```

### Reset All Monitoring (Prometheus, Grafana, Loki)
```bash
# Stop monitoring services
docker-compose stop prometheus grafana loki promtail alertmanager

# Remove containers and volumes
docker-compose rm -v prometheus grafana loki promtail alertmanager

# Restart
docker-compose up -d prometheus grafana loki promtail alertmanager

# Wait 30 seconds for startup
sleep 30

# Verify
docker-compose ps | grep -E "(prometheus|grafana|loki|promtail|alertmanager)"
```

---

## 5️⃣ VOLUME MANAGEMENT

### List All Volumes
```bash
docker volume ls

# Filter for our project
docker volume ls | grep quickai
```

### Remove Specific Volume
```bash
# Remove database volume (WARNING: DATA LOSS!)
docker volume rm quickai-postgres-data

# Remove Grafana dashboards
docker volume rm quickai-grafana-data

# Remove Prometheus metrics
docker volume rm quickai-prometheus-data
```

### Backup Volume Before Deletion
```bash
# Backup database
docker run --rm \
  -v quickai-postgres-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Backup Grafana
docker run --rm \
  -v quickai-grafana-data:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/grafana-backup.tar.gz -C /data .
```

---

## 6️⃣ CLEANUP WITHOUT LOSING DATA

### Remove Unused Docker Objects
```bash
# Remove stopped containers
docker container prune -f

# Remove dangling images (unused layers)
docker image prune -f

# Remove dangling volumes (unused volumes)
docker volume prune -f

# Remove unused networks
docker network prune -f

# All at once
docker system prune -f
```

### Reclaim Disk Space
```bash
# See how much space Docker is using
docker system df

# Remove everything unused (safe, doesn't affect running containers)
docker system prune -af
```

---

## 7️⃣ ENVIRONMENT & CONFIGURATION RESET

### Reset .env File
```bash
# Backup current .env
cp .env .env.backup

# Restore from template
cp .env.example .env

# Edit with your credentials
nano .env  # or vim, or VS Code
```

### Reset Configuration Files
```bash
# Backup configs
cp -r monitoring monitoring.backup
cp -r ansible ansible.backup
cp -r k8s k8s.backup

# Restore from git (if using version control)
git checkout -- monitoring/
git checkout -- ansible/
git checkout -- k8s/
```

---

## 8️⃣ PORT CLEANUP

### Free Up Port 3000 (if stuck)
```bash
# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Free Up Port 4000 (Grafana)
```bash
# Windows
Get-NetTCPConnection -LocalPort 4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### Free Up All Project Ports
```bash
# Stop Docker completely
docker-compose down

# Verify ports are free
netstat -an | grep -E "(3000|4000|5173|8080|9000|9090|9093)"
# Should return nothing

# Restart
docker-compose -f docker-compose.full.yml up -d
```

---

## 9️⃣ LOG CLEANUP

### Clear All Logs
```bash
# Stop services
docker-compose down

# Clear Docker logs (on Linux)
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'

# On Mac/Docker Desktop (logs are auto-managed)
# Just restart Docker

# Clear application logs
rm -rf ./server/logs/*
rm -rf ./logs/*

# Restart
docker-compose -f docker-compose.full.yml up -d
```

---

## 🔟 IMAGE CLEANUP

### Remove All Unused Images
```bash
# Show image sizes
docker images

# Remove specific image
docker rmi <image-id>

# Remove all unused images
docker image prune -a

# Remove our project images only
docker rmi quickai-server:latest
docker rmi quickai-client:latest
```

---

## RESET SCENARIOS

### Scenario 1: "Services Won't Start"
```bash
# 1. Hard reset
docker-compose down -v

# 2. Rebuild everything
docker-compose build --no-cache

# 3. Start fresh
docker-compose -f docker-compose.full.yml up -d

# 4. Wait and check
sleep 30
docker-compose ps
```

### Scenario 2: "Database Corrupted"
```bash
# 1. Stop services
docker-compose stop

# 2. Remove database volume
docker volume rm quickai-postgres-data

# 3. Start database
docker-compose up -d postgres

# 4. Wait for initialization
sleep 15

# 5. Start other services
docker-compose up -d

# 6. Re-run migrations if needed
# (Add your migration commands here)
```

### Scenario 3: "Memory Issues"
```bash
# 1. Stop everything
docker-compose down

# 2. Prune system
docker system prune -af --volumes

# 3. Restart Docker daemon (most important!)
# Windows: Restart Docker Desktop from system tray
# Linux: sudo systemctl restart docker
# Mac: quit Docker and reopen

# 4. Check free memory
free -h                    # Linux
wmic OS get TotalVisibleMemorySize # Windows
vm_stat                    # Mac

# 5. Restart services
docker-compose -f docker-compose.full.yml up -d
```

### Scenario 4: "Start Fresh from Scratch"
```bash
# Complete reset
docker-compose down -v
docker volume prune -af
docker image prune -af
docker network prune -f
docker system prune -af

# Create .env
cp .env.example .env
# Edit .env with credentials

# Start fresh
docker-compose -f docker-compose.full.yml up -d

# Verify
docker-compose ps
curl http://localhost:3000/
```

---

## 📋 AUTOMATED CLEANUP SCRIPT

### For Linux/Mac (cleanup.sh)
```bash
#!/bin/bash
echo "Cleaning up QuickAi DevOps..."

# Soft reset
docker-compose down

# Remove volumes
docker volume prune -af

# Remove unused images
docker image prune -af

# System cleanup
docker system prune -af

echo "Cleanup complete!"
echo "Run: docker-compose -f docker-compose.full.yml up -d"
```

### For Windows (cleanup.ps1)
```powershell
Write-Host "Cleaning up QuickAi DevOps..."

# Soft reset
docker-compose down

# Remove volumes
docker volume prune -af

# Remove unused images  
docker image prune -af

# System cleanup
docker system prune -af

Write-Host "Cleanup complete!"
Write-Host "Run: docker-compose -f docker-compose.full.yml up -d"
```

---

## ✅ VERIFICATION AFTER RESET

```bash
# All containers running
docker-compose ps

# All services healthy
curl http://localhost:3000/
curl http://localhost:4000/api/health
curl http://localhost:9090/-/healthy

# No volumes from old run
docker volume ls | grep quickai

# No unused images
docker images | grep quickai
```

---

## 🆘 WHEN NOTHING WORKS

```bash
# 1. Stop and remove everything
docker stop $(docker ps -q)
docker rm $(docker ps -aq)
docker volume rm $(docker volume ls -q)

# 2. Restart Docker daemon
# Windows: Restart Docker Desktop
# Linux: sudo systemctl restart docker
# Mac: Restart Docker app

# 3. Wait 30 seconds
sleep 30

# 4. Start fresh
docker-compose -f docker-compose.full.yml up -d

# 5. Monitor startup
docker-compose logs -f
```

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Ready to clean up
