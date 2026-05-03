# 🔧 Troubleshooting Guide

## 🚨 Critical Issues & Fixes

---

## 1️⃣ PORT CONFLICT: "Port 3000 Already in Use"

### ❌ Problem
```
Error response from daemon: Bind for 0.0.0.0:3000 failed: port is already allocated
```

### ✅ Solution

**Windows (PowerShell)**:
```powershell
# Find process using port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess

# Kill process (replace 12345 with PID)
Stop-Process -ID 12345 -Force

# Or force kill all Docker containers
docker-compose down -v
docker system prune -af
```

**Linux/Mac**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or force clean Docker
docker-compose down -v
docker system prune -af
```

### Verify Fix
```bash
# Port should be free now
netstat -an | grep 3000  # Windows
lsof -i :3000            # Linux/Mac

# Should return nothing if port is free
```

---

## 2️⃣ 502 BAD GATEWAY ERROR

### ❌ Problem
```
Failed to load resource: the server responded with a status of 502 (Bad Gateway)
http://localhost:5173/api/ai/generate-blog-title
```

### ✅ Root Causes & Solutions

#### Cause A: Backend Not Running
```bash
# Check if server is running
docker-compose ps | grep server

# If not running, start it
docker-compose up -d server

# Check logs
docker-compose logs -f server
```

#### Cause B: Network Issues
```bash
# Verify containers are on same network
docker network inspect quickai-network

# Restart network
docker-compose down
docker-compose up -d
```

#### Cause C: Backend Not Healthy
```bash
# Check backend health
docker-compose exec server curl http://localhost:3000/

# If fails, check logs
docker-compose logs -f server

# Look for errors like:
# - Connection refused
# - Port already in use
# - Database connection error
```

#### Cause D: Frontend Configuration Wrong
```bash
# Check frontend is calling correct URL
# File: client/src/... or wherever API calls are made

# Should call: http://localhost:3000 (or use environment variable)
# NOT: http://server:3000 (that's internal Docker network)

# Rebuild frontend with correct API URL
docker-compose build --no-cache client
docker-compose restart client
```

#### Cause E: CORS Issues
```bash
# Check backend has CORS enabled
docker-compose logs -f server | grep -i cors

# Should see something like:
# CORS: enabled for http://localhost:5173

# If not, check server/server.js:
# app.use(cors())
```

### Complete Fix Sequence
```bash
# 1. Stop everything
docker-compose down -v

# 2. Clean all volumes
docker volume prune -f

# 3. Rebuild all images
docker-compose build --no-cache

# 4. Start fresh
docker-compose -f docker-compose.full.yml up -d

# 5. Wait for services to be healthy (30-60 seconds)
sleep 30

# 6. Verify all services are running
docker-compose ps

# 7. Test backend
curl http://localhost:3000/

# 8. Test frontend
curl http://localhost:5173/

# 9. Check logs for errors
docker-compose logs -f
```

---

## 3️⃣ GRAFANA PORT CONFLICT (Both on 3000)

### ❌ Problem
```
Grafana trying to use port 3000
But Backend API already using port 3000
Result: Port conflict error
```

### ✅ Solution
```bash
# File changed: docker-compose.full.yml
# Grafana now uses port 4000 instead of 3000

# Access Grafana at:
# http://localhost:4000 (NOT 3000!)

# If still having issues:
docker-compose down -v
docker-compose up -d

# Verify ports
docker-compose ps

# Should show:
# grafana: 4000->3000/tcp
# server:  3000->3000/tcp
```

---

## 4️⃣ PROMETHEUS TIME DRIFT WARNING

### ❌ Problem
```
Warning: Server time is out of sync
Detected a time difference of 3m 18.547s between your browser and the server
```

### ✅ Causes & Solutions

#### Cause A: System Clock Out of Sync

**Windows**:
```powershell
# Check current time
Get-Date

# Sync with NTP server
w32tm /resync /force

# Verify time is synced
Get-Date
```

**Linux/Mac**:
```bash
# Check current time
date

# Sync with NTP (if timedatectl available)
sudo timedatectl set-ntp true

# Or use ntpd
sudo service ntpd restart

# Verify
date
```

#### Cause B: Docker Container Time Mismatch

```bash
# Check time inside container
docker-compose exec prometheus date

# Should match host time (within seconds)
date

# If not matching:
# 1. Stop container
docker-compose stop prometheus

# 2. Make sure host time is correct
# (Use solutions above)

# 3. Restart container
docker-compose start prometheus
```

#### Cause C: Timezone Mismatch

```bash
# Set timezone in docker-compose.yml
# Add to prometheus service:
environment:
  TZ: "UTC"  # or your timezone

# Restart
docker-compose restart prometheus
```

### Verify Fix
```bash
# After sync, query Prometheus
curl http://localhost:9090/api/v1/query?query=up

# Should return results without time warning
```

---

## 5️⃣ DATABASE CONNECTION ERROR

### ❌ Problem
```
Error: connect ECONNREFUSED 127.0.0.1:5432
Database connection failed
```

### ✅ Solution

```bash
# 1. Check if PostgreSQL is running
docker-compose ps | grep postgres

# 2. If not running
docker-compose up -d postgres

# 3. Wait for it to be healthy (10-15 seconds)
docker-compose exec postgres pg_isready -U quickai

# 4. Test connection
psql -h localhost -U quickai -d quickai_db

# 5. If still fails, check environment variables
cat .env | grep DATABASE_URL

# 6. Verify DATABASE_URL format
# Should be: postgresql://quickai:password@postgres:5432/quickai_db

# 7. Or restart everything
docker-compose down
docker-compose up -d
```

---

## 6️⃣ CONTAINER WON'T START

### ❌ Problem
```
Container exited with code 1
Or: Container keeps restarting
```

### ✅ Solution

```bash
# 1. Check detailed logs
docker-compose logs -f <service-name>

# 2. Check specific error
# Examples:
# - "Address already in use" → Kill process on that port
# - "Connection refused" → Service not running
# - "Out of memory" → Docker resource limit
# - "Image not found" → Rebuild image

# 3. Rebuild container if image issue
docker-compose build --no-cache <service-name>

# 4. Restart
docker-compose restart <service-name>

# 5. Check logs again
docker-compose logs -f <service-name>

# 6. If still fails, recreate completely
docker-compose down
docker-compose up -d <service-name>
```

---

## 7️⃣ FRONTEND CAN'T CONNECT TO BACKEND

### ❌ Problem
```
Frontend working at http://localhost:5173
Backend working at http://localhost:3000
But frontend can't call API endpoints
```

### ✅ Solution

```bash
# 1. Verify backend is running
curl http://localhost:3000/

# 2. Check frontend is making correct calls
# In browser DevTools:
# Check Network tab for API calls
# Should see requests to: http://localhost:3000/api/*

# 3. Check if CORS is enabled
curl -i http://localhost:3000/

# Response should include:
# Access-Control-Allow-Origin: *
# (or specific origin)

# 4. If CORS missing, check server/server.js
# Should have: app.use(cors())

# 5. Rebuild and restart
docker-compose build --no-cache server client
docker-compose restart server client

# 6. Test again
curl http://localhost:3000/api/ai/generate-article \
  -H "Content-Type: application/json"
```

---

## 8️⃣ JENKINS CAN'T BUILD DOCKER IMAGES

### ❌ Problem
```
Jenkins error: Cannot connect to Docker daemon
Or: docker: command not found
```

### ✅ Solution

```bash
# 1. Give Jenkins permission to Docker socket
docker-compose exec jenkins usermod -aG docker jenkins

# 2. Restart Jenkins
docker-compose restart jenkins

# 3. Or mount Docker socket correctly in docker-compose.yml
# Check: volumes:
#   - /var/run/docker.sock:/var/run/docker.sock

# 4. Verify Jenkins can access Docker
docker-compose exec jenkins docker ps

# Should show list of containers

# 5. If still failing:
docker-compose restart jenkins
```

---

## 9️⃣ SONARQUBE ANALYSIS FAILING

### ❌ Problem
```
SonarQube analysis failed
Or: Cannot connect to SonarQube server
```

### ✅ Solution

```bash
# 1. Check SonarQube is running
docker-compose ps | grep sonarqube

# 2. Wait for SonarQube to start (takes 30-60 seconds)
docker-compose logs -f sonarqube

# Look for: "SonarQube is up"

# 3. Verify access
curl http://localhost:9000/api/system/health

# 4. Check .env has token
cat .env | grep SONAR

# 5. Manually run analysis
sonar-scanner \
  -Dsonar.projectKey=QuickAi \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=your_token_here

# 6. Check results
# http://localhost:9000/projects/QuickAi
```

---

## 🔟 LOKI NOT COLLECTING LOGS

### ❌ Problem
```
No logs appearing in Grafana/Loki
Or: Loki shows "No logs found"
```

### ✅ Solution

```bash
# 1. Check Loki is running
docker-compose ps | grep loki

# 2. Check Promtail is running (log forwarder)
docker-compose ps | grep promtail

# 3. Check Promtail logs
docker-compose logs -f promtail

# Should show: "Connected to Loki"

# 4. Manually send test log
echo "test log" | docker-compose exec -T promtail \
  cat >> /var/log/test.log

# 5. Query Loki
curl http://localhost:3100/loki/api/v1/query?query=\{job%3D%22promtail%22\}

# 6. In Grafana, query with
# {job="promtail"}

# 7. If still not working
docker-compose restart loki promtail
```

---

## DIAGNOSTIC COMMANDS

### Check All Services Status
```bash
docker-compose ps
```

### Check Specific Service Health
```bash
# Backend API
docker-compose exec server curl http://localhost:3000/

# Frontend
docker-compose exec client curl http://localhost:80/

# Database
docker-compose exec postgres pg_isready -U quickai

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:4000/api/health

# SonarQube
curl http://localhost:9000/api/system/health
```

### View Service Logs
```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
docker-compose logs -f prometheus
docker-compose logs -f grafana

# Last 100 lines
docker-compose logs --tail=100 server
```

### Check Network
```bash
# Inspect network
docker network inspect quickai-network

# Test connectivity between containers
docker-compose exec server ping postgres
docker-compose exec client curl http://server:3000/
```

---

## 🧹 COMPLETE CLEANUP & RESET

```bash
# WARNING: This removes everything!

# 1. Stop all containers
docker-compose down

# 2. Remove volumes (data loss!)
docker volume prune -af

# 3. Remove images
docker image prune -af

# 4. Remove networks
docker network prune -f

# 5. System cleanup
docker system prune -af

# 6. Verify clean
docker ps -a
docker images

# Both should be empty or only show used items

# 7. Start fresh
docker-compose -f docker-compose.full.yml up -d

# 8. Wait 30-60 seconds for services to start
sleep 30

# 9. Verify everything works
docker-compose ps
curl http://localhost:3000/
curl http://localhost:4000/api/health
```

---

## 📞 STILL STUCK?

### Get More Information
```bash
# Full system info
docker system info

# Docker version
docker version

# Compose version
docker-compose version

# Check .env file exists
ls -la .env

# Check docker-compose file
ls -la docker-compose*.yml

# Check disk space
df -h                    # Linux/Mac
Get-Volume              # Windows
```

### Check Documentation
- See [PORT_MAPPING.md](./PORT_MAPPING.md) for port reference
- See [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md) for more commands
- See [QUICK_START.md](./QUICK_START.md) for setup steps

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Ready to help
