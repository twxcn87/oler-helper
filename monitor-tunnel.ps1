# OIer-Helper Tunnel 监控与重启脚本
# 用途：检测 Cloudflare Tunnel 是否在线，如断线则尝试重启
# 用法：双击运行或在 PowerShell 中执行：.\monitor-tunnel.ps1

$ErrorActionPreference = "Stop"
$TunnelUrl = "https://initially-diverse-boards-creek.trycloudflare.com"
$ServerIp = "49.235.106.148"
$ProjectRoot = Split-Path $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  OIer-Helper Tunnel 监控工具" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# --- 检测当前 Tunnel 是否在线 ---
Write-Host "[检测] 正在检查 Tunnel 状态..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $TunnelUrl -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "[✅ 在线] Tunnel 正常运行，无需操作。" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tunnel 地址：$TunnelUrl" -ForegroundColor Gray
        exit 0
    }
} catch {
    Write-Host "[❌ 离线] Tunnel 无法访问！" -ForegroundColor Red
}

# --- Tunnel 离线，尝试通过 SSH 重启 ---
Write-Host ""
Write-Host "[操作] 尝试通过 SSH 远程重启 Tunnel..." -ForegroundColor Yellow

$sshCmd = @'
pkill -f cloudflared 2>/dev/null
sleep 2
nohup cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
sleep 5
grep "https://" /tmp/tunnel.log
'@

try {
    $result = ssh root@$ServerIp $sshCmd -o ConnectTimeout=10 -o StrictHostKeyChecking=no
    Write-Host $result -ForegroundColor Gray
    Write-Host ""

    $newUrl = ($result | Select-String "https://.*\.trycloudflare\.com" | Select-Object -First 1).Line.Trim()
    if ($newUrl -and $newUrl.Length -gt 10) {
        Write-Host "[✅] Tunnel 已重启，新地址：$newUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "[⚠️] 注意：新地址已变化，需要更新小程序代码！" -ForegroundColor Red

        Write-Host "[操作] 正在自动更新小程序代码..." -ForegroundColor Yellow
        $appJsPath = Join-Path $ProjectRoot "mini-program\app.js"
        $indexJsPath = Join-Path $ProjectRoot "mini-program\pages\index\index.js"

        if (Test-Path $appJsPath) {
            (Get-Content $appJsPath -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content $appJsPath -Encoding UTF8
            Write-Host "  ✅ app.js 已更新" -ForegroundColor Green
        }
        if (Test-Path $indexJsPath) {
            (Get-Content $indexJsPath -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content $indexJsPath -Encoding UTF8
            Write-Host "  ✅ index.js 已更新" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "请执行 git 提交推送：" -ForegroundColor Cyan
        Write-Host "  cd `"D:\AI project\OIer-Helper`"" -ForegroundColor Gray
        Write-Host "  git add mini-program/app.js mini-program/pages/index/index.js" -ForegroundColor Gray
        Write-Host "  git commit -m `"自动更新 Tunnel 地址`"" -ForegroundColor Gray
        Write-Host "  git push" -ForegroundColor Gray
    } else {
        Write-Host "[❌] 重启失败，请手动到服务器操作。" -ForegroundColor Red
        Write-Host ""
        Write-Host "手动操作步骤：" -ForegroundColor Cyan
        Write-Host "  1. SSH 登录服务器：ssh root@49.235.106.148" -ForegroundColor Gray
        Write-Host "  2. 执行：" -ForegroundColor Gray
        Write-Host "     pkill -f cloudflared; sleep 2" -ForegroundColor Gray
        Write-Host "     nohup cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &" -ForegroundColor Gray
        Write-Host "     sleep 5 && grep 'https://' /tmp/tunnel.log" -ForegroundColor Gray
    }
} catch {
    Write-Host "[❌] SSH 连接失败：$_" -ForegroundColor Red
    Write-Host ""
    Write-Host "请手动 SSH 登录服务器重启 Tunnel：" -ForegroundColor Yellow
    Write-Host "  ssh root@49.235.106.148" -ForegroundColor Gray
    Write-Host "  # 然后按 DEPLOY-GUIDE.md 操作" -ForegroundColor Gray
}
