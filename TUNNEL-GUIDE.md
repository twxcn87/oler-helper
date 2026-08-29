# OIer-Helper Tunnel 监控与重启

## 快速检查

在 PowerShell 中运行：

```powershell
curl https://initially-diverse-boards-creek.trycloudflare.com
```

如果能返回 `{"status":"ok"}` 或类似内容，说明 Tunnel 正常。
如果报错（连接失败/超时），说明 Tunnel 已断线。

---

## Tunnel 断线后的操作步骤

### 第一步：重启 Tunnel（在服务器上）

SSH 登录服务器：
```bash
ssh root@49.235.106.148
```

执行以下命令重启 Tunnel：
```bash
pkill -f cloudflared 2>/dev/null
sleep 2
nohup cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
sleep 5
grep "https://" /tmp/tunnel.log
```

最后一行会输出新的 Tunnel 地址，例如：
```
https://new-address-12345.trycloudflare.com
```

### 第二步：更新小程序代码（在本地）

复制上面得到的新地址，然后运行：

```powershell
cd "D:\AI project\OIer-Helper"
$newUrl = "https://新地址.trycloudflare.com"
(Get-Content mini-program/app.js -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content mini-program/app.js -Encoding UTF8
(Get-Content mini-program/pages/index/index.js -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content mini-program/pages/index/index.js -Encoding UTF8
git add mini-program/app.js mini-program/pages/index/index.js
git commit -m "update tunnel url"
git push
```

### 第三步：重新编译小程序

1. 微信开发者工具 → 清除缓存 → 重新编译
2. 真机扫码测试

---

## 永久解决方案

Quick Tunnel 每次重启都会生成新地址，长期维护成本高。

建议升级方案：
1. **Cloudflare Tunnel 固定域名**（推荐）：在 Cloudflare Zero Trust 控制台绑定一个自定义域名，地址就不会变了
2. **使用 Cloudflare Tunnels (Argo)**：需要 Cloudflare 企业版或 Pro 套餐
3. **使用 ngrok 免费版**：也是每次变地址，但稳定

---

## 自动监控脚本（可选）

已创建 `monitor-tunnel.ps1`，双击可自动检测 Tunnel 状态。
但脚本需要 SSH 免密登录才能自动重启，目前未配置。
如需配置免密登录，可以在服务器上执行：
```bash
ssh-keygen -t ed25519
cat ~/.ssh/id_ed25519.pub  # 复制公钥
# 然后在本机执行（把公钥添加到服务器）
ssh-copy-id root@49.235.106.148
```
