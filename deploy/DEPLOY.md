# OIer-Helper 腾讯云部署指南

## 📦 部署包位置
```
D:/AI project/OIer-Helper/deploy/
├── server.js          # 主程序
├── package.json       # 依赖配置
├── .env.example       # 环境变量示例
├── public/
│   └── index.html     # Web 界面
└── start.sh           # 启动脚本
```

---

## 🚀 部署步骤

### 第一步：登录腾讯云控制台

1. 访问 https://console.cloud.tencent.com/
2. 登录你的腾讯云账号
3. 进入「云服务器」或「云函数」控制台

### 第二步：创建服务器/云函数

#### 方式一：云服务器 CVM（推荐新手）
1. 点击「新建」→「云服务器」
2. 选择配置：
   - **地域**：选「香港」或「北京」
   - **实例规格**：选最低配置（1核1G即可）
   - **操作系统**：选 Ubuntu 20.04 LTS
   - **公网带宽**：选 1Mbps
3. 设置密码并创建实例
4. 创建成功后，记录**公网 IP 地址**

#### 方式二：云函数 SCF（Serverless）
1. 点击「云函数」→「创建函数」
2. 选择「自定义创建 Runtime」
3. 语言选「Node.js 16.x」
4. 上传代码包

---

### 第三步：上传代码

#### 如果使用云服务器：

1. 在本地打包部署文件：
```bash
# 压缩 deploy 目录
tar -czf oler-helper.tar.gz -C D:/AI\ project/OIer-Helper/deploy .
```

2. 上传到服务器：
```bash
scp -i 你的密钥.pem oler-helper.tar.gz root@你的公网IP:/root/
```

3. SSH 登录服务器：
```bash
ssh root@你的公网IP
```

4. 解压并安装：
```bash
tar -xzf oler-helper.tar.gz
cd deploy
npm install --production
```

#### 如果使用云函数：

1. 将 `deploy` 目录压缩为 `zip` 文件
2. 在云函数控制台上传代码包
3. 配置环境变量（见下一步）

---

### 第四步：配置环境变量

**重要**：将你的 API Key 配置到服务器中！

#### 方法一：使用 .env 文件
```bash
# 创建 .env 文件
nano .env
```

添加以下内容（从你的本地 .env 复制）：
```
OPENAI_API_KEY=sk-SKwJsoxMzDeoktPGosjkokcsat2HrUjyEF0RUzzLPKikk6iB
OPENAI_BASE_URL=https://api.agnes-ai.cn/v1
OPENAI_MODEL=agnes-2.5-flash
PORT=8080
NODE_ENV=production
```

#### 方法二：通过命令行设置
```bash
export OPENAI_API_KEY=sk-SKwJsoxMzDeoktPGosjkokcsat2HrUjyEF0RUzzLPKikk6iB
export OPENAI_BASE_URL=https://api.agnes-ai.cn/v1
export OPENAI_MODEL=agnes-2.5-flash
export PORT=8080
export NODE_ENV=production
```

---

### 第五步：启动服务

```bash
# 前台运行（测试用）
node server.js

# 后台运行（生产用）
nohup node server.js > server.log 2>&1 &

# 或使用 PM2 管理进程（推荐）
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

---

### 第六步：测试访问

1. 打开浏览器访问：
```
http://你的公网IP:8080/api/health
```

2. 应该返回：
```json
{"status":"ok","timestamp":"2026-08-22T..."}`}
```

3. 测试 API：
```
http://你的公网IP:8080/api/generate
POST: {"mode": "notes", "input": "动态规划"}
```

---

## 📱 更新小程序 API 地址

修改 `app.js` 和 `pages/index/index.js` 中的 API 地址：

```javascript
// 旧地址（局域网）
const API_BASE = 'http://192.168.1.8:8080';

// 新地址（公网服务器）
const API_BASE = 'http://你的公网IP:8080';
```

或者使用腾讯云默认域名（如果你有）：
```javascript
const API_BASE = 'http://xxx.gz.applinzi.com';
```

修改后重新编译小程序。

---

## 🔧 常见问题

### 1. 端口被占用
```bash
# 查看占用 8080 端口的进程
netstat -tlnp | grep 8080

# 杀掉进程
kill -9 <PID>
```

### 2. 防火墙拦截
```bash
# Ubuntu 开放端口
sudo ufw allow 8080/tcp

# 或使用 iptables
sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT
```

### 3. 服务启动失败
```bash
# 查看日志
tail -f server.log

# 检查 Node.js 版本
node --version  # 需要 v14+
```

### 4. API Key 错误
确认 `.env` 文件中的 API Key 正确，且网络可以访问 `api.agnes-ai.cn`

---

## 🎯 部署完成！

- Web 版本：`http://你的公网IP:8080`
- 小程序：已更新 API 地址，可直接使用
- 桌面应用：需更新 `renderer.js` 中的 API_BASE

