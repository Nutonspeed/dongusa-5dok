# PowerShell script to build project and save error log
Write-Output "Starting build..."
pnpm run build 2>&1 | Tee-Object -FilePath "logs/build-error.log"

# Show last 20 lines of error log for quick view
Write-Output "\n--- Last 20 lines of build-error.log ---"
Get-Content "logs/build-error.log" -Tail 20
