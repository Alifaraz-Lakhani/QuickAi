#!/bin/bash
# QuickAi DevOps - Setup & Deployment Script
# This script automates the complete setup process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker installed"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose installed"
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_warning "kubectl is not installed (optional for local dev)"
    else
        print_success "kubectl installed"
    fi
    
    # Check Ansible
    if ! command -v ansible &> /dev/null; then
        print_warning "Ansible is not installed (optional)"
    else
        print_success "Ansible installed"
    fi
    
    echo ""
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please edit .env with your credentials"
    else
        print_info ".env file already exists"
    fi
    
    # Create required directories
    mkdir -p logs volumes/{prometheus,grafana,postgres,loki}
    print_success "Directories created"
    
    echo ""
}

# Start services
start_services() {
    print_header "Starting Services"
    
    read -p "Do you want to start all services with monitoring? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting all services with monitoring stack..."
        docker-compose -f docker-compose.full.yml up -d
        print_success "All services started"
        
        print_info "Waiting for services to be ready..."
        sleep 10
        
        # Show service status
        docker-compose -f docker-compose.full.yml ps
    else
        print_info "Starting basic services..."
        docker-compose up -d
        print_success "Basic services started"
        
        docker-compose ps
    fi
    
    echo ""
}

# Show endpoints
show_endpoints() {
    print_header "Service Endpoints"
    
    echo ""
    echo -e "${GREEN}Application:${NC}"
    echo "  Frontend:    ${BLUE}http://localhost:5173${NC} (dev) or ${BLUE}http://localhost${NC} (prod)"
    echo "  Backend API: ${BLUE}http://localhost:3000${NC}"
    echo ""
    
    echo -e "${GREEN}Monitoring & Analytics:${NC}"
    echo "  Prometheus:  ${BLUE}http://localhost:9090${NC}"
    echo "  Grafana:     ${BLUE}http://localhost:3000${NC} (user: admin, pass: admin123)"
    echo "  Loki:        ${BLUE}http://localhost:3100${NC}"
    echo ""
    
    echo -e "${GREEN}Development & Quality:${NC}"
    echo "  SonarQube:   ${BLUE}http://localhost:9000${NC} (user: admin, pass: admin)"
    echo "  Jenkins:     ${BLUE}http://localhost:8080${NC}"
    echo ""
    
    echo -e "${GREEN}Database:${NC}"
    echo "  PostgreSQL:  ${BLUE}localhost:5432${NC} (user: quickai, pass: check .env)"
    echo ""
}

# Show logs
show_logs() {
    print_header "Viewing Logs"
    
    echo ""
    echo "Available services:"
    docker-compose ps --services
    echo ""
    
    read -p "Enter service name (or 'all'): " service_name
    
    if [ "$service_name" = "all" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service_name"
    fi
}

# Stop services
stop_services() {
    print_header "Stopping Services"
    
    print_info "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
    
    echo ""
}

# Clean up
cleanup() {
    print_header "Cleanup"
    
    read -p "Do you want to remove volumes as well? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Removing all volumes..."
        docker-compose down -v
        print_success "All services and volumes removed"
    else
        print_info "Only stopping services"
        docker-compose down
    fi
    
    echo ""
}

# Deploy to Kubernetes
deploy_kubernetes() {
    print_header "Kubernetes Deployment"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed. Please install it first."
        return
    fi
    
    print_info "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl create namespace quickai --dry-run=client -o yaml | kubectl apply -f -
    print_success "Namespace created"
    
    # Apply manifests
    kubectl apply -f k8s/
    print_success "Manifests applied"
    
    # Wait for deployment
    print_info "Waiting for deployments to be ready..."
    kubectl rollout status deployment/quickai-server -n quickai || true
    kubectl rollout status deployment/quickai-client -n quickai || true
    
    # Show status
    echo ""
    print_success "Deployment status:"
    kubectl get pods -n quickai
    
    echo ""
}

# Run Ansible playbooks
run_ansible() {
    print_header "Ansible Provisioning"
    
    if ! command -v ansible &> /dev/null; then
        print_error "Ansible is not installed. Please install it first."
        return
    fi
    
    print_info "Available playbooks:"
    ls -1 ansible/playbooks/*.yml | sed 's/.*\//  - /'
    echo ""
    
    read -p "Enter playbook name (without path/extension): " playbook_name
    
    if [ -f "ansible/playbooks/${playbook_name}.yml" ]; then
        print_info "Running playbook: ${playbook_name}"
        ansible-playbook "ansible/playbooks/${playbook_name}.yml" \
            -i ansible/inventory.ini -v
        print_success "Playbook completed"
    else
        print_error "Playbook not found: ${playbook_name}"
    fi
    
    echo ""
}

# Main menu
main_menu() {
    while true; do
        echo ""
        print_header "QuickAi DevOps Setup Menu"
        echo ""
        echo "1. Check Prerequisites"
        echo "2. Setup Environment"
        echo "3. Start Services"
        echo "4. Show Endpoints"
        echo "5. View Logs"
        echo "6. Deploy to Kubernetes"
        echo "7. Run Ansible Playbooks"
        echo "8. Stop Services"
        echo "9. Cleanup"
        echo "0. Exit"
        echo ""
        
        read -p "Select option: " choice
        
        case $choice in
            1) check_prerequisites ;;
            2) setup_environment ;;
            3) start_services ;;
            4) show_endpoints ;;
            5) show_logs ;;
            6) deploy_kubernetes ;;
            7) run_ansible ;;
            8) stop_services ;;
            9) cleanup ;;
            0) 
                print_info "Exiting..."
                exit 0
                ;;
            *)
                print_error "Invalid option"
                ;;
        esac
    done
}

# Run based on arguments
if [ $# -eq 0 ]; then
    main_menu
else
    case $1 in
        check)
            check_prerequisites
            ;;
        setup)
            setup_environment
            ;;
        start)
            start_services
            ;;
        stop)
            stop_services
            ;;
        logs)
            show_logs
            ;;
        k8s)
            deploy_kubernetes
            ;;
        ansible)
            run_ansible
            ;;
        *)
            echo "Usage: $0 [check|setup|start|stop|logs|k8s|ansible]"
            echo "Or run without arguments for interactive menu"
            exit 1
            ;;
    esac
fi
