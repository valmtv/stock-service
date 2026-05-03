#!/bin/bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Error: Please provide a port number."
  echo "Usage: ./start.sh <PORT>"
  exit 1
fi

export PORT="$1"

echo "Starting infrastructure..."
docker compose up -d db

echo "Waiting for PostgreSQL to become ready..."
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready >/dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  
  if [ "$i" -eq 30 ]; then
    echo "Error: Postgres did not become ready in time"
    exit 1
  fi
  
  echo "Waiting..."
  sleep 2
done

echo "Running database migrations..."
npm run db:push

echo "Starting High Availability API on port $PORT..."
npm run dev