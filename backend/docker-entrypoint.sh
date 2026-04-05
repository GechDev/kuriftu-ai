#!/bin/sh
set -e
mkdir -p /data
export DATABASE_URL="${DATABASE_URL:-file:/data/dev.db}"

# First invocation (as root): fix volume permissions, then re-exec as node.
if [ "$(id -u)" = "0" ]; then
  chown -R node:node /data
  exec su-exec node "$0" "$@"
fi

cd /app
npx prisma migrate deploy
exec node dist/index.js
