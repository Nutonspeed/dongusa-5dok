FROM node:18-bullseye

WORKDIR /app

# Enable corepack and pin pnpm to a stable version
RUN corepack enable && corepack prepare pnpm@8.6.0 --activate

# Copy package manifests first for better layer caching
COPY package.json pnpm-lock.yaml ./

# Install deps (we won't run build during image build to keep it fast)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy rest of the repo
COPY . .

# Default command: install (no-op if already installed) and build
CMD ["sh", "-c", "pnpm install && pnpm build"]
