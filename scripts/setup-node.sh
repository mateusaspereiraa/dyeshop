#!/usr/bin/env bash
set -euo pipefail

echo "→ DyeShop setup: nvm + Node 18 + project deps"

# Detect curl or wget
if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  echo "Error: curl or wget is required to install nvm. Please install one and re-run."
  exit 1
fi

# Install nvm if missing
if command -v nvm >/dev/null 2>&1; then
  echo "nvm already installed"
else
  echo "Installing nvm..."
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  else
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  fi
fi

# Load nvm into this shell
export NVM_DIR="${XDG_CONFIG_HOME:-$HOME/.nvm}"
# shellcheck source=/dev/null
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
else
  echo "Could not find nvm after install. Please restart your shell and run this script again."
  exit 1
fi

# Install and use Node 18
echo "Installing Node 18..."
nvm install 18
nvm alias default 18
nvm use 18

echo "Node: $(node -v)"
echo "npm: $(npm -v)"

# Install project deps
echo "Removing any existing node_modules and lock file (safe in development)..."
rm -rf node_modules package-lock.json

echo "Installing project dependencies (npm install). This might take a minute..."
npm install

# Optional: Playwright browsers
read -r -p "Install Playwright browsers now (recommended for E2E tests)? [y/N] " install_playwright
if [[ "$install_playwright" =~ ^([yY][eE][sS]|[yY])$ ]]; then
  echo "Installing Playwright browsers..."
  npx playwright install
fi

echo "\nDone. Next steps:"
echo "  - Run unit tests: npm test"
echo "  - If using DB: npx prisma migrate dev --name init && npm run seed"
echo "  - To test Stripe locally: docs/STRIPE_TESTING.md"

exit 0
