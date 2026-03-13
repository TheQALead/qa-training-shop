#!/bin/sh
set -e

echo "Starting QA Training Shop..."

# Ensure database directory exists
mkdir -p /app/db

# Run database initialization
echo "Initializing database..."
cd /app
node scripts/init-data.js

# Start the application
echo "Starting server..."
exec node server.js
