# DevOps Documentation Index

## 📚 Quick Navigation

### Start Here
- **[README_DEVOPS.md](./README_DEVOPS.md)** - Main overview & architecture
- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup guide
- **[DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)** - Command reference
- **[DEVOPS_REPORT.md](./DEVOPS_REPORT.md)** - Current status & security findings

---

## 📋 Files Overview

### Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.example` | Environment variables template | ✅ Copy & edit |
| `docker-compose.yml` | Basic local setup | ⚠️ Reference only |
| `docker-compose.full.yml` | Full stack with monitoring | ✅ Use for complete setup |
| `sonar-project.properties` | SonarQube configuration | ⚠️ Update token to .env |

### Application Code

| File | Purpose |
|------|---------|
| `client/Dockerfile` | Frontend container image |
| `server/Dockerfile` | Backend container image |
| `server/server.js` | Express API server |
| `client/src/App.jsx` | React main component |

### Kubernetes Manifests (`k8s/`)

| File | Purpose |
|------|---------|
| `namespace.yml` | Create quickai namespace |
| `configmap.yml` | Application configuration |
| `secret-template.yml` | Sensitive data (fill with real values) |
| `server-deployment.yml` | Backend deployment & service |
| `client-deployment.yml` | Frontend deployment & service |
| `ingress.yml` | HTTP routing rules |

### Ansible Playbooks (`ansible/`)

| File | Purpose |
|------|---------|
| `inventory.ini` | Server inventory (edit with IPs) |
| `playbooks/provision-servers.yml` | Install Docker & Kubernetes |
| `playbooks/deploy-monitoring.yml` | Deploy monitoring stack |

### Monitoring Stack (`monitoring/`)

| File | Purpose |
|------|---------|
| `prometheus-config.yml` | Metrics collection rules |
| `prometheus-rules.yml` | Alert rules |
| `grafana-dashboards.yml` | Grafana dashboard definitions |
| `loki-config.yml` | Log aggregation config |
| `promtail-config.yml` | Log forwarder config |
| `alertmanager-config.yml` | Alert routing & notifications |

### CI/CD Pipeline

| File | Purpose |
|------|---------|
| `Jenkinsfile` | Current pipeline (basic) |
| `Jenkinsfile.updated` | ✅ NEW - Enhanced pipeline with K8s |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Original project README |
| `README_DEVOPS.md` | 📍 **Main DevOps README** |
| `QUICK_START.md` | Setup instructions |
| `DEVOPS_COMMANDS.md` | Command reference |
| `DEVOPS_REPORT.md` | Audit findings |
| `DEVOPS_INDEX.md` | 📍 **This file** |

### Setup Scripts

| File | Purpose | OS |
|------|---------|-----|
| `setup.sh` | Interactive setup (Bash) | Linux/Mac/WSL |
| `setup.ps1` | Interactive setup (PowerShell) | Windows |

---

## 🚀 Quick Start Path

### Path 1: Local Development (30 mins)
```
1. README_DEVOPS.md    → Understand architecture
2. .env.example        → Setup environment
3. docker-compose.yml  → Start basic services
4. DEVOPS_COMMANDS.md  → Common commands
```

### Path 2: Full Local Stack (45 mins)
```
1. README_DEVOPS.md              → Understand architecture
2. .env.example                  → Setup environment
3. docker-compose.full.yml       → Start ALL services
4. monitoring/prometheus-config.yml → Review metrics
5. DEVOPS_COMMANDS.md            → Useful commands
6. README_DEVOPS.md              → Monitor via Grafana
```

### Path 3: Production Deployment (2-3 hours)
```
1. DEVOPS_REPORT.md              → Review findings
2. ansible/inventory.ini         → Configure servers
3. ansible/playbooks/*.yml       → Provision infrastructure
4. k8s/*.yml                     → Deploy to Kubernetes
5. Jenkinsfile.updated          → Setup CI/CD
6. monitoring/*                  → Configure monitoring
7. README_DEVOPS.md             → Post-deployment checks
```

### Path 4: CI/CD Pipeline Setup (1 hour)
```
1. Jenkinsfile.updated          → Review pipeline
2. QUICK_START.md               → Jenkins section
3. sonar-project.properties     → Update SonarQube config
4. DEVOPS_COMMANDS.md           → Jenkins commands
5. README_DEVOPS.md             → Verify deployment
```

---

## 🔧 Key Configurations

### Environment Setup
**File**: `.env.example` → `.env`

Must configure:
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`
- `CLOUDINARY_*` credentials
- `DATABASE_URL`
- `VITE_CLERK_PUBLISHABLE_KEY`

### Database Setup
**File**: `k8s/secret-template.yml`

Must provide:
- PostgreSQL credentials
- Database URL
- Connection strings

### Kubernetes Setup
**Files**: `k8s/*.yml`

Steps:
1. Update image registry in deployments
2. Fill secrets with real values
3. Configure ingress domains
4. Apply manifests: `kubectl apply -f k8s/`

### Monitoring Setup
**Files**: `monitoring/*.yml`

Configure:
- Prometheus scrape targets
- Grafana data sources
- Alert notifications (Slack/Email)
- Log aggregation

---

## 📊 Service Status

| Service | Status | Config | Health |
|---------|--------|--------|--------|
| Docker | ✅ Working | `Dockerfile` | Port 2375 |
| Docker Compose | ✅ Working | `docker-compose.yml` | Orchestration |
| PostgreSQL | ✅ Ready | `.env` | Port 5432 |
| Express Server | ✅ Working | `server/server.js` | Port 3000 |
| React Client | ✅ Working | `client/Dockerfile` | Port 5173/80 |
| **NEW: Kubernetes** | ✅ Ready | `k8s/*.yml` | Cluster ready |
| **NEW: Ansible** | ✅ Ready | `ansible/` | Provision ready |
| **NEW: Prometheus** | ✅ Ready | `monitoring/prometheus-config.yml` | Port 9090 |
| **NEW: Grafana** | ✅ Ready | `monitoring/grafana-dashboards.yml` | Port 3000 |
| **NEW: Loki** | ✅ Ready | `monitoring/loki-config.yml` | Port 3100 |
| Jenkins | ✅ Ready | `Jenkinsfile.updated` | Port 8080 |
| SonarQube | ✅ Working | `sonar-project.properties` | Port 9000 |

---

## 🔍 API Endpoints

### Server Routes (`server.js`)
```
GET  /                           # Health check
POST /api/ai/generate-article
POST /api/ai/generate-blog-title
POST /api/ai/generate-image
POST /api/ai/remove-image-background
POST /api/ai/remove-image-object
POST /api/ai/resume-review
GET  /api/user/get-user-creations
GET  /api/user/get-published-creations
POST /api/user/toggle-like-creation
```

### Service Ports
```
Frontend:     5173 (dev) or 80 (prod)
Backend:      3000
SonarQube:    9000
Jenkins:      8080
Prometheus:   9090
Grafana:      3000
Loki:         3100
AlertManager: 9093
PostgreSQL:   5432
```

---

## ⚠️ Security Findings

### Critical
- ❌ SonarQube token exposed in source
- ❌ Port mismatch in Dockerfile (4000 vs 3000)
- ❌ Hardcoded credentials

### Medium
- ⚠️ No HTTPS in local setup
- ⚠️ Default credentials for Grafana

### Low
- ℹ️ Network segmentation could be improved

**See**: [DEVOPS_REPORT.md](./DEVOPS_REPORT.md#3-security-findings-⚠️)

---

## 🛠️ How to Use Each File

### Development
```bash
# Daily development
docker-compose up -d          # Start stack
docker-compose logs -f server # View logs
docker-compose restart        # Restart on changes
```

### Testing
```bash
# Code quality
sonar-scanner --version
npm run build                 # Build check
npm run lint                  # Linting
```

### Monitoring
```bash
# Check metrics
curl http://localhost:9090/api/v1/query?query=up

# View logs
kubectl logs -f deployment/quickai-server -n quickai
```

### Deployment
```bash
# Infrastructure
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini

# Container orchestration
kubectl apply -f k8s/

# CI/CD
# Commit & push → Jenkins auto-builds & deploys
```

---

## 🎓 Learning Resources

### Docker
- `docker-compose.yml` - Learn Docker Compose syntax
- `server/Dockerfile` - Learn multi-stage builds
- `client/Dockerfile` - Learn build optimization

### Kubernetes
- `k8s/namespace.yml` - Namespace management
- `k8s/server-deployment.yml` - Deployment patterns
- `k8s/ingress.yml` - Routing configuration

### Ansible
- `ansible/inventory.ini` - Inventory structure
- `ansible/playbooks/provision-servers.yml` - Playbook structure
- `ansible/playbooks/deploy-monitoring.yml` - Package deployment

### Monitoring
- `monitoring/prometheus-config.yml` - Scrape configs
- `monitoring/prometheus-rules.yml` - Alert rules
- `monitoring/grafana-dashboards.yml` - Dashboard JSON

### CI/CD
- `Jenkinsfile` - Pipeline basics
- `Jenkinsfile.updated` - Advanced pipeline with K8s
- `sonar-project.properties` - Static analysis config

---

## 🔗 File Dependencies

```
docker-compose.full.yml
    ├── .env.example (.env)
    ├── server/Dockerfile
    ├── client/Dockerfile
    ├── monitoring/prometheus-config.yml
    ├── monitoring/grafana-dashboards.yml
    ├── monitoring/loki-config.yml
    └── monitoring/alertmanager-config.yml

Jenkinsfile.updated
    ├── server/Dockerfile
    ├── client/Dockerfile
    ├── k8s/*.yml
    ├── sonar-project.properties
    └── .env (.env.example)

k8s/*.yml
    ├── k8s/secret-template.yml (.env)
    ├── k8s/configmap.yml
    └── k8s/*.yml (all manifests)

ansible/playbooks/*.yml
    └── ansible/inventory.ini
```

---

## ✅ Verification Checklist

### Local Development Ready
- [ ] `.env` file created with credentials
- [ ] `docker-compose ps` shows all containers running
- [ ] Can access http://localhost:3000 (backend)
- [ ] Can access http://localhost:5173 (frontend)

### Full Stack Ready
- [ ] All containers from above are running
- [ ] Can access http://localhost:9090 (Prometheus)
- [ ] Can access http://localhost:3000 (Grafana)
- [ ] Can access http://localhost:3100 (Loki)

### K8s Deployment Ready
- [ ] Cluster running (`kubectl cluster-info`)
- [ ] Namespace created (`kubectl get ns quickai`)
- [ ] Pods running (`kubectl get pods -n quickai`)
- [ ] Services created (`kubectl get svc -n quickai`)

### Monitoring Ready
- [ ] Prometheus targets healthy (`:9090/targets`)
- [ ] Grafana dashboards visible
- [ ] Loki showing logs
- [ ] Alerts configured and firing

---

## 📞 Troubleshooting

### File Issues
| Error | Fix | File |
|-------|-----|------|
| Port already in use | Change port in docker-compose | `docker-compose.yml` |
| Image not found | Build locally: `docker build` | `Dockerfile` |
| K8s error | Check YAML syntax | `k8s/*.yml` |

### Configuration Issues
| Error | Fix | File |
|-------|-----|------|
| DB connection error | Update DATABASE_URL | `.env` |
| API key invalid | Update OPENAI_API_KEY | `.env` |
| No metrics | Check prometheus-config.yml | `monitoring/prometheus-config.yml` |

See [DEVOPS_COMMANDS.md#troubleshooting](./DEVOPS_COMMANDS.md#-troubleshooting) for detailed fixes.

---

## 🎯 Next Steps

1. **Choose your path** (local dev / full stack / production)
2. **Follow QUICK_START.md** for detailed steps
3. **Reference DEVOPS_COMMANDS.md** for commands
4. **Check DEVOPS_REPORT.md** for current status
5. **Monitor via Grafana** dashboard
6. **Setup CI/CD** with Jenkinsfile.updated

---

## 📈 File Modification Guide

### Safe to Edit
- ✅ `.env.example` (copy to `.env`)
- ✅ `ansible/inventory.ini`
- ✅ `monitoring/prometheus-config.yml`
- ✅ `k8s/secret-template.yml`

### Review First
- ⚠️ `Jenkinsfile.updated`
- ⚠️ `docker-compose.full.yml`
- ⚠️ `k8s/*.yml`

### Don't Edit
- ❌ `Dockerfiles` (already optimized)
- ❌ `sonar-project.properties` (move token to .env)
- ❌ Application code (handles via git)

---

## 📝 Documentation Format

All markdown files follow this structure:
```
# Title
## Quick Summary
## Detailed Content
### Code Examples
### Troubleshooting
## References
```

---

**Total Files Created**: 20+  
**Total Configuration Lines**: 1500+  
**Monitoring Metrics**: 50+  
**Alert Rules**: 10+  
**Documentation Pages**: 5  

**Version**: 1.0  
**Last Updated**: May 2, 2026
