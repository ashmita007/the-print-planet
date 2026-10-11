#!/usr/bin/env bash
# ==============================================================================
# The Print Planet — Single-Command Local Development Launcher
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

echo "=========================================================="
echo "  The Print Planet — Local Development Environment"
echo "=========================================================="

# 1. Check Python virtual environment
if [ ! -d "${BACKEND_DIR}/venv" ]; then
    echo "-> Creating Python virtual environment in backend/venv..."
    python3 -m venv "${BACKEND_DIR}/venv"
    "${BACKEND_DIR}/venv/bin/pip" install --upgrade pip
    "${BACKEND_DIR}/venv/bin/pip" install -r "${BACKEND_DIR}/requirements.txt"
fi

PYTHON_BIN="${BACKEND_DIR}/venv/bin/python"

# 2. Run migrations
echo "-> Applying database migrations..."
cd "${BACKEND_DIR}"
${PYTHON_BIN} manage.py migrate

# 3. Seed reference catalog & ensure admin account exists
echo "-> Checking reference catalogue and default owner account..."
${PYTHON_BIN} manage.py seed_reference_data --create-owner

# 4. Check Frontend dependencies
if [ ! -d "${FRONTEND_DIR}/node_modules" ]; then
    echo "-> Installing frontend npm packages..."
    cd "${FRONTEND_DIR}"
    npm install
fi

echo "----------------------------------------------------------"
echo "  Starting Backend & Frontend Servers"
echo "  • Frontend: http://localhost:3000"
echo "  • Owner Portal: http://localhost:3000/owner/login"
echo "    Credentials: admin / AdminPass123!Secure"
echo "  • REST API: http://localhost:8000/api/v1/"
echo "  • Swagger UI: http://localhost:8000/api/docs/"
echo "----------------------------------------------------------"

# Cleanup background processes on exit
cleanup() {
    echo ""
    echo "-> Stopping servers..."
    kill $(jobs -p) 2>/dev/null || true
    echo "-> Stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Django Backend
cd "${BACKEND_DIR}"
${PYTHON_BIN} manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Start Next.js Frontend
cd "${FRONTEND_DIR}"
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
