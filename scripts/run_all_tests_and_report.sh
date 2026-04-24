#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOGS_DIR="${ROOT_DIR}/logs"
REPORT_FILE="${LOGS_DIR}/qa_report.txt"
mkdir -p "${LOGS_DIR}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "${REPORT_FILE}"
}

log "Starting QA run: lint, typecheck, tests, build, API smoke"

start_ts=$(date +%s)

########################################
## 1) Ensure backend is not running   ##
########################################
log "Stopping any existing backend/swarm processes..."
pkill -f 'tsx watch src/server.ts' 2>/dev/null || true
pkill -f 'node dist/server.js' 2>/dev/null || true
sleep 1

########################################
## 2) Install / Prepare dependencies   ##
########################################
log "Installing dependencies (root and mobile)"
npm ci &> "${LOGS_DIR}/npm_ci.log" || true

########################################
## 3) Start backend (dev)               ##
########################################
log "Starting backend (port 3000)"
PORT=3000 npm run dev &> "${LOGS_DIR}/backend_dev.log" & echo $! > /tmp/workai_backend_pid
sleep 2

########################################
## 4) Wait for health endpoint           ##
########################################
log "Waiting for backend to respond on health endpoint..."
for i in {1..60}; do
  if curl -sS http://localhost:3000/api/v1/health | grep -q 'status"\s*:\s*"ok"'; then
    log "Backend health check passed"
    break
  fi
  sleep 1
  if [ $i -eq 60 ]; then log "Backend health check timeout"; fi
done

########################################
## 5) Lint / Typecheck / Unit tests  ##
########################################
log "Running lint..."
npm run lint &> "${LOGS_DIR}/lint.log" || true

log "Running typecheck..."
npm run typecheck &> "${LOGS_DIR}/typecheck.log" || true

log "Running unit tests..."
npm test &> "${LOGS_DIR}/unit_tests.log" || true

log "Running build..."
npm run build &> "${LOGS_DIR}/build.log" || true

########################################
## 6) API smoke tests (optional)       ##
########################################
log "Running API smoke tests (test-api.sh)"
bash scripts/test-api.sh &> "${LOGS_DIR}/api_smoke.log" || true

########################################
## 7) Summary report                   ##
########################################
end_ts=$(date +%s)
duration=$((end_ts - start_ts))

log "QA run finished in ${duration}s"
log "Logs available at ${LOGS_DIR} and report at ${REPORT_FILE}"

echo "\n=== QA REPORT SUMMARY ===" >> "${REPORT_FILE}"
echo "Duration: ${duration}s" >> "${REPORT_FILE}"
echo "Backend PID: $(cat /tmp/workai_backend_pid 2>/dev/null || echo 'n/a')" >> "${REPORT_FILE}"
echo "Lint: $(grep -i 'lint' ${LOGS_DIR}/lint.log >/dev/null 2>&1; echo $?)" >> "${REPORT_FILE}"
echo "Typecheck: $(grep -i 'typecheck' ${LOGS_DIR}/typecheck.log >/dev/null 2>&1; echo $?)" >> "${REPORT_FILE}"
echo "Unit tests: $(grep -i 'Tests' ${LOGS_DIR}/unit_tests.log >/dev/null 2>&1; echo $?)" >> "${REPORT_FILE}"
echo "Build: $(grep -i 'Build' ${LOGS_DIR}/build.log >/dev/null 2>&1; echo $?)" >> "${REPORT_FILE}"
echo "API smoke: $(grep -i 'Complete' ${LOGS_DIR}/api_smoke.log >/dev/null 2>&1; echo $?)" >> "${REPORT_FILE}"

log "Done. Please review the QA report at ${REPORT_FILE}."
