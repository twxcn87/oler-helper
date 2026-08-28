# OIer-Helper 小程序部署备用指南

## 服务器重启后的操作步骤

### 第一步：重启 Tunnel

在服务器终端执行：

pkill -f cloudflared 2>/dev/null
sleep 1
nohup cloudflared tunnel --url http://localhost:3000 > /tmp/tunnel.log 2>&1 &
sleep 5
grep "https://" /tmp/tunnel.log

复制输出的地址，例如：https://xxxx.trycloudflare.com

---

### 第二步：更新小程序代码

方式一：把地址发给我，我自动更新推送（推荐）

方式二：自己操作

在本地电脑打开 PowerShell，执行：

cd "D:\AI project\OIer-Helper"

$newUrl = "https://你的新地址.trycloudflare.com"

(Get-Content mini-program/app.js -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content mini-program/app.js -Encoding UTF8
(Get-Content mini-program/pages/index/index.js -Raw) -replace 'https://[^`"]+\.trycloudflare\.com', $newUrl | Set-Content mini-program/pages/index/index.js -Encoding UTF8

git add mini-program/app.js mini-program/pages/index/index.js
git commit -m "更新 Tunnel 地址"
git push

---

### 第三步：重新编译小程序

1. 微信开发者工具 -> 清除缓存 -> 重新编译
2. 真机调试 -> 扫码测试

---

## 服务器端保持服务运行

如果 node 服务挂了，手动重启：

cd /root/server
PORT=3000 OPENAI_API_KEY="sk-SKwJsoxMzDeoktPGosjkokcsat2HrUjyEF0RUzzLPKikk6iB" OPENAI_BASE_URL="https://api.agnes-ai.cn/v1" OPENAI_MODEL="agnes-2.5-flash" nohup node server.js > server.log 2>&1 &
