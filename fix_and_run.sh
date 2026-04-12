#!/bin/bash

# Fix and Run Assessly Script (Updated for Nested Project)

echo "--- Starting Assessly Final Fix and Run ---"

# Ensure binaries are in PATH
export PATH="/opt/homebrew/bin:$PATH"

# Get the script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define Paths
BACKEND_DIR="$SCRIPT_DIR/assessly-main/backend"
FRONTEND_DIR="$SCRIPT_DIR/assessly-main/frontend"

# 1. Backend Setup
echo "1. Setting up Backend..."
cd "$BACKEND_DIR" || exit
python3 -m pip install -r requirements.txt
python3 init_db.py

# 2. Frontend Setup (Clean)
echo "2. Repairing Frontend..."
cd "$FRONTEND_DIR" || exit
rm -rf node_modules .next
# Ensure dependencies are installed
npm install --force

# 3. Start Everything
echo "3. Starting Services..."

# Start Backend in background
cd "$BACKEND_DIR" || exit
python3 run.py &
BACKEND_PID=$!

# Start Frontend
cd "$FRONTEND_DIR" || exit
# Next.js dev server
npm run dev

# Cleanup background process on exit
kill $BACKEND_PID
