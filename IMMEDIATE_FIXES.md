# 🚀 RUN THESE COMMANDS NOW - Quick Fixes

## ⚡ Immediate Actions to Fix Current Issues

---

## 1️⃣ STOP EVERYTHING & CLEAN UP (2 minutes)

```powershell
# Windows PowerShell - RUN AS ADMIN
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# Stop all services
docker-compose down -v

# Remove all volumes (WARNING: DATA LOSS!)
docker volume prune -af

# Verify everything stopped
docker ps
# Should show nothing running
```

---

## 2️⃣ START FRESH WITH CORRECT PORTS (3 minutes)

```powershell
# Windows PowerShell
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# Start the corrected stack
docker-compose -f docker-compose.full.yml up -d

# Wait for services to start
Start-Sleep -Seconds 30

# Verify all containers are running
docker-compose ps

# Should show all services as "Up"
```

---

## 3️⃣ VERIFY PORTS ARE CORRECT (2 minutes)

```powershell
# Windows PowerShell

# Check specific ports
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select LocalPort
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | Select LocalPort
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select LocalPort

# All three should show different ports
# Port 3000: Backend API ✅
# Port 4000: Grafana (NOT 3000!) ✅
# Port 5173: Frontend ✅
```

---

## 4️⃣ TEST EACH SERVICE (3 minutes)

```powershell
# Windows PowerShell

# Test Backend API (port 3000)
curl http://localhost:3000/
# Expected: "Server is Live!"

# Test Frontend (port 5173)
curl http://localhost:5173/
# Expected: HTML response

# Test Grafana (port 4000 - NOT 3000!)
curl http://localhost:4000/api/health
# Expected: JSON response

# Test Prometheus (port 9090)
curl http://localhost:9090/-/healthy
# Expected: "Prometheus Server is Healthy"

# Test SonarQube (port 9000)
curl http://localhost:9000/api/system/health
# Expected: JSON response
```

---

## 5️⃣ SYNC SYSTEM TIME (Fix Prometheus Warning)

```powershell
# Windows PowerShell - RUN AS ADMIN

# Check current time
Get-Date

# Sync with NTP server
w32tm /resync /force

# Verify time is correct
Get-Date

# Restart Prometheus to pick up new time
docker-compose restart prometheus

# Wait 10 seconds
Start-Sleep -Seconds 10

# Check Prometheus is healthy
curl http://localhost:9090/-/healthy
# Should NOT have time warning anymore
```

---

## 6️⃣ ACCESS THE SERVICES (Use These URLs!)

```
⭐ CORRECT URLS ⭐

Frontend:     http://localhost:5173
Backend:      http://localhost:3000
Grafana:      http://localhost:4000        (NOT 3000!)
Prometheus:   http://localhost:9090
SonarQube:    http://localhost:9000
Jenkins:      http://localhost:8080
Loki:         http://localhost:3100
AlertManager: http://localhost:9093

✅ Grafana Credentials:
   Username: admin
   Password: admin123
```

---

## 7️⃣ MONITOR BACKEND LOGS (Fix 502 Error)

```powershell
# Windows PowerShell

# Watch backend logs in real-time
docker-compose logs -f server

# Look for:
# ✅ "Server is running on port 3000"
# ✅ "Connected to database"
# ❌ Any errors?

# In separate terminal, test endpoint
curl http://localhost:3000/

# Should respond with: "Server is Live!"
```

---

## 8️⃣ VERIFY FRONTEND CAN REACH BACKEND

```powershell
# Windows PowerShell

# From within frontend container, test backend connection
docker-compose exec client curl http://server:3000/

# Expected: "Server is Live!"

# OR from host machine
curl http://localhost:3000/

# If you get 502 in frontend, backend is not healthy
# Check: docker-compose logs server
```

---

## 9️⃣ CHECK GRAFANA DASHBOARDS

```powershell
# Windows PowerShell

# Verify Grafana is running
docker-compose ps | Select-String grafana

# Should show: quickai-grafana ... Up

# Access Grafana
# 1. Open browser: http://localhost:4000
# 2. Login: admin / admin123
# 3. Dashboards → Look for "QuickAi Overview" or "Kubernetes Cluster Overview"
# 4. View metrics (CPU, Memory, Requests, etc.)

# If no data, check Prometheus
# http://localhost:9090
# Click "Targets" - should all show "UP"
```

---

## 🔟 FULL HEALTH CHECK SCRIPT

```powershell
# Windows PowerShell - Run all checks

Write-Host "=== QuickAi DevOps Health Check ===" -ForegroundColor Green

# 1. Check containers
Write-Host "`n1. Container Status:"
docker-compose ps

# 2. Check ports
Write-Host "`n2. Port Status:"
$ports = @(3000, 4000, 5173, 8080, 9000, 9090, 9093, 3100)
foreach ($port in $ports) {
    $result = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($result) {
        Write-Host "  Port $port: ✅ IN USE" -ForegroundColor Green
    } else {
        Write-Host "  Port $port: ⚠️  AVAILABLE" -ForegroundColor Yellow
    }
}

# 3. Test services
Write-Host "`n3. Service Health:"

# Backend
try {
    $resp = curl http://localhost:3000/ -TimeoutSec 5
    Write-Host "  Backend (3000): ✅ OK" -ForegroundColor Green
} catch {
    Write-Host "  Backend (3000): ❌ FAILED" -ForegroundColor Red
}

# Frontend
try {
    $resp = curl http://localhost:5173/ -TimeoutSec 5
    Write-Host "  Frontend (5173): ✅ OK" -ForegroundColor Green
} catch {
    Write-Host "  Frontend (5173): ❌ FAILED" -ForegroundColor Red
}

# Grafana
try {
    $resp = curl http://localhost:4000/api/health -TimeoutSec 5
    Write-Host "  Grafana (4000): ✅ OK" -ForegroundColor Green
} catch {
    Write-Host "  Grafana (4000): ❌ FAILED" -ForegroundColor Red
}

# Prometheus
try {
    $resp = curl http://localhost:9090/-/healthy -TimeoutSec 5
    Write-Host "  Prometheus (9090): ✅ OK" -ForegroundColor Green
} catch {
    Write-Host "  Prometheus (9090): ❌ FAILED" -ForegroundColor Red
}

# SonarQube
try {
    $resp = curl http://localhost:9000/api/system/health -TimeoutSec 5
    Write-Host "  SonarQube (9000): ✅ OK" -ForegroundColor Green
} catch {
    Write-Host "  SonarQube (9000): ❌ FAILED" -ForegroundColor Red
}

Write-Host "`n=== Health Check Complete ===" -ForegroundColor Green
```

---

## 🎯 TROUBLESHOOTING QUICK FIXES

### Issue: Still Getting 502 Error
```powershell
# Check if backend is actually running
docker-compose ps | Select-String server

# If not running, start it
docker-compose up -d server

# Check logs
docker-compose logs server

# Restart if needed
docker-compose restart server
```

### Issue: Grafana Still on Port 3000
```powershell
# Verify docker-compose.full.yml has correct ports
# Should show: "4000:3000" for grafana

# If wrong, you're using old file!
# Use correct file:
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up -d

# Verify
docker-compose ps | Select-String grafana
# Should show: 4000->3000/tcp
```

### Issue: Prometheus Time Warning
```powershell
# System time is out of sync
# Fix:
w32tm /resync /force

# Restart Prometheus
docker-compose restart prometheus

# Wait 10 seconds
Start-Sleep -Seconds 10

# Test
curl http://localhost:9090/-/healthy
```

---

## 📋 REFERENCE: New Port Mapping

```
SERVICE              HOST PORT → CONTAINER PORT   STATUS
═══════════════════════════════════════════════════════════
Backend API          3000 → 3000                 ✅ UNCHANGED
Frontend             5173 → 80                   ✅ UNCHANGED
Grafana              4000 → 3000                 ✅ CHANGED (was 3000!)
Prometheus           9090 → 9090                 ✅ UNCHANGED
PostgreSQL           5432 → 5432                 ✅ UNCHANGED
SonarQube            9000 → 9000                 ✅ UNCHANGED
Jenkins              8080 → 8080                 ✅ UNCHANGED
Loki                 3100 → 3100                 ✅ UNCHANGED
AlertManager         9093 → 9093                 ✅ UNCHANGED
```

---

## ✅ FINAL VERIFICATION

After running all commands, you should see:

```
✅ All containers running (docker-compose ps)
✅ All ports accessible (Get-NetTCPConnection)
✅ Backend responds (curl localhost:3000)
✅ Frontend loads (http://localhost:5173)
✅ Grafana accessible (http://localhost:4000)
✅ No 502 errors
✅ Prometheus time synced
✅ All metrics showing in Grafana
```

---

## 🆘 If Still Having Issues

1. **Check [PORT_MAPPING.md](./PORT_MAPPING.md)** - Verify all ports
2. **Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Detailed fixes
3. **Check [RESET_AND_CLEANUP.md](./RESET_AND_CLEANUP.md)** - Nuclear option
4. **View logs**: `docker-compose logs -f <service>`

---

## ⏱️ Total Time Required

- Cleanup & Reset: 5 minutes
- Start Fresh: 5 minutes
- Verify All: 5 minutes
- **Total: ~15 minutes**

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Ready to execute
