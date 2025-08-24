Param(
    [int]$maxAttempts = 100,
    [int]$delaySeconds = 10
)

Write-Host "Starting unattended build loop (maxAttempts=$maxAttempts, delaySeconds=$delaySeconds)"

$attempt = 0
while ($attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "Attempt #${attempt}: running production build with mock flags..."
    $env:FORCE_MOCK_SUPABASE = '1'
    $env:DISABLE_WASM_HASH_CACHE = '1'

    pnpm -s build
    $exitCode = $LASTEXITCODE

    if ($exitCode -eq 0) {
        Write-Host "Build succeeded on attempt #${attempt}"
        exit 0
    }

    Write-Host "Build failed (exit code $exitCode). Sleeping for $delaySeconds seconds before retry..."
    Start-Sleep -Seconds $delaySeconds
}

Write-Host "Reached max attempts ($maxAttempts). Exiting with failure."
exit 1
