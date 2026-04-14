#!/bin/bash
# Serve production build locally to test GitHub Pages behavior

set -e

echo "🔨 Building production site (with pathPrefix=/blog)..."
npm run build:prod

echo ""
echo "📋 Checking generated output..."
echo "----------------------------------------"
echo ""

echo "🌐 Setting up server to simulate GitHub Pages..."
echo "----------------------------------------"

# Create symlink so /blog/img/... resolves to img/... in docs/
if [ -L "docs/blog" ]; then
  rm docs/blog
fi
if [ -d "docs/blog" ] && [ ! -L "docs/blog" ]; then
  echo "⚠️  Backing up existing docs/blog directory..."
  mv docs/blog docs/blog.backup.$(date +%s)
fi
if [ ! -e "docs/blog" ]; then
  echo "Creating symlink: docs/blog -> ."
  cd docs && ln -s . blog && cd ..
fi

echo ""
echo "✅ Ready! Starting server..."
echo ""
echo "📍 Open in browser: http://localhost:8080/blog/"
echo "   (This simulates https://locke0.github.io/blog/)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python first, fallback to http-server
if command -v python3 &> /dev/null; then
  python3 -m http.server 8080 --directory docs
elif command -v python &> /dev/null; then
  python -m http.server 8080 --directory docs
else
  echo "Python not found, using http-server..."
  npx http-server docs -p 8080
fi

