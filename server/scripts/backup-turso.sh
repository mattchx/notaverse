#!/bin/bash

# Create backup directory
mkdir -p backups

# Get timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Dump the database using SQL dump
echo "Creating backup..."
echo ".dump" | turso db shell notaverse-db > "backups/notaverse-$TIMESTAMP.db"

echo "Backup complete!"