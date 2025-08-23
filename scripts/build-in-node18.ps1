# Run this from project root in PowerShell to build inside Node 18 Docker container
param(
  [string]$imageTag = "dongusa-build-node18:latest"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Output "Building Docker image $imageTag (this will install dependencies inside the image)..."
docker build -t $imageTag .

if ($LASTEXITCODE -ne 0) { Write-Error "Docker build failed"; exit 1 }

Write-Output "Running build inside container (mounting current directory as volume)..."
# Mount current directory and run build inside container
docker run --rm -e CI=true -v ${PWD}:/app -w /app $imageTag pnpm build

if ($LASTEXITCODE -ne 0) { Write-Error "pnpm build failed inside container"; exit 1 }

Write-Output "Build completed inside Node 18 container. Artifacts (if any) are in the current folder." 
