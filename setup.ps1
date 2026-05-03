# QuickAi DevOps - Windows Setup Script (PowerShell)

param(
    [string]$Action = "menu"
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

function Write-Header {
    param([string]$Message)
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host $Message -ForegroundColor $Cyan
    Write-Host "========================================" -ForegroundColor $Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Red
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Cyan
}

# Check prerequisites
function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check Docker
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Write-Success "Docker installed"
        $dockerVersion = docker --version
        Write-Info $dockerVersion
    } else {
        Write-Error-Custom "Docker is not installed"
        Write-Info "Download from: https://www.docker.com/products/docker-desktop"
        return $false
    }
    
    # Check Docker Compose
    if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
        Write-Success "Docker Compose installed"
    } else {
        Write-Error-Custom "Docker Compose is not installed"
        return $false
    }
    
    # Check kubectl (optional)
    if (Get-Command kubectl -ErrorAction SilentlyContinue) {
        Write-Success "kubectl installed"
    } else {
        Write-Warning-Custom "kubectl is not installed (optional for local dev)"
    }
    
    # Check Ansible (optional)
    if (Get-Command ansible -ErrorAction SilentlyContinue) {
        Write-Success "Ansible installed"
    } else {
        Write-Warning-Custom "Ansible is not installed (optional)"
    }
    
    Write-Host ""
    return $true
}

# Setup environment
function Setup-Environment {
    Write-Header "Setting Up Environment"
    
    if (-not (Test-Path ".env")) {
        Write-Info "Creating .env file from template..."
        Copy-Item ".env.example" ".env"
        Write-Success ".env file created"
        Write-Warning-Custom "Please edit .env with your credentials"
    } else {
        Write-Info ".env file already exists"
    }
    
    # Create required directories
    @("logs", "volumes", "volumes/prometheus", "volumes/grafana", "volumes/postgres", "volumes/loki") | ForEach-Object {
        if (-not (Test-Path $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }
    Write-Success "Directories created"
    
    Write-Host ""
}

# Start services
function Start-Services {
    Write-Header "Starting Services"
    
    $response = Read-Host "Do you want to start all services with monitoring? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Info "Starting all services with monitoring stack..."
        docker-compose -f docker-compose.full.yml up -d
        Write-Success "All services started"
        
        Write-Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 10
        
        docker-compose -f docker-compose.full.yml ps
    } else {
        Write-Info "Starting basic services..."
        docker-compose up -d
        Write-Success "Basic services started"
        
        docker-compose ps
    }
    
    Write-Host ""
}

# Show endpoints
function Show-Endpoints {
    Write-Header "Service Endpoints"
    
    Write-Host ""
    Write-Host "Application:" -ForegroundColor $Green
    Write-Host "  Frontend:    http://localhost:5173 (dev) or http://localhost (prod)" -ForegroundColor $Cyan
    Write-Host "  Backend API: http://localhost:3000" -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "Monitoring & Analytics:" -ForegroundColor $Green
    Write-Host "  Prometheus:  http://localhost:9090" -ForegroundColor $Cyan
    Write-Host "  Grafana:     http://localhost:3000 (user: admin, pass: admin123)" -ForegroundColor $Cyan
    Write-Host "  Loki:        http://localhost:3100" -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "Development & Quality:" -ForegroundColor $Green
    Write-Host "  SonarQube:   http://localhost:9000 (user: admin, pass: admin)" -ForegroundColor $Cyan
    Write-Host "  Jenkins:     http://localhost:8080" -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "Database:" -ForegroundColor $Green
    Write-Host "  PostgreSQL:  localhost:5432 (user: quickai, pass: check .env)" -ForegroundColor $Cyan
    Write-Host ""
}

# Show logs
function Show-Logs {
    Write-Header "Viewing Logs"
    
    Write-Host ""
    Write-Host "Available services:" -ForegroundColor $Green
    docker-compose ps --services
    Write-Host ""
    
    $serviceName = Read-Host "Enter service name (or 'all')"
    
    if ($serviceName -eq "all") {
        docker-compose logs -f
    } else {
        docker-compose logs -f $serviceName
    }
}

# Stop services
function Stop-Services {
    Write-Header "Stopping Services"
    
    Write-Info "Stopping all services..."
    docker-compose down
    Write-Success "All services stopped"
    
    Write-Host ""
}

# Cleanup
function Cleanup {
    Write-Header "Cleanup"
    
    $response = Read-Host "Do you want to remove volumes as well? (y/n)"
    
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Warning-Custom "Removing all volumes..."
        docker-compose down -v
        Write-Success "All services and volumes removed"
    } else {
        Write-Info "Only stopping services"
        docker-compose down
    }
    
    Write-Host ""
}

# Deploy to Kubernetes
function Deploy-Kubernetes {
    Write-Header "Kubernetes Deployment"
    
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "kubectl is not installed. Please install it first."
        return
    }
    
    Write-Info "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl create namespace quickai --dry-run=client -o yaml | kubectl apply -f -
    Write-Success "Namespace created"
    
    # Apply manifests
    kubectl apply -f k8s/
    Write-Success "Manifests applied"
    
    # Wait for deployment
    Write-Info "Waiting for deployments to be ready..."
    kubectl rollout status deployment/quickai-server -n quickai
    kubectl rollout status deployment/quickai-client -n quickai
    
    # Show status
    Write-Host ""
    Write-Success "Deployment status:"
    kubectl get pods -n quickai
    
    Write-Host ""
}

# Run Ansible playbooks
function Run-Ansible {
    Write-Header "Ansible Provisioning"
    
    if (-not (Get-Command ansible -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Ansible is not installed. Please install it first."
        return
    }
    
    Write-Info "Available playbooks:"
    Get-ChildItem -Path "ansible\playbooks\*.yml" -Name | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor $Cyan
    }
    Write-Host ""
    
    $playbookName = Read-Host "Enter playbook name (without path/extension)"
    
    $playbookPath = "ansible\playbooks\$playbookName.yml"
    if (Test-Path $playbookPath) {
        Write-Info "Running playbook: $playbookName"
        ansible-playbook $playbookPath -i ansible/inventory.ini -v
        Write-Success "Playbook completed"
    } else {
        Write-Error-Custom "Playbook not found: $playbookName"
    }
    
    Write-Host ""
}

# Main menu
function Show-Menu {
    while ($true) {
        Write-Host ""
        Write-Header "QuickAi DevOps Setup Menu"
        Write-Host ""
        Write-Host "1. Check Prerequisites"
        Write-Host "2. Setup Environment"
        Write-Host "3. Start Services"
        Write-Host "4. Show Endpoints"
        Write-Host "5. View Logs"
        Write-Host "6. Deploy to Kubernetes"
        Write-Host "7. Run Ansible Playbooks"
        Write-Host "8. Stop Services"
        Write-Host "9. Cleanup"
        Write-Host "0. Exit"
        Write-Host ""
        
        $choice = Read-Host "Select option"
        
        switch ($choice) {
            "1" { Check-Prerequisites }
            "2" { Setup-Environment }
            "3" { Start-Services }
            "4" { Show-Endpoints }
            "5" { Show-Logs }
            "6" { Deploy-Kubernetes }
            "7" { Run-Ansible }
            "8" { Stop-Services }
            "9" { Cleanup }
            "0" {
                Write-Info "Exiting..."
                exit 0
            }
            default {
                Write-Error-Custom "Invalid option"
            }
        }
    }
}

# Main execution
switch ($Action.ToLower()) {
    "check" { Check-Prerequisites }
    "setup" { Setup-Environment }
    "start" { Start-Services }
    "stop" { Stop-Services }
    "logs" { Show-Logs }
    "k8s" { Deploy-Kubernetes }
    "ansible" { Run-Ansible }
    "endpoints" { Show-Endpoints }
    default { Show-Menu }
}
