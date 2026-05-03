# QuickAi DevOps - Quick Start Guide

## Prerequisites
```bash
# Install required tools
docker --version          # Docker Desktop
docker-compose --version  # Docker Compose
kubectl version          # Kubernetes CLI
helm version             # Helm package manager
ansible --version        # Ansible
sonar-scanner --version  # SonarQube Scanner
```

---

## 1️⃣ LOCAL DEVELOPMENT (Docker Compose)

### Start the application locally:
```bash
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# Create .env file with your credentials
cp .env.example .env
# Edit .env and add:
# - VITE_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY
# - OPENAI_API_KEY
# - CLOUDINARY credentials
# - Database URL

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f server
docker-compose logs -f client

# Access the app
# Frontend: http://localhost:5173 (dev) or http://localhost (prod)
# Backend: http://localhost:3000
# Health check: curl http://localhost:3000/
```

---

## 2️⃣ ANSIBLE PROVISIONING (Setup Servers)

### Install Ansible on your machine:
```bash
# Windows (using WSL)
sudo apt-get install ansible

# Mac
brew install ansible

# Or using Python pip
pip install ansible
```

### Configure your inventory:
```bash
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi\ansible

# Edit inventory.ini with your server IPs
# Replace:
# - 192.168.1.10 -> Your master node IP
# - 192.168.1.11, 192.168.1.12 -> Worker node IPs
```

### Run provisioning:
```bash
# Provision all servers with Docker and Kubernetes
ansible-playbook playbooks/provision-servers.yml -i inventory.ini -v

# Deploy monitoring stack
ansible-playbook playbooks/deploy-monitoring.yml -i inventory.ini -v
```

---

## 3️⃣ KUBERNETES DEPLOYMENT

### Prerequisites:
```bash
# 1. Have a Kubernetes cluster (local minikube or cloud provider)
minikube start --cpus=4 --memory=4096

# 2. Configure kubectl to access your cluster
kubectl config use-context <your-cluster-name>

# 3. Create container registry credentials (if using private registry)
kubectl create secret docker-registry docker-registry-secret \
  --docker-server=<your-registry> \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email>
```

### Deploy the application:
```bash
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# 1. Create namespace
kubectl apply -f k8s/namespace.yml

# 2. Create secrets (update with real values first!)
kubectl apply -f k8s/secret-template.yml

# 3. Create config
kubectl apply -f k8s/configmap.yml

# 4. Deploy server and client
kubectl apply -f k8s/server-deployment.yml
kubectl apply -f k8s/client-deployment.yml

# 5. Deploy ingress (if using)
kubectl apply -f k8s/ingress.yml

# Check deployment status
kubectl get pods -n quickai
kubectl get svc -n quickai
kubectl describe pod <pod-name> -n quickai
```

### View logs:
```bash
# Server logs
kubectl logs -f deployment/quickai-server -n quickai

# Client logs
kubectl logs -f deployment/quickai-client -n quickai

# All logs
kubectl logs -f -n quickai --all-containers=true
```

---

## 4️⃣ MONITORING STACK (Prometheus + Grafana + Loki)

### Install Helm repositories:
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### Deploy monitoring:
```bash
# Create monitoring namespace
kubectl create namespace monitoring

# Deploy Prometheus + Grafana stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin123

# Deploy Loki for logs
helm install loki grafana/loki-stack --namespace monitoring

# Verify deployment
kubectl get pods -n monitoring
```

### Access Grafana:
```bash
# Port-forward Grafana (localhost:3000)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Port-forward Prometheus (localhost:9090)
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090

# Default Grafana credentials
# Username: admin
# Password: admin123
```

### Check Prometheus targets:
```bash
# Port-forward to Prometheus
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Open: http://localhost:9090/targets
```

---

## 5️⃣ JENKINS PIPELINE

### Setup Jenkins:
```bash
# Using Docker
docker run -d -p 8080:8080 -p 50000:50000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v jenkins-data:/var/jenkins_home \
  --name jenkins \
  jenkins/jenkins:latest

# Access Jenkins
# URL: http://localhost:8080
# Get admin password: docker logs jenkins | grep "temporary password"
```

### Configure Jenkins:
```bash
1. Manage Jenkins → Configure System
2. Add "sonar-scanner" tool pointing to your SonarQube scanner
3. Add "SonarQube" server configuration:
   - URL: http://sonarqube:9000
   - Token: Your SonarQube token (stored as credential)

4. Add Docker Registry credentials:
   - Username/Password for your container registry

5. Add Kubeconfig credentials:
   - Copy your ~/.kube/config content

6. Create new Pipeline job:
   - Pipeline script from SCM
   - GitHub repo URL
   - Branch: main
   - Path: Jenkinsfile.updated
```

### Trigger pipeline:
```bash
# Via Jenkins UI
# 1. Click "Build Now"

# Or via webhook (auto-trigger on git push)
# In GitHub: Settings → Webhooks
# Add: http://your-jenkins:8080/github-webhook/
```

### Monitor pipeline:
```bash
# View logs
# Jenkins UI → Build number → Console Output

# Check deployed resources
kubectl get all -n quickai
```

---

## 6️⃣ COMPLETE DEVOPS FLOW

### One-command deployment (requires setup):
```bash
# After all tools are installed and configured

# 1. Provision infrastructure
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini

# 2. Push code to Git (triggers Jenkins)
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Jenkins automatically:
#    - Runs SonarQube analysis
#    - Builds Docker images
#    - Pushes to registry
#    - Deploys to Kubernetes
#    - Deploys monitoring

# 4. Verify deployment
kubectl get pods -n quickai
kubectl get pods -n monitoring

# 5. Access the application
# Frontend: http://quickai.example.com
# Grafana: http://localhost:3000 (via port-forward)
# Prometheus: http://localhost:9090 (via port-forward)
```

---

## 📊 MONITORING YOUR DEPLOYMENT

### Check application health:
```bash
# Check pod status
kubectl get pods -n quickai -o wide

# Check service endpoints
kubectl get endpoints -n quickai

# Test application endpoint
curl http://quickai-server:3000/
kubectl port-forward -n quickai svc/quickai-server 3000:3000
curl http://localhost:3000/
```

### View metrics in Grafana:
```bash
1. Port-forward to Grafana
2. Login with admin/admin123
3. Go to Dashboards
4. Select "Kubernetes Cluster Overview"
5. View real-time metrics:
   - Node CPU/Memory
   - Pod CPU/Memory
   - Request rates
   - Error rates
```

### View logs in Grafana:
```bash
1. In Grafana, click "Explore"
2. Select "Loki" data source
3. Query examples:
   {namespace="quickai"}
   {pod="quickai-server-*"}
   {app="quickai-server"} | json
```

### Create alerts:
```bash
1. In Grafana, go to Alerting
2. Create alert rule based on metrics:
   - High CPU: (100 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
   - High Memory: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.8
   - Pod Restart: rate(kube_pod_container_status_restarts_total[15m]) > 0.1
```

---

## 🔧 TROUBLESHOOTING

### Pods not starting:
```bash
# Check pod status
kubectl describe pod <pod-name> -n quickai

# Check logs
kubectl logs <pod-name> -n quickai

# Check events
kubectl get events -n quickai --sort-by='.lastTimestamp'
```

### Docker build failing:
```bash
# Check Docker daemon
docker ps

# Rebuild without cache
docker build --no-cache -t quickai-server:latest ./server

# Check build logs
docker logs <container-id>
```

### Kubernetes connection issues:
```bash
# Verify kubectl config
kubectl config view

# Test cluster access
kubectl cluster-info
kubectl auth can-i get pods

# Check service DNS
kubectl run -it --rm debug --image=nicolaka/netshoot --restart=Never -- nslookup quickai-server.quickai
```

### Jenkins pipeline failing:
```bash
# Check Jenkins logs
docker logs jenkins

# Check if credentials are set
# Jenkins → Manage Jenkins → Manage Credentials

# Verify kubeconfig is accessible from Jenkins pod
# Jenkins → Manage Jenkins → System → Environment variables
```

---

## 📝 ENDPOINTS SUMMARY

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| Application Frontend | http://localhost:5173 | 5173 | React frontend (dev) |
| Application Frontend | http://localhost | 80 | React frontend (prod) |
| API Server | http://localhost:3000 | 3000 | Express backend |
| Jenkins | http://localhost:8080 | 8080 | CI/CD pipeline |
| SonarQube | http://localhost:9000 | 9000 | Code quality analysis |
| Prometheus | http://localhost:9090 | 9090 | Metrics collection |
| Grafana | http://localhost:3000 | 3000 | Visualization & dashboards |
| Loki | http://localhost:3100 | 3100 | Log aggregation |

---

## 📚 API ROUTES REFERENCE

### AI Generation Endpoints
- `POST /api/ai/generate-article` - Generate articles
- `POST /api/ai/generate-blog-title` - Generate blog titles
- `POST /api/ai/generate-image` - Generate images

### Image Processing Endpoints
- `POST /api/ai/remove-image-background` - Remove image backgrounds
- `POST /api/ai/remove-image-object` - Remove objects from images
- `POST /api/ai/resume-review` - Review resumes (PDF)

### User Management Endpoints
- `GET /api/user/get-user-creations` - Get user's creations
- `GET /api/user/get-published-creations` - Get published creations
- `POST /api/user/toggle-like-creation` - Toggle like

### Health Check
- `GET /` - Server health status

---

## ✅ VERIFICATION CHECKLIST

- [ ] Docker and Docker Compose running
- [ ] All pods are in "Running" state
- [ ] Services have endpoints assigned
- [ ] Jenkins pipeline completes successfully
- [ ] SonarQube analysis shows no critical issues
- [ ] Prometheus is scraping metrics
- [ ] Grafana dashboards are displaying data
- [ ] Loki is collecting logs
- [ ] Application endpoints are responding
- [ ] Monitoring alerts are configured

---

**Last Updated**: May 2, 2026
**Version**: 1.0
