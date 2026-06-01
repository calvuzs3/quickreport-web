#!/bin/bash

# ─── Configuration ────────────────────────────────────────────────────────────

DOMAIN_NAME="admin.calvuz.net"          # subdomain for qreport-web
KTOR_API_URL="http://192.168.0.191:8080" # Ktor backend on internal LAN
REPO_URL="https://github.com/calvuzs3/qreportweb.git"
APP_DIR=~/qreport-web
HOST="192.168.0.81"

# ─── Usage ────────────────────────────────────────────────────────────────────
# First deploy (from your PC):
#   ./deploy.sh install
#
# Subsequent deploys (update from git):
#   ./deploy.sh update
#
# Run on the server directly:
#   ./deploy.sh start

MODE=${1:-"update"}

# ─── Colors ───────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ─── Install mode — run once on first deploy ──────────────────────────────────

install_docker() {
    info "Installing Docker..."
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl lsb-release apt-transport-https software-properties-common
    sudo install -m 0755 -d /etc/apt/keyrings
    sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
    sudo chmod a+r /etc/apt/keyrings/docker.asc
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
        sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    docker compose version || error "Docker Compose installation failed."
    info "Docker installed successfully."
}

setup_env() {
    info "Generating SESSION_SECRET and writing .env..."
    SECRET=$(openssl rand -base64 32)
    cat > "$APP_DIR/.env" << EOF
KTOR_API_URL=$KTOR_API_URL
SESSION_SECRET=$SECRET
EOF
    info ".env written to $APP_DIR/.env"
    warning "SESSION_SECRET is randomly generated — keep this file safe and do NOT commit it."
}

# ─── Deploy steps (shared between install and update) ─────────────────────────

pull_or_clone() {
    if [ -d "$APP_DIR/.git" ]; then
        info "Pulling latest changes from git..."
        cd "$APP_DIR" && git pull
    else
        info "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    fi
}

deploy() {
    cd "$APP_DIR" || error "Cannot enter $APP_DIR"

    # Verify .env exists
    if [ ! -f ".env" ]; then
        warning ".env not found — generating now..."
        setup_env
    fi

    info "=== SAFE DOCKER DEPLOYMENT ==="

    info "Stopping existing container..."
    sudo docker compose down || true

    info "Removing stopped containers..."
    sudo docker container prune -f

    info "Building Docker image..."
    sudo docker compose build

    info "Starting container..."
    sudo docker compose up -d

    sleep 8

    info "Checking container status..."
    if ! sudo docker ps | grep -q "qreport-web"; then
        error "Container failed to start. Check logs: docker compose logs"
    fi

    echo ""
    echo "=== RUNNING CONTAINERS ==="
    sudo docker ps

    echo ""
    echo "=== RECENT LOGS ==="
    sudo docker compose logs --tail=20

    echo ""
    info "Deployment complete."
    echo ""
    echo "  ✅ qreport-web running on port 3001"
    echo "  ✅ Ktor backend: $KTOR_API_URL"
    echo "  🌐 Configure NPM proxy host: $DOMAIN_NAME → $(hostname -I | awk '{print $1}'):3001"
    echo ""
    echo "=== TROUBLESHOOTING ==="
    echo "  Logs:    sudo docker compose logs -f"
    echo "  Restart: sudo docker compose restart"
    echo "  Rebuild: sudo docker compose build --no-cache && sudo docker compose up -d"
}

# ─── Entry point ──────────────────────────────────────────────────────────────

case "$MODE" in
    install)
        info "Running first-time install..."
        install_docker
        pull_or_clone
        setup_env
        deploy
        ;;
    update)
        info "Updating deployment..."
        pull_or_clone
        deploy
        ;;
    start)
        info "Starting existing build..."
        deploy
        ;;
    *)
        echo "Usage: $0 [install|update|start]"
        echo "  install — first deploy: installs Docker, clones repo, generates secrets"
        echo "  update  — pulls latest git changes and redeploys (default)"
        echo "  start   — redeploys without pulling git"
        exit 1
        ;;
esac