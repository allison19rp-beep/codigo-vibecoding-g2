#!/usr/bin/env bash
# Run E2E tests locally — auto-starts Django + Next.js, cleans up after.
# Usage: ./scripts/run-e2e.sh [--build] [--test "TestName"] [--ui] [--skip-backend]

set -euo pipefail

FRONTEND_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$FRONTEND_DIR/../logistica-api"
LOG_DIR="$FRONTEND_DIR/.e2e-logs"
BUILD=false
TEST_NAME=""
UI=false
SKIP_BACKEND=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --build) BUILD=true; shift ;;
    --test) TEST_NAME="$2"; shift 2 ;;
    --ui) UI=true; shift ;;
    --skip-backend) SKIP_BACKEND=true; shift ;;
    *) echo "Unknown: $1"; exit 1 ;;
  esac
done

mkdir -p "$LOG_DIR"

cleanup() {
  echo ""
  echo "Stopping servers..."
  pkill -f "next dev|next start" 2>/dev/null || true
  pkill -f "manage.py runserver" 2>/dev/null || true
}
trap cleanup EXIT

echo "════════════════════════════════════════"
echo "  Logística E2E — Local Runner"
echo "════════════════════════════════════════"

if [ "$SKIP_BACKEND" = false ]; then
  echo "[1/4] Starting Django backend..."
  cd "$API_DIR"
  if [ -f ".venv/bin/activate" ]; then
    source .venv/bin/activate
  fi
  python manage.py runserver 0.0.0.0:8000 >"$LOG_DIR/django.log" 2>"$LOG_DIR/django.err" &
  cd "$FRONTEND_DIR"

  echo -n "  Waiting for Django at http://localhost:8000..."
  for i in $(seq 1 60); do
    if curl -s http://localhost:8000/api/v1/docs/ >/dev/null 2>&1; then
      echo " OK"
      break
    fi
    if [ "$i" -eq 60 ]; then echo " FAILED"; exit 1; fi
    sleep 2
  done
fi

echo "[2/4] Starting Next.js frontend..."
cd "$FRONTEND_DIR"

if [ "$BUILD" = true ]; then
  echo "  Building..."
  npm run build >"$LOG_DIR/build.log" 2>"$LOG_DIR/build.err"
fi

npm run start >"$LOG_DIR/next.log" 2>"$LOG_DIR/next.err" &

echo -n "  Waiting for Next.js at http://localhost:3000..."
for i in $(seq 1 60); do
  if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo " OK"
    break
  fi
  if [ "$i" -eq 60 ]; then echo " FAILED"; exit 1; fi
  sleep 2
done

echo "[3/4] Running Playwright tests..."
if [ -n "$TEST_NAME" ]; then
  npm run e2e -- --grep "$TEST_NAME"
elif [ "$UI" = true ]; then
  npm run e2e:ui
else
  npm run e2e
fi

echo "[4/4] Done!"
echo "Logs: $LOG_DIR"
echo "Run 'npm run e2e:report' for HTML report"
