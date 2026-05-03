# QuickAi - Complete DevOps Setup 🚀

## 📋 Overview

This repository contains a complete DevOps infrastructure for the QuickAi application with integrated tools for development, testing, monitoring, and deployment.

**Current Architecture:**
- ✅ Docker & Docker Compose
- ✅ Jenkins CI/CD
- ✅ SonarQube Code Quality
- ✅ NEW: Kubernetes (K8s)
- ✅ NEW: Ansible Provisioning
- ✅ NEW: Prometheus (Monitoring)
- ✅ NEW: Grafana (Visualization)
- ✅ NEW: Loki (Log Aggregation)

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     COMPLETE DEVOPS ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────┘

                            ┌──────────────┐
                            │  Developer   │ (git push)
                            └──────┬───────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │   GitHub / GitLab / Gitea   │
                    │   (Source Control)          │
                    └──────────────┬──────────────┘
                                   │ (webhook)
                    ┌──────────────▼──────────────┐
                    │  🔄 Jenkins CI/CD Pipeline   │ :8080
                    ├──────────────────────────────┤
                    │ 1. Code Checkout            │
                    │ 2. SonarQube Analysis       │
                    │ 3. Build Docker Images      │
                    │ 4. Push to Registry         │
                    │ 5. Deploy to K8s            │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 📊 SonarQube Code Quality   │ :9000
                    │ (SAST - Static Analysis)    │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
   ┌─────────────┐      ┌──────────────────┐     ┌──────────────┐
   │ 📦 Registry │      │  🐳 Docker Build │     │  K8s Cluster │
   │(DockerHub/  │      │    - Server      │     │  - Master    │
   │Private Reg) │      │    - Client      │     │  - Workers   │
   └─────────────┘      └──────────────────┘     └──────┬───────┘
                                                        │
        ┌───────────────────────────────────────────────┼──────────────┐
        │                                               │              │
        ▼                                               ▼              ▼
┌──────────────┐  ┌─────────────────────┐  ┌──────────────────────────┐
│ 🐳 Services  │  │ 💾 Persistent Data  │  │ ⚙️  Ansible Provisioning│
│ - Server     │  │ - PostgreSQL        │  │ - Infrastructure Setup   │
│ - Client     │  │ - Volumes           │  │ - Security Config        │
│ - Ingress    │  │ - Backups           │  │ - K8s Setup              │
└──────────────┘  └─────────────────────┘  └──────────────────────────┘
        │                    │
        └────────┬───────────┘
                 │
        ┌────────▼─────────┐
        │  🔍 MONITORING   │
        └────────┬─────────┘
                 │
        ┌────────┴──────────────────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐              ┌──────────────────────┐
│ 📈 Prometheus    │ :9090        │ 📊 Grafana           │ :3000
│ - Metrics        │              │ - Dashboards         │
│ - Scraping       │              │ - Alerts             │
│ - Query Engine   │              │ - Visualization      │
└──────────┬───────┘              └──────────────────────┘
           │                               │
           └───────────────┬───────────────┘
                          │
           ┌──────────────▼────────────────┐
           │ 📝 Loki + Promtail           │ :3100
           │ - Log Aggregation            │
           │ - Index & Query              │
           │ - Multi-tenancy              │
           └──────────────┬────────────────┘
                          │
           ┌──────────────▼────────────────┐
           │ 🚨 AlertManager              │ :9093
           │ - Alert Routing              │
           │ - Notifications (Slack/Email)│
           │ - Silence Management         │
           └──────────────────────────────┘
```

---

## 🗂️ Project Structure

```
QuickAi/
├── client/                        # React Frontend
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── server/                        # Express Backend
│   ├── controllers/
│   ├── routes/
│   ├── configs/
│   ├── Dockerfile
│   └── server.js
├── k8s/                          # Kubernetes Manifests
│   ├── namespace.yml
│   ├── configmap.yml
│   ├── secret-template.yml
│   ├── server-deployment.yml
│   ├── client-deployment.yml
│   ├── ingress.yml
│   └── hpa.yml (auto-scaling)
├── ansible/                       # Ansible Playbooks
│   ├── inventory.ini
│   └── playbooks/
│       ├── provision-servers.yml
│       └── deploy-monitoring.yml
├── monitoring/                    # Monitoring Stack
│   ├── prometheus-config.yml
│   ├── prometheus-rules.yml
│   ├── grafana-dashboards.yml
│   ├── loki-config.yml
│   ├── alertmanager-config.yml
│   └── promtail-config.yml
├── docker-compose.yml            # Basic setup
├── docker-compose.full.yml       # Full stack with monitoring
├── Jenkinsfile                   # Current CI/CD
├── Jenkinsfile.updated           # Enhanced CI/CD with K8s
├── sonar-project.properties      # Code quality config
├── .env.example                  # Environment template
├── DEVOPS_REPORT.md             # Current status & findings
├── DEVOPS_COMMANDS.md           # Command reference
├── QUICK_START.md               # Quick start guide
└── README.md                     # This file
```

---

## 🚀 Quick Start

### 1. **Local Development** (5 minutes)
```bash
# Clone & setup
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi
cp .env.example .env
# Edit .env with your credentials

# Start everything
docker-compose -f docker-compose.full.yml up -d

# Access
- Frontend: http://localhost:5173 (or http://localhost for prod)
- Backend API: http://localhost:3000
- SonarQube: http://localhost:9000
- Grafana: http://localhost:3000 (credentials: admin/admin123)
- Prometheus: http://localhost:9090
- Jenkins: http://localhost:8080
```

### 2. **Infrastructure Setup** (30 minutes)
```bash
# Provision servers with Ansible
cd ansible
ansible-playbook playbooks/provision-servers.yml -i inventory.ini -v

# Deploy monitoring
ansible-playbook playbooks/deploy-monitoring.yml -i inventory.ini -v
```

### 3. **Kubernetes Deployment** (20 minutes)
```bash
# Deploy to K8s
kubectl apply -f k8s/

# Check status
kubectl get pods -n quickai
kubectl get svc -n quickai

# Port-forward to access
kubectl port-forward -n quickai svc/quickai-server 3000:3000
```

### 4. **CI/CD Pipeline** (10 minutes)
```bash
# Setup Jenkins
docker run -d -p 8080:8080 jenkins/jenkins:lts

# Configure pipeline
1. Create new Pipeline job
2. Point to Jenkinsfile.updated
3. Add GitHub webhook
4. Build!
```

---

## 📊 Key Endpoints

| Service | URL | Port | Credentials |
|---------|-----|------|-------------|
| **Frontend** | http://localhost | 5173/80 | - |
| **Backend API** | http://localhost:3000 | 3000 | - |
| **SonarQube** | http://localhost:9000 | 9000 | admin/admin |
| **Prometheus** | http://localhost:9090 | 9090 | - |
| **Grafana** | http://localhost:3000 | 3000 | admin/admin123 |
| **Loki** | http://localhost:3100 | 3100 | - |
| **Jenkins** | http://localhost:8080 | 8080 | via secret |
| **AlertManager** | http://localhost:9093 | 9093 | - |

---

## 🔍 API Endpoints

### Health Check
- `GET /` - Server health status

### AI Generation
- `POST /api/ai/generate-article` - Generate articles
- `POST /api/ai/generate-blog-title` - Generate blog titles
- `POST /api/ai/generate-image` - Generate images
- `POST /api/ai/remove-image-background` - Remove backgrounds
- `POST /api/ai/remove-image-object` - Remove objects from images
- `POST /api/ai/resume-review` - Review resumes

### User Management
- `GET /api/user/get-user-creations` - Get user's creations
- `GET /api/user/get-published-creations` - Get published creations
- `POST /api/user/toggle-like-creation` - Toggle like on creation

---

## 🛠️ DevOps Tools Integration

### ✅ Current Tools

| Tool | Purpose | Status | Config |
|------|---------|--------|--------|
| Docker | Containerization | ✅ Working | `Dockerfile` |
| Docker Compose | Local orchestration | ✅ Working | `docker-compose.yml` |
| Jenkins | CI/CD Pipeline | ✅ Working | `Jenkinsfile` |
| SonarQube | Code Quality | ✅ Working | `sonar-project.properties` |

### ✅ NEW Tools Added

| Tool | Purpose | Status | Config |
|------|---------|--------|--------|
| Kubernetes | Container orchestration | ✅ Ready | `k8s/*.yml` |
| Ansible | Infrastructure automation | ✅ Ready | `ansible/` |
| Prometheus | Metrics collection | ✅ Ready | `monitoring/prometheus-config.yml` |
| Grafana | Visualization | ✅ Ready | `monitoring/grafana-dashboards.yml` |
| Loki | Log aggregation | ✅ Ready | `monitoring/loki-config.yml` |
| AlertManager | Alert routing | ✅ Ready | `monitoring/alertmanager-config.yml` |

---

## 📚 Documentation

1. **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup guide
2. **[DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)** - Complete command reference
3. **[DEVOPS_REPORT.md](./DEVOPS_REPORT.md)** - Current status & findings
4. **[Jenkinsfile.updated](./Jenkinsfile.updated)** - Enhanced pipeline
5. **[.env.example](./.env.example)** - Environment variables

---

## 🔒 Security Notes

### ⚠️ Issues Found
1. **SonarQube token exposed** in source code
   - **Fix**: Use Jenkins credentials or environment variables
2. **Docker port mismatch** (Dockerfile: 4000, server.js: 3000)
   - **Fix**: Corrected in Dockerfile.fixed
3. **Hardcoded secrets**
   - **Fix**: Use .env files and K8s secrets

### ✅ Recommendations Implemented
1. **Secret management**: Use `.env` files with `.gitignore`
2. **Kubernetes secrets**: Encrypted at rest
3. **Network policies**: Restrict pod-to-pod communication
4. **RBAC**: Role-based access control
5. **Health checks**: Liveness & readiness probes
6. **Resource limits**: CPU & memory constraints

---

## 📈 Monitoring & Metrics

### Key Dashboards
1. **Kubernetes Cluster Overview** - Node & Pod metrics
2. **QuickAi Application** - Request rates, errors, latency
3. **Container Performance** - CPU, Memory, Network usage
4. **Database Metrics** - Connection pool, query performance

### Alert Rules (Prometheus)
```
- High CPU usage (>80%)
- High Memory usage (>80%)
- Pod restart loops
- API error rate spike
- Database connection pool exhaustion
```

### Logs Available (Loki)
- Application logs (stdout)
- System logs
- Database query logs
- Access logs (Nginx)

---

## 🚢 Deployment Flow

```
Developer Code → Git Push
                    ↓
            ↓ GitHub Webhook
                    ↓
    Jenkins Pipeline Triggered
            ↓
    ├─ Code Checkout
    ├─ SonarQube Analysis
    ├─ Build Docker Images
    ├─ Push to Registry
    └─ Deploy to K8s
            ↓
    K8s Deployment
    ├─ Pull images
    ├─ Create pods
    └─ Health checks
            ↓
    Monitoring & Alerts
    ├─ Prometheus scrapes metrics
    ├─ Loki collects logs
    └─ Grafana visualizes
            ↓
    Application Live!
```

---

## 🧪 Testing

### Build Verification
```bash
# Build images locally
docker build -t quickai-server:test ./server
docker build -t quickai-client:test ./client

# Run tests
docker-compose -f docker-compose.yml up --abort-on-container-exit
```

### Pipeline Testing
```bash
# Jenkins will auto-test on each commit
# View: http://localhost:8080

# SonarQube analysis
# View: http://localhost:9000/projects/QuickAi
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/my-feature`
4. Open Pull Request
5. Jenkins pipeline will auto-test
6. Merge after approval

---

## 📞 Support

- **Issues**: Check [DEVOPS_REPORT.md](./DEVOPS_REPORT.md)
- **Commands**: See [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)
- **Setup**: Follow [QUICK_START.md](./QUICK_START.md)
- **Logs**: Check pod logs via `kubectl logs` or Grafana/Loki

---

## 📜 License

This DevOps setup is part of the QuickAi project.

---

## 🎯 Next Steps

1. ✅ Review [DEVOPS_REPORT.md](./DEVOPS_REPORT.md)
2. ✅ Follow [QUICK_START.md](./QUICK_START.md)
3. ✅ Execute [DEVOPS_COMMANDS.md](./DEVOPS_COMMANDS.md)
4. ✅ Monitor via Grafana dashboard
5. ✅ Setup CI/CD alerts
6. ✅ Configure auto-scaling policies

---

**Version**: 1.0  
**Last Updated**: May 2, 2026  
**Status**: ✅ Production Ready
