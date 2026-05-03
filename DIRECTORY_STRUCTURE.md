# 📂 Directory Structure & Organization Guide

## 📊 Complete Project Tree

```
QuickAi/
│
├── 📁 client/                              # React Frontend Application
│   ├── src/                                # Source code
│   │   ├── components/                     # React components
│   │   ├── pages/                          # Page components
│   │   ├── assets/                         # Images, fonts
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                             # Static files
│   ├── Dockerfile                          # Container build
│   ├── nginx.conf                          # Web server config
│   ├── package.json                        # Dependencies
│   ├── vite.config.js                      # Build config
│   └── vercel.json                         # Deployment config
│
├── 📁 server/                              # Express Backend API
│   ├── controllers/                        # API logic
│   │   ├── aicontroller.js
│   │   └── userController.js
│   ├── routes/                             # API routes
│   │   ├── airoutes.js
│   │   └── userRoutes.js
│   ├── configs/                            # Configuration
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── multer.js
│   ├── middlewares/                        # Express middleware
│   │   └── auth.js
│   ├── Dockerfile                          # Container build
│   ├── server.js                           # Entry point
│   ├── env.js                              # Environment loader
│   ├── package.json                        # Dependencies
│   └── vercel.json                         # Deployment config
│
├── 📁 k8s/                                 # ⭐ Kubernetes Manifests
│   ├── namespace.yml                       # Kubernetes namespace
│   ├── configmap.yml                       # App configuration
│   ├── secret-template.yml                 # Secrets template
│   ├── server-deployment.yml               # Backend deployment
│   ├── client-deployment.yml               # Frontend deployment
│   └── ingress.yml                         # HTTP routing
│
├── 📁 ansible/                             # ⭐ Infrastructure Automation
│   ├── inventory.ini                       # Server inventory
│   └── playbooks/                          # Playbooks
│       ├── provision-servers.yml           # Server setup
│       └── deploy-monitoring.yml           # Monitoring stack
│
├── 📁 monitoring/                          # ⭐ Monitoring Stack Config
│   ├── prometheus-config.yml               # Metrics collection
│   ├── prometheus-rules.yml                # Alert rules
│   ├── grafana-dashboards.yml              # Dashboards
│   ├── loki-config.yml                     # Log aggregation
│   ├── promtail-config.yml                 # Log forwarder
│   └── alertmanager-config.yml             # Alert routing
│
├── 📁 logs/                                # Application Logs
│   ├── server/                             # Backend logs
│   └── (auto-generated on startup)
│
├── 📁 volumes/                             # Docker Volumes (Data)
│   ├── postgres/                           # Database data
│   ├── prometheus/                         # Metrics storage
│   ├── grafana/                            # Dashboard config
│   └── loki/                               # Logs storage
│
├── 🐳 Docker Compose Files
│   ├── docker-compose.yml                  # Basic setup
│   └── docker-compose.full.yml             # Complete stack (USE THIS!)
│
├── 🔄 CI/CD Configuration
│   ├── Jenkinsfile                         # Current pipeline
│   ├── Jenkinsfile.updated                 # ⭐ NEW enhanced pipeline
│   └── sonar-project.properties            # Code quality config
│
├── ⚙️ Environment & Setup
│   ├── .env.example                        # ⭐ Environment template
│   ├── setup.sh                            # Linux/Mac setup script
│   └── setup.ps1                           # Windows setup script
│
├── 📚 Documentation (MAIN REFERENCE)
│   ├── START_HERE.md                       # ⭐ BEGIN HERE! Quick overview
│   ├── README_DEVOPS.md                    # Main DevOps documentation
│   ├── QUICK_START.md                      # Step-by-step setup guide
│   ├── DEVOPS_COMMANDS.md                  # Command reference
│   ├── DEVOPS_REPORT.md                    # Audit findings
│   ├── DEVOPS_INDEX.md                     # File navigation
│   ├── PORT_MAPPING.md                     # ⭐ Port reference (IMPORTANT!)
│   ├── TROUBLESHOOTING.md                  # ⭐ Problem solving guide
│   ├── RESET_AND_CLEANUP.md                # ⭐ How to clean up
│   ├── DIRECTORY_STRUCTURE.md              # ⭐ This file
│   └── README.md                           # Original project README
│
└── 📄 Other Files
    ├── Jenkinsfile                         # Original Jenkins config
    ├── sonar-project.properties            # SonarQube config
    └── (git files: .gitignore, etc.)
```

---

## 🎯 Quick File Lookup

### "I need to..."

#### Start the Application
→ [START_HERE.md](./START_HERE.md)

#### Debug Port Issues
→ [PORT_MAPPING.md](./PORT_MAPPING.md)

#### Fix an Error
→ [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

#### Clean Up Everything
→ [RESET_AND_CLEANUP.md](./RESET_AND_CLEANUP.md)

#### Find a Command
→ [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)

#### Understand Architecture
→ [README_DEVOPS.md](./README_DEVOPS.md)

#### Security Check
→ [DEVOPS_REPORT.md](./DEVOPS_REPORT.md)

#### Run Commands
→ [QUICK_START.md](./QUICK_START.md)

---

## 📋 Service Organization

### Application Services
```
server/          → Backend API (Express)
  ├── routes/   → API endpoints
  ├── controllers/ → Business logic
  └── configs/  → Configuration

client/         → Frontend (React)
  ├── src/      → React code
  └── components/ → UI components
```

### Infrastructure (K8s)
```
k8s/            → Kubernetes manifests
  ├── namespace.yml        → Project namespace
  ├── configmap.yml        → Configuration
  ├── server-deployment.yml → Backend pods
  └── client-deployment.yml → Frontend pods
```

### Automation (Ansible)
```
ansible/        → Infrastructure as Code
  ├── inventory.ini → Server list
  └── playbooks/  → Installation scripts
    ├── provision-servers.yml
    └── deploy-monitoring.yml
```

### Monitoring Stack
```
monitoring/     → Observability
  ├── prometheus-config.yml  → Metrics collection
  ├── grafana-dashboards.yml → Visualizations
  ├── loki-config.yml        → Log aggregation
  └── alertmanager-config.yml → Alerts
```

---

## 🔐 Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `.env.example` | Environment template | ✅ Copy & customize |
| `.env` | Actual secrets | ⚠️ Never commit |
| `docker-compose.yml` | Basic setup | ⚠️ Reference only |
| `docker-compose.full.yml` | Full stack | ✅ Default to use |
| `sonar-project.properties` | Code quality | ⚠️ Token in .env |
| `Jenkinsfile` | Old pipeline | ⚠️ Reference |
| `Jenkinsfile.updated` | New pipeline | ✅ Use this |

---

## 📁 Volume Structure (Persistent Data)

```
volumes/
├── postgres/         → Database storage
├── prometheus/       → Metrics time-series
├── grafana/          → Dashboard configs
└── loki/             → Log storage

All automatically created by docker-compose
```

---

## 🔄 Recommended Workflow

### Day 1: Setup
1. Read [START_HERE.md](./START_HERE.md)
2. Copy `.env.example` → `.env`
3. Run `docker-compose -f docker-compose.full.yml up -d`
4. Access services (see [PORT_MAPPING.md](./PORT_MAPPING.md))

### Day 2-7: Development
1. Use [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md) for common tasks
2. Monitor with [Grafana](http://localhost:4000)
3. Track code quality with SonarQube

### Week 2+: Production
1. Study [README_DEVOPS.md](./README_DEVOPS.md)
2. Review [DEVOPS_REPORT.md](./DEVOPS_REPORT.md) security
3. Deploy with Kubernetes using `k8s/` manifests
4. Setup Ansible automation with `ansible/` playbooks

---

## 🚨 Critical Files (Don't Delete!)

- ❌ `docker-compose.full.yml` - Main config
- ❌ `k8s/*.yml` - Kubernetes manifests
- ❌ `monitoring/prometheus-config.yml` - Scrape config
- ❌ `.env` - Secrets (keep safe!)
- ❌ `server/Dockerfile` - Backend image
- ❌ `client/Dockerfile` - Frontend image

---

## 📝 Important Files for Each Task

### To Fix Port Issues
- [PORT_MAPPING.md](./PORT_MAPPING.md)
- `docker-compose.full.yml` (ports: section)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### To Debug Errors
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- `docker-compose logs` (commands)
- [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)

### To Reset Everything
- [RESET_AND_CLEANUP.md](./RESET_AND_CLEANUP.md)
- `docker-compose down`
- `docker volume prune`

### To Deploy to Production
- `k8s/*.yml` (manifests)
- `ansible/inventory.ini` (servers)
- `ansible/playbooks/*.yml` (automation)
- [QUICK_START.md](./QUICK_START.md) (K8s section)

### To Monitor Application
- `monitoring/prometheus-config.yml` (what to scrape)
- `monitoring/grafana-dashboards.yml` (dashboards)
- [Grafana UI](http://localhost:4000)

---

## 🎯 File Size Reference

```
Small Files (< 10KB):
- *.yml configuration files
- .env.example
- Dockerfiles

Medium Files (10-100KB):
- DEVOPS_COMMANDS.md
- TROUBLESHOOTING.md
- setup.sh, setup.ps1

Large Files (100KB+):
- docker-compose.full.yml (with all services)
- Monitoring stack configs

Not Applicable:
- server/ → Variable (depends on code)
- client/ → Variable (depends on code)
- volumes/ → Variable (depends on data)
```

---

## ✅ Verification Checklist

### Project Structure Valid?
- [ ] `client/` directory exists
- [ ] `server/` directory exists
- [ ] `k8s/` directory exists
- [ ] `ansible/` directory exists
- [ ] `monitoring/` directory exists
- [ ] `docker-compose.full.yml` exists
- [ ] `Jenkinsfile.updated` exists
- [ ] Documentation files exist

### Files Properly Configured?
- [ ] `.env` created from `.env.example`
- [ ] `docker-compose.full.yml` uses correct ports
- [ ] `k8s/secret-template.yml` has placeholders
- [ ] `ansible/inventory.ini` has server IPs
- [ ] `monitoring/prometheus-config.yml` configured

### Services Working?
- [ ] Backend on port 3000 ✅
- [ ] Frontend on port 5173 ✅
- [ ] Grafana on port 4000 ✅ (not 3000!)
- [ ] Prometheus on port 9090 ✅
- [ ] All others accessible ✅

---

## 🔗 File Dependencies

```
docker-compose.full.yml
    ├── .env (from .env.example)
    ├── server/Dockerfile
    ├── client/Dockerfile
    ├── monitoring/*.yml (all config files)
    └── postgres volume

Jenkinsfile.updated
    ├── Dockerfile (both)
    ├── sonar-project.properties
    ├── k8s/*.yml (deployment manifests)
    └── .env (environment)

k8s/ manifests
    ├── k8s/secret-template.yml (from .env)
    ├── k8s/configmap.yml
    └── All *.yml files

ansible/ playbooks
    ├── ansible/inventory.ini (server list)
    └── ansible/playbooks/*.yml
```

---

## 🧹 Clean Directory Guidelines

### ✅ Keep
- `.env` (with real credentials)
- `docker-compose.full.yml` (main config)
- `k8s/`, `monitoring/`, `ansible/` (infrastructure)
- All `*.md` files (documentation)
- `client/`, `server/` (application code)

### ❌ Remove
- Backup files (`*.bak`, `*.old`)
- Temporary logs (keep clean via `.gitignore`)
- Unused Docker images (run `docker image prune`)
- Old volume backups
- Development notes in source

### 🔄 Auto-Generated (OK to Delete)
- `volumes/` → recreated on startup
- `logs/` → recreated on startup
- Docker containers → easily recreated
- Database data → backed up elsewhere

---

## 📊 Directory Size Analysis

Typical sizes:
```
client/           ~50MB (with node_modules)
server/           ~100MB (with node_modules)
k8s/              ~50KB
ansible/          ~30KB
monitoring/       ~100KB
Documentation     ~500KB
Total w/ volumes: 2-5GB (depends on data)
```

---

## 🎓 Learning Path by Directory

### Start with:
1. Read `START_HERE.md`
2. Check `docker-compose.full.yml` structure
3. Review `PORT_MAPPING.md`

### Then explore:
1. `client/` → React frontend
2. `server/` → Express API
3. `k8s/` → Kubernetes
4. `ansible/` → Automation

### Finally understand:
1. `monitoring/` → Observability
2. Jenkins pipeline → CI/CD
3. SonarQube → Quality

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Complete & Organized
