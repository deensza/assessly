#!/bin/bash

# Fix and Run Assessly Script (Updated for Tailwind & DB Fix)

echo "--- Starting Assessly Final Fix and Run ---"

# 1. Backend Setup
echo "1. Setting up Backend..."
cd "/Users/denizakkaya/Desktop/Proje(Yaz.Müh.Temelleri.)/assessly-main/backend"
pip3 install -r requirements.txt
python3 init_db.py

# 2. Frontend Setup (Clean)
echo "2. Repairing Frontend..."
cd "/Users/denizakkaya/Desktop/Proje(Yaz.Müh.Temelleri.)/assessly-main/frontend"
rm -rf node_modules .next
# Ensure tailwind is cleanly installed in this directory
npm install --force

# 3. Start Everything
echo "3. Starting Services..."

# Start Backend in background
cd "/Users/denizakkaya/Desktop/Proje(Yaz.Müh.Temelleri.)/assessly-main/backend"
python3 run.py &
BACKEND_PID=$!

# Start Frontend
cd "/Users/denizakkaya/Desktop/Proje(Yaz.Müh.Temelleri.)/assessly-main/frontend"
# Next.js dev server with explicit cleanup
npm run dev

# Cleanup background process on exit
kill $BACKEND_PID
