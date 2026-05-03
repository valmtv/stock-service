#!/bin/bash
if [ -z "$1" ]; then
  echo "Error: Please provide a port number."
  echo "Usage: ./start.sh <PORT>"
  exit 1
fi

export PORT=$1

echo "Installing dependencies..."
npm install

echo "Starting infrastructure..."
docker compose up db -d

echo "Running database migrations..."
npm run db:push

echo "Starting High Availability API on port $PORT..."
npm run dev