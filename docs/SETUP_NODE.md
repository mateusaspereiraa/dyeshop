# Setup Node (nvm) and Install Project Dependencies

This script automates installing nvm (if missing), Node 18, and project dependencies for DyeShop.

Usage

1. Make the script executable (already done in the repo):
   - ./scripts/setup-node.sh

2. The script will:
   - Install nvm if not present
   - Install Node 18 and set it as default
   - Remove `node_modules` and `package-lock.json`
   - Run `npm install`
   - Optionally install Playwright browsers (`npx playwright install`)

Notes

- The script is idempotent and safe to run multiple times.
- If the nvm installation added lines to your shell profile, you may need to restart your terminal or `source ~/.nvm/nvm.sh` to make `nvm` available in new shells.
- If you prefer not to remove `node_modules` automatically, edit the script to skip that step.

If you prefer Docker-based setup instead, let me know and I can add a Dockerfile / docker-compose to run tests inside a Node 18 container.
