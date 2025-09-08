# Author: Hanny
# Safety: set -Eeuo pipefail + flock + this-action-only SSH

set -Eeuo pipefail
IFS=$'\n\t'

############################################
# Override-able env vars
############################################
BRANCH="${BRANCH:-main}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/do_coupon_key}"
REPO_DIR="${REPO_DIR:-}"                 # path to repo, empty for this in root dir
CLEAN="${CLEAN:-0}"                      # clean untracked files? 1 : 0
LOG_DIR_NAME="${LOG_DIR_NAME:-.deploy}"
PM2_APP="${PM2_APP:-CouponSys}"          # PM2 process name

############################################
# locate repo
############################################
if [[ -z "$REPO_DIR" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
  REPO_DIR="$SCRIPT_DIR"
fi

cd "$REPO_DIR"

if [[ ! -d .git ]]; then
  echo "[ERROR] $REPO_DIR is not a git repo (missing .git)"
  exit 1
fi

############################################
# simlock
############################################
LOCK_FILE="/tmp/$(basename "$REPO_DIR")-deploy.lock"
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "[WARN] Some deployment already executing, skipped."
  exit 0
fi

############################################
# logging (saved in the root dir)
############################################
LOG_DIR="$REPO_DIR/$LOG_DIR_NAME"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$(date '+%F_%H%M%S').log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "[INFO] ======== Deploy started at $(date '+%F %T') ========"
echo "[INFO] Repo: $REPO_DIR"
echo "[INFO] Branch: $BRANCH"
echo "[INFO] Log: $LOG_FILE"

############################################
# set SSH for this op
# StrictHostKeyChecking=accept-new trust this machine's fingerprint
############################################
GIT_SSH="ssh -i ${SSH_KEY} -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"

echo "[INFO] Fetching latest from origin..."
git -c core.sshCommand="$GIT_SSH" fetch --all --tags --prune

if [[ "$CLEAN" == "1" ]]; then
  echo "[INFO] Cleaning untracked files (git clean -fdx)..."
  git clean -fdx
fi

echo "[INFO] Reset to origin/${BRANCH}..."
git reset --hard "origin/${BRANCH}"

############################################
# Backend - install with lockfile first, if not back to npm i
############################################
echo "[INFO] Running backend developments -------------"
cd backend
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    echo "[INFO] Installing deps via npm ci..."
    npm ci
  else
    echo "[INFO] package-lock.json not exist, roll back to npm install..."
    npm install --no-audit --no-fund
  fi

  # PM2 reload (start if missing)
  if command -v pm2 >/dev/null 2>&1; then
    if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
      echo "[INFO] pm2 reload ${PM2_APP}"
      pm2 reload "$PM2_APP"
    else
      echo "[INFO] pm2 start ${PM2_APP} (not found, starting)"
      pm2 start npm --name "$PM2_APP" -- run start || true
    fi
  else
    echo "[WARN] pm2 not found; skip process restart."
  fi
else
  echo "[INFO] No package.json. Skip Node steps."
fi
cd ..

############################################
# Frontend - install with lockfile first, if not back to npm i
############################################
echo "[INFO] Running frontend developments -------------"
cd frontend
if [[ -f package.json ]]; then
  if [[ -f package-lock.json ]]; then
    echo "[INFO] Installing deps via npm ci..."
    npm ci
  else
    echo "[INFO] package-lock.json not exist, roll back to npm install..."
    npm install --no-audit --no-fund
  fi

  ##########################################
  # Only when build is presented, run build
  ##########################################
  if grep -q '"build"[[:space:]]*:' package.json; then
    echo "[INFO] Building..."
    npm run build
  else
    echo "[INFO] No build script, cannot npm run it, skipped."
  fi
else
  echo "[INFO] No package.json. Skip Node steps."
fi

echo "[INFO] ======== Deploy finished at $(date '+%F %T') ========"
