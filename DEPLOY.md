# OIer-Helper 部署指南

## 🚀 快速开始

### 第一步：获取 AI API Key

**推荐：DeepSeek（性价比高）**
1. 访问 https://platform.deepseek.com/
2. 注册账号并充值
3. 创建 API Key
4. 复制 Key 备用

**备选：OpenAI**
1. 访问 https://platform.openai.com/
2. 注册账号并充值
3. 创建 API Key

---

### 第二步：启动 API 服务

```bash
# 进入服务器目录
cd D:\AI project\OIer-Helper\server

# 安装依赖
npm install

# 复制环境变量文件
copy .env.example .env

# 编辑 .env 文件，填入你的 API Key
# 例如：
# DEEPSEEK_API_KEY=sk-your-key-here
# AI_PROVIDER=deepseek

# 启动服务
npm start
```

服务启动后访问：http://localhost:3000

---

### 第三步：使用三个版本

#### 网页版
直接双击 `web/index.html` 即可使用，或部署到服务器。

#### 微信小程序
1. 修改 `mini-program/pages/index/index.js` 中的 `API_BASE` 为你的服务器地址
2. 用微信开发者工具导入项目
3. 编译预览并上传发布

#### 桌面应用
```bash
cd D:\AI project\OIer-Helper\desktop-app
npm install
npm start
```

---

## 🔧 配置说明

### 环境变量（.env 文件）

```env
# AI 提供商
AI_PROVIDER=deepseek  # 可选: openai, deepseek

# DeepSeek API
DEEPSEEK_API_KEY=sk-your-key
DEEPSEEK_MODEL=deepseek-chat

# OpenAI API（备选）
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-3.5-turbo

# 服务器端口
PORT=3000
```

---

## 🌐 部署到云服务器

### 推荐方案：Vercel + Railway

**Vercel（前端部署）：**
1. 将项目推送到 GitHub
2. 登录 Vercel，导入项目
3. 自动部署，获得 URL

**Railway（API 部署）：**
1. 登录 https://railway.app/
2. 创建新项目，选择 Node.js
3. 上传 server 目录
4. 设置环境变量（API Key）
5. 部署完成，获取 API 地址

---

## ⚠️ 注意事项

1. **不要将 API Key 提交到 GitHub**
   - `.env` 文件已在 `.gitignore` 中
   - 部署时通过环境变量设置

2. **生产环境必须使用 HTTPS**
   - 小程序要求 HTTPS 域名
   - 可用 Let's Encrypt 免费证书

3. **限流和计费**
   - DeepSeek 约 ¥1/百万 tokens
   - 建议设置使用限制

---

## 📞 常见问题

**Q: API 调用失败？**
A: 检查 `.env` 文件中的 API Key 是否正确

**Q: 小程序无法请求服务器？**
A: 需要配置服务器域名白名单（微信公众平台）

**Q: 如何增加更多功能？**
A: 修改 `server.js` 中的 `buildPrompt` 函数

---

*祝你使用愉快！*