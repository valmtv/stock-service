#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./start.sh <PORT>"
  exit 1
fi

export PORT=$1

docker compose up db -d
npm run db:push
npm run dev
