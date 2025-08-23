If your local Node.js is unsupported (e.g., v22) you can build the project inside a Node 18 Docker container.

Requirements:

- Docker Desktop installed and running.
- PowerShell (Windows) or any shell with Docker.

Quick start (PowerShell):

1. From project root run:
   .\scripts\build-in-node18.ps1

This builds a Docker image with Node 18, installs dependencies, and runs `pnpm build` inside the container with the project mounted. Build artifacts will appear in your host project directory.

Notes:

- The Dockerfile pins pnpm to a stable v8 to match CI expectations.
- This avoids changing your local Node version and reproduces CI environment locally.
