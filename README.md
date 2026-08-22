# OIer-Helper - 算法学习助手

> 专为信息学竞赛学生设计的 AI 辅导工具，支持网页、微信小程序、桌面应用三个版本

## 📦 项目结构

```
D:\AI project\OIer-Helper\
├── web\                  # 网页版本
│   └── index.html        # 单文件部署，浏览器直接访问
├── mini-program\         # 微信小程序版本
│   └── pages\index\      # 首页代码
├── desktop-app\          # 桌面应用版本
│   ├── main.js           # Electron 主进程
│   ├── renderer.js       # 渲染进程
│   └── package.json      # 项目配置
├── server\               # 后端 API 服务
│   ├── server.js         # Express 服务
│   ├── package.json      # 依赖配置
│   └── .env.example      # 环境变量示例
├── README.md             # 项目说明
└── DEPLOY.md             # 部署指南
```

---

## 🚀 快速开始

### 1. 启动 API 服务

```bash
cd D:\AI project\OIer-Helper\server
npm install
copy .env.example .env
# 编辑 .env 填入你的 API Key
npm start
```

### 2. 使用网页版

直接打开 `web/index.html`，无需安装任何软件。

---

## 🤖 AI 配置

支持两种 AI 提供商：

| 提供商 | 地址 | 价格 | 特点 |
|--------|------|------|------|
| DeepSeek | platform.deepseek.com | ¥1/百万tokens | 性价比高，中文效果好 |
| OpenAI | platform.openai.com | $0.002/千tokens | 功能强大，生态完善 |

推荐使用 **DeepSeek**，价格便宜且对中文支持好。

---

## 📱 三个版本

### 网页版（推荐孩子使用）
- ✅ 无需安装
- ✅ 双击即可使用
- ✅ 支持所有浏览器
- ✅ 可部署到服务器

### 微信小程序
- ✅ 手机端随时使用
- ✅ 分享给同学
- ⚠️ 需要配置服务器域名

### 桌面应用
- ✅ Windows 安装包
- ✅ 离线可用（需本地 API）
- ✅ 系统托盘图标

---

## 🔧 功能列表

| 功能 | 说明 |
|------|------|
| 📝 题目解析 | 粘贴 OJ 链接，AI 分析题目并提供解题思路 |
| 📚 算法讲解 | 系统讲解算法原理、步骤、代码模板 |
| 🔍 代码Debug | 分析代码错误，给出修正建议 |
| ✏️ 练习题推荐 | 按知识点推荐梯度难度题目 |
| 📒 笔记整理 | 生成结构化学习笔记 |

---

## ⚠️ 学术诚信

本工具仅供学习参考：
- 代码仅供理解思路使用
- **禁止直接复制提交到 OJ**
- 鼓励学生自己理解和实现
- 培养独立思考能力

---

## 📄 许可证

MIT License

---

*祝你学习进步！* 🎉