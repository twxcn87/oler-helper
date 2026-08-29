# OIer-Helper Tunnel Monitor and Restart Script
# Usage: Double-click or run in PowerShell: .\monitor-tunnel.ps1

$ErrorActionPreference = "Stop"
$TunnelUrl = "https://initially-diverse-boards-creek.trycloudflare.com"
$ServerIp = "49.235.106.148"
$ProjectRoot = Split-Path $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  OIer-Helper Tunnel Monitor" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if tunnel is alive
Write-Host "[Checking] Testing tunnel status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $TunnelUrl -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Tunnel is ONLINE and working." -ForegroundColor Green
        Write-Host ""
        Write-Host "URL: $TunnelUrl" -ForegroundColor Gray
        exit 0
    }
} catch {
    Write-Host "[ERROR] Tunnel is DOWN!" -ForegroundColor Red
}

# Try to restart via SSH
Write-Host ""
Write-Host "[Action] Attempting SSH restart..." -ForegroundColor Yellow

$sshCmd = 'pkill -f cloudflared 2>/dev/null; sleep 2; nohup cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &; sleep 5; grep "https://" /tmp/tunnel.log'

try {
    $result = ssh root@$ServerIp $sshCmd -o ConnectTimeout=10 -o StrictHostKeyChecking=no
    Write-Host $result -ForegroundColor Gray
    Write-Host ""

    $newUrl = ($result | Select-String "https://.*\.trycloudflare\.com" | Select-Object -First 1).Line.Trim()
    if ($newUrl -and $newUrl.Length -gt 10) {
        Write-Host "[SUCCESS] Tunnel restarted! New URL: $newUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "[NOTE] You need to update mini-program code with the new URL!" -ForegroundColor Red

        Write-Host "[Auto] Updating mini-program code..." -ForegroundColor Yellow
        $appJsPath = Join-Path $ProjectRoot "mini-program\app.js"
        $indexJsPath = Join-Path $ProjectRoot "mini-program\pages\index\index.js"

        if (Test-Path $appJsPath) {
            (Get-Content $appJsPath -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content $appJsPath -Encoding UTF8
            Write-Host "  OK: app.js updated" -ForegroundColor Green
        }
        if (Test-Path $indexJsPath) {
            (Get-Content $indexJsPath -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content $indexJsPath -Encoding UTF8
            Write-Host "  OK: index.js updated" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "Please run git commit and push:" -ForegroundColor Cyan
        Write-Host "  cd `"D:\AI project\OIer-Helper`"" -ForegroundColor Gray
        Write-Host "  git add mini-program/app.js mini-program/pages/index/index.js" -ForegroundColor Gray
        Write-Host "  git commit -m `"auto-update-tunnel-url`"" -ForegroundColor Gray
        Write-Host "  git push" -ForegroundColor Gray
    } else {
        Write-Host "[FAIL] Could not get new URL from server." -ForegroundColor Red
    }
} catch {
    Write-Host "[FAIL] SSH connection failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual steps:" -ForegroundColor Yellow
    Write-Host "  1. ssh root@$ServerIp" -ForegroundColor Gray
    Write-Host "  2. See DEPLOY-GUIDE.md for instructions" -ForegroundColor Gray
}
