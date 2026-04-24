#!/usr/bin/env bash
set -euo pipefail

# Run backend and AI swarm concurrently, capturing logs for diagnosis
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"
BACKEND_LOG="${LOG_DIR}/backend.log"
SWARM_LOG="${LOG_DIR}/swarm.log"
COMBINED_LOG="${LOG_DIR}/run-all.log"

mkdir -p "${LOG_DIR}"

echo "Starting backend and swarm. Logs -> ${LOG_DIR}" | tee -a "${COMBINED_LOG}"

# Clean up any previous PIDs
if [ -f /tmp/workai_backend.pid ]; then
  kill -TERM "$(cat /tmp/workai_backend.pid)" 2>/dev/null || true
  rm -f /tmp/workai_backend.pid
fi
if [ -f /tmp/workai_swarm.pid ]; then
  kill -TERM "$(cat /tmp/workai_swarm.pid)" 2>/dev/null || true
  rm -f /tmp/workai_swarm.pid
fi

echo "[INIT] Installing dependencies (root)" | tee -a "${COMBINED_LOG}"
( cd "${ROOT_DIR}" && npm ci ) &> /dev/null || true

echo "[LAUNCH] Backend (dev)" | tee -a "${COMBINED_LOG}"
( cd "${ROOT_DIR}" && PORT=3001 npm run dev ) &> "${BACKEND_LOG}" & echo $! > /tmp/workai_backend.pid

echo "[LAUNCH] AI Swarm" | tee -a "${COMBINED_LOG}"
( cd "${ROOT_DIR}" && npm run swarm ) &> "${SWARM_LOG}" & echo $! > /tmp/workai_swarm.pid

echo "[LOGS] Tail logs. Press Ctrl+C to stop." | tee -a "${COMBINED_LOG}"
tail -F "${BACKEND_LOG}" "${SWARM_LOG}" | tee -a "${COMBINED_LOG}"
