# 🔌 Port Mapping Reference

## ⭐ COMPLETE PORT ALLOCATION

```
LOCAL PORT  → INTERNAL → SERVICE NAME          STATUS
========================================================
3000        → 3000     → Express Backend API    ✅ ACTIVE
5173        → 80       → React Frontend (dev)   ✅ ACTIVE
5432        → 5432     → PostgreSQL Database    ✅ ACTIVE
8080        → 8080     → Jenkins CI/CD          ✅ ACTIVE
9000        → 9000     → SonarQube              ✅ ACTIVE
9090        → 9090     → Prometheus Metrics     ✅ ACTIVE
9093        → 9093     → AlertManager           ✅ ACTIVE
3100        → 3100     → Loki Logs              ✅ ACTIVE
4000        → 3000     → Grafana Dashboards     ✅ ACTIVE (CHANGED)
50000       → 50000    → Jenkins Agent Port    ✅ ACTIVE
```

---

## 🎯 SERVICE QUICK ACCESS

### Application
- **Frontend (React)**: http://localhost:5173
- **Backend API (Express)**: http://localhost:3000

### Monitoring & Observability
- **Grafana** (Dashboards): http://localhost:4000 
  - User: `admin`
  - Pass: `admin123`
- **Prometheus** (Metrics): http://localhost:9090
- **Loki** (Logs): http://localhost:3100
- **AlertManager** (Alerts): http://localhost:9093

### CI/CD & Quality
- **Jenkins** (Pipeline): http://localhost:8080
- **SonarQube** (Code Quality): http://localhost:9000
  - User: `admin`
  - Pass: `admin`

### Data
- **PostgreSQL** (Database): localhost:5432
  - User: `quickai`
  - Pass: `quickai123` (or from .env)

---

## ✅ VERIFICATION CHECKLIST

After starting services, verify all ports are accessible:

```bash
# Test each service
curl http://localhost:3000/                    # Backend
curl http://localhost:5173/                    # Frontend
curl http://localhost:8080/                    # Jenkins
curl http://localhost:9000/api/system/health   # SonarQube
curl http://localhost:9090/-/healthy           # Prometheus
curl http://localhost:4000/api/health          # Grafana
psql -h localhost -U quickai -c "SELECT 1"     # PostgreSQL

# Or use docker-compose to check
docker-compose ps                              # View all services
```

---

## 🔧 COMMON ISSUES & PORTS

### Issue: "Port Already in Use"
```bash
# Find what's using the port
# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000

# Linux/Mac
lsof -i :3000

# Kill the process
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

### Issue: Connection Refused
- Check if service is running: `docker-compose ps`
- Restart service: `docker-compose restart <service>`
- Check logs: `docker-compose logs <service>`

### Issue: Frontend Can't Reach Backend
- Frontend should call: `http://localhost:3000` (if on same machine)
- Or: `http://server:3000` (if using Docker network)
- Check frontend code for hardcoded IP addresses

---

## 📋 DOCKER COMPOSE PORT MAPPING

### File: `docker-compose.full.yml`

```yaml
services:
  server:
    ports:
      - "3000:3000"           # Backend API

  client:
    ports:
      - "5173:80"             # Frontend (5173 external, 80 internal)

  postgres:
    ports:
      - "5432:5432"           # Database

  prometheus:
    ports:
      - "9090:9090"           # Metrics

  grafana:
    ports:
      - "4000:3000"           # ⭐ NOTE: 4000 external, 3000 internal!

  loki:
    ports:
      - "3100:3100"           # Logs

  alertmanager:
    ports:
      - "9093:9093"           # Alerts

  sonarqube:
    ports:
      - "9000:9000"           # Code Quality

  jenkins:
    ports:
      - "8080:8080"           # CI/CD
      - "50000:50000"         # Agent communication
```

---

## 🚀 NETWORK COMMUNICATION

### Within Docker Network (container-to-container)
```
Frontend → http://server:3000          # Access backend
Server   → postgresql://postgres:5432   # Access database
Prometheus → http://server:3000/metrics # Scrape metrics
```

### From Host Machine (browser/terminal)
```
Frontend → http://localhost:5173
Server   → http://localhost:3000
Grafana  → http://localhost:4000
```

---

## 🔄 HOW PORTS FLOW

```
User Browser
    ↓
    ├─→ :5173 (Frontend React)
    │   ├─→ Calls API at :3000/api/ai/*
    │   └─→ Or :3000/api/user/*
    │
    ├─→ :3000 (Backend Express)
    │   ├─→ Connects to postgres:5432
    │   └─→ Exposes metrics to prometheus:9090
    │
    ├─→ :9090 (Prometheus)
    │   └─→ Scrapes from :3000/metrics
    │
    ├─→ :4000 (Grafana)
    │   ├─→ Queries prometheus:9090
    │   └─→ Queries loki:3100
    │
    ├─→ :8080 (Jenkins)
    │   └─→ Builds and deploys via Docker socket
    │
    ├─→ :9000 (SonarQube)
    │   └─→ Analyzes code quality
    │
    └─→ :9093 (AlertManager)
        └─→ Sends alerts to Slack/Email
```

---

## 📝 FIREWALL/SECURITY RULES

If behind a firewall, allow these ports:

```bash
# Development (local machine)
- 3000   (Backend)
- 5173   (Frontend)
- 4000   (Grafana)
- 9090   (Prometheus)
- 8080   (Jenkins)

# Database (internal network only)
- 5432   (PostgreSQL - internal only)

# Code Quality
- 9000   (SonarQube)

# Optional
- 9093   (AlertManager)
- 3100   (Loki)
- 50000  (Jenkins Agent)
```

---

## ⚠️ KEY CHANGES FROM ORIGINAL

| Service | Original Port | NEW Port | Reason |
|---------|---------------|----------|--------|
| Grafana | 3000 | 4000 | ❌ Conflict with Backend API |
| Backend | 3000 | 3000 | ✅ No change |
| Frontend | 5173 | 5173 | ✅ No change |
| All others | - | - | ✅ No changes |

---

## 🎯 REMEMBER

✅ **Backend API**: Always on port **3000**  
✅ **Grafana**: Now on port **4000** (was 3000)  
✅ **Frontend**: Port **5173** (or 80 for production)  
✅ **All services**: See table above for complete mapping  

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ All ports verified and conflict-free
