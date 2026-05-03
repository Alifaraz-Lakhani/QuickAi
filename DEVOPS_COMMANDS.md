# Complete DevOps Commands Reference

## 🚀 START EVERYTHING (All Tools)

```bash
cd d:\PDAF\PSTDY\COMPSC125P\sem6\devops\QuickAi

# Start with full monitoring stack
docker-compose -f docker-compose.full.yml up -d

# Check all services
docker-compose -f docker-compose.full.yml ps

# View logs
docker-compose -f docker-compose.full.yml logs -f

# Stop everything
docker-compose -f docker-compose.full.yml down
```

---

## 📋 SERVICE-BY-SERVICE COMMANDS

### Application (Server + Client)
```bash
# Start only app
docker-compose up -d server client

# View app logs
docker-compose logs -f server
docker-compose logs -f client

# Restart app
docker-compose restart server client

# Rebuild app images
docker-compose build --no-cache server client
```

### Database (PostgreSQL)
```bash
# Start database
docker-compose up -d postgres

# Access database shell
docker-compose exec postgres psql -U quickai -d quickai_db

# View database logs
docker-compose logs -f postgres

# Backup database
docker-compose exec postgres pg_dump -U quickai quickai_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U quickai quickai_db < backup.sql
```

### Code Quality (SonarQube)
```bash
# Start SonarQube
docker-compose up -d sonarqube

# Access SonarQube
# URL: http://localhost:9000
# Default: admin/admin

# Run analysis
cd . && ./sonar-scanner \
  -Dsonar.projectKey=QuickAi \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=sqp_26750e39335ffa2afdf4fc4db78108885819f307
```

### Monitoring - Prometheus
```bash
# Start Prometheus
docker-compose up -d prometheus

# Access Prometheus
# URL: http://localhost:9090

# Query metrics
# Open http://localhost:9090 and type:
# rate(http_requests_total[5m])
# container_memory_usage_bytes
# up (to see targets status)

# View targets
# URL: http://localhost:9090/targets
```

### Monitoring - Grafana
```bash
# Start Grafana
docker-compose up -d grafana

# Access Grafana
# URL: http://localhost:3000
# Default: admin/admin123

# Add data source:
# 1. Settings → Data Sources → Add
# 2. Select Prometheus
# 3. URL: http://prometheus:9090

# Add data source for Loki:
# 1. Settings → Data Sources → Add
# 2. Select Loki
# 3. URL: http://loki:3100

# Create dashboard:
# Click + → Dashboard → Add Panel
# Query: rate(http_requests_total[5m])
```

### Monitoring - Loki (Logs)
```bash
# Start Loki
docker-compose up -d loki promtail

# Access logs in Grafana
# Explore → Select Loki
# Query: {job="quickai"}
```

### CI/CD - Jenkins
```bash
# Start Jenkins
docker-compose up -d jenkins

# Access Jenkins
# URL: http://localhost:8080
# Get admin password: docker-compose logs jenkins | grep "password"

# Configure Jenkins:
# 1. Manage Jenkins → Configure System
# 2. Add tools: Maven, Node, Docker
# 3. Create new Pipeline job
# 4. Point to Jenkinsfile.updated
```

### Alerting
```bash
# Start AlertManager
docker-compose up -d alertmanager

# Access AlertManager
# URL: http://localhost:9093

# View alerts
# Prometheus → Alerts
# AlertManager → Status
```

---

## 🔍 MONITORING & DIAGNOSTICS

### Check Service Health
```bash
# All services
docker-compose ps

# Specific service
docker-compose ps server

# Health status
docker inspect --format='{{json .State.Health}}' quickai-server | python -m json.tool
```

### View Logs
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs server

# Follow logs
docker-compose logs -f server

# Last 100 lines
docker-compose logs --tail=100 server

# Logs with timestamps
docker-compose logs -t server

# Since specific time
docker-compose logs --since 10m server
```

### Performance Monitoring
```bash
# Docker stats (CPU, Memory, Network)
docker stats

# Container resource usage
docker stats quickai-server quickai-client

# System information
docker system df

# Docker events (real-time)
docker events --filter type=container
```

### Network Diagnostics
```bash
# Inspect network
docker network inspect quickai-network

# Test connectivity between containers
docker-compose exec server ping client
docker-compose exec client curl http://server:3000

# DNS resolution
docker-compose exec server nslookup postgres
```

---

## 🔧 CONFIGURATION & UPDATES

### Update Environment Variables
```bash
# Edit .env file
nano .env

# Restart with new env vars
docker-compose down
docker-compose up -d
```

### Update Service Configuration
```bash
# Edit prometheus config
nano monitoring/prometheus-config.yml

# Reload without restart
curl -X POST http://localhost:9090/-/reload

# Or restart
docker-compose restart prometheus
```

### Scale Services
```bash
# Scale specific service
docker-compose up -d --scale server=3

# Scale client
docker-compose up -d --scale client=2
```

---

## 🐳 DOCKER IMAGE MANAGEMENT

### Build Images
```bash
# Build specific image
docker build -t quickai-server:v1 ./server
docker build -t quickai-client:v1 ./client

# Build with no cache
docker build --no-cache -t quickai-server:v1 ./server

# Build with build args
docker build --build-arg VITE_CLERK_PUBLISHABLE_KEY=xxx -t quickai-client:v1 ./client
```

### Push to Registry
```bash
# Tag image
docker tag quickai-server:v1 your-registry/quickai-server:v1
docker tag quickai-client:v1 your-registry/quickai-client:v1

# Login to registry
docker login your-registry

# Push
docker push your-registry/quickai-server:v1
docker push your-registry/quickai-client:v1

# Logout
docker logout
```

### Cleanup
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (dangerous!)
docker system prune -a --volumes
```

---

## 📊 PROMETHEUS QUERIES

```
# Request rate
rate(http_requests_total[5m])

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Response time (latency)
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# CPU usage
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Disk usage
(1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100

# Container memory
container_memory_usage_bytes / 1024 / 1024

# Pod restarts
rate(kube_pod_container_status_restarts_total[15m])

# Pod CPU
rate(container_cpu_usage_seconds_total[5m])
```

---

## 🔐 SECURITY COMMANDS

### Generate Secrets
```bash
# Generate random password
openssl rand -base64 32

# Generate API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Create encrypted .env
gpg -c .env
gpg -d .env.gpg > .env
```

### Check Secret Exposure
```bash
# Scan for exposed secrets
git log -p | grep -i "password\|api_key\|secret"

# Use tools like truffleHog
trufflehog filesystem . --json
```

---

## 🧪 TESTING

### Health Checks
```bash
# Server health
curl http://localhost:3000/

# Client health
curl http://localhost:5173/

# Prometheus health
curl http://localhost:9090/-/healthy

# Grafana health
curl http://localhost:3000/api/health

# SonarQube health
curl http://localhost:9000/api/system/health
```

### API Testing
```bash
# Test AI endpoints
curl -X POST http://localhost:3000/api/ai/generate-article \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Write about AI"}'

# Test with authentication (add token)
curl -X GET http://localhost:3000/api/user/get-user-creations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 ANSIBLE COMMANDS

```bash
# Dry run
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini --check

# Run provisioning
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini -v

# Run specific task
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini --tags "docker"

# Run on specific host
ansible-playbook ansible/playbooks/provision-servers.yml -i ansible/inventory.ini -l k8s_master

# Check connectivity
ansible all -i ansible/inventory.ini -m ping

# Gather facts
ansible all -i ansible/inventory.ini -m setup
```

---

## ☸️ KUBERNETES COMMANDS

```bash
# Deployment
kubectl apply -f k8s/
kubectl get pods -n quickai
kubectl get svc -n quickai

# View logs
kubectl logs deployment/quickai-server -n quickai
kubectl logs -f deployment/quickai-server -n quickai

# Port forward
kubectl port-forward svc/quickai-server 3000:3000 -n quickai
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

# Describe resources
kubectl describe pod <pod-name> -n quickai
kubectl describe deployment quickai-server -n quickai

# Delete deployment
kubectl delete deployment quickai-server -n quickai

# Scale deployment
kubectl scale deployment quickai-server --replicas=3 -n quickai
```

---

## 🔄 CI/CD PIPELINE

### Jenkins Commands
```bash
# Rebuild job (via webhook/API)
curl -X POST http://localhost:8080/job/QuickAi/build

# Get job status
curl http://localhost:8080/api/json

# View logs
docker-compose logs -f jenkins

# Access Jenkins
# URL: http://localhost:8080
# Get credentials: docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### SonarQube Analysis
```bash
# Run analysis locally
sonar-scanner \
  -Dsonar.projectKey=QuickAi \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=sqp_26750e39335ffa2afdf4fc4db78108885819f307

# View results
# URL: http://localhost:9000/projects/QuickAi
```

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### Container won't start
```bash
# Check logs
docker logs container-name

# Check port conflicts
lsof -i :3000
netstat -tulpn | grep 3000

# Check resource constraints
docker stats
```

#### Network connectivity issues
```bash
# Check network
docker network inspect quickai-network

# Test DNS
docker-compose exec server nslookup postgres

# Test port connectivity
docker-compose exec server telnet postgres 5432
```

#### Permission issues
```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./volumes

# Fix docker socket
sudo chmod 666 /var/run/docker.sock
```

#### Database connection issues
```bash
# Check database status
docker-compose logs postgres

# Connect directly
docker-compose exec postgres psql -U quickai -c "SELECT 1"

# Check credentials
echo $DATABASE_URL
```

---

## 📝 USEFUL SHORTCUTS

```bash
# Start all
alias devops-start='docker-compose -f docker-compose.full.yml up -d'

# Stop all
alias devops-stop='docker-compose -f docker-compose.full.yml down'

# View all logs
alias devops-logs='docker-compose -f docker-compose.full.yml logs -f'

# Full cleanup
alias devops-clean='docker-compose -f docker-compose.full.yml down -v && docker system prune -af'

# Status check
alias devops-status='docker-compose -f docker-compose.full.yml ps'
```

Add these to your `.bashrc` or PowerShell profile for quick access.

---

**Version**: 1.0
**Last Updated**: May 2, 2026
