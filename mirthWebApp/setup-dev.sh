#!/bin/bash

set -e

# Function to install nvm if missing
install_nvm() {
  echo "nvm not found. Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
}

# Check for nvm
if ! command -v nvm >/dev/null 2>&1; then
  install_nvm
else
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# Check for Node.js v16.x
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Installing Node.js v16..."
  nvm install 16
  nvm use 16
else
  NODE_VERSION=$(node -v)
  if [[ ! $NODE_VERSION =~ ^v16\. ]]; then
    echo "Node.js v16.x is required. Installing and switching using nvm..."
    nvm install 16
    nvm use 16
  fi
fi

# Check for npm
if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed. Please install npm before continuing."
  exit 1
fi

# Check for concurrently (local or global)
if [ -f node_modules/.bin/concurrently ] || [ -f node_modules/.bin/concurrently.cmd ]; then
  HAS_CONCURRENTLY=true
elif npm list -g --depth=0 2>/dev/null | grep -q 'concurrently@'; then
  HAS_CONCURRENTLY=true
else
  HAS_CONCURRENTLY=false
fi
if [ "$HAS_CONCURRENTLY" != true ]; then
  echo "'concurrently' not found. Installing as a devDependency in the root..."
  npm install concurrently@^9.2.0 --save-dev --silent
fi

echo "Installing root dependencies..."
npm install --silent

echo "Installing client dependencies..."
cd client
npm install --silent
cd ..

echo "Installing server dependencies..."
cd server
npm install --silent
cd ..

echo "All dependencies installed!"
echo "You can now run: npm run dev" 