@echo off
setlocal EnableDelayedExpansion

if "%~1"=="" (
  echo Error: Please provide a port number.
  echo Usage: start.bat ^<PORT^>
  exit /b 1
)

set PORT=%~1

echo Installing dependencies...
call npm install

echo Starting infrastructure...
docker compose up -d db

echo Waiting for PostgreSQL to become ready...
for /L %%i in (1,1,30) do (
  docker compose exec -T db pg_isready >nul 2>&1
  if !ERRORLEVEL! EQU 0 (
    echo PostgreSQL is ready!
    goto ready
  )
  echo Waiting...
  timeout /t 2 /nobreak >nul
)

echo Error: Postgres did not become ready in time
exit /b 1

:ready
echo Running database migrations...
call npm run db:push

echo Starting High Availability API on port %PORT%...
call npm run dev