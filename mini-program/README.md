# OIer-Helper 微信小程序版

## 功能特点

与 Web 版本功能完全一致，包含以下 5 大模块：

| 功能 | 说明 |
|------|------|
| 📝 题目解析 | 粘贴 OJ 题目链接，AI 分析并提供解题思路 |
| 📚 算法讲解 | 输入算法名称，系统讲解概念、步骤、代码模板 |
| 🔍 代码 Debug | 粘贴 C++ 代码，找出 CE/RE/WA/TLE 错误并给出修正方案 |
| ✏️ 练习题 | 根据知识点推荐 3-5 道梯度难度练习题 |
| 📒 笔记整理 | 生成结构化的学习笔记 |

## 快速开始

### 1. 获取 AppID

在微信公众平台注册小程序账号，获得 AppID：
- 访问 https://mp.weixin.qq.com
- 注册小程序账号
- 在"设置" → "开发设置"中复制 AppID

### 2. 配置项目

打开 `project.config.json`，将 `appid` 字段替换为你的 AppID：

```json
{
  "appid": "wx1234567890abcdef",  // 替换为你的 AppID
  ...
}
```

### 3. 导入项目

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具，选择"导入项目"
3. 项目目录选择：`D:/AI project\OIer-Helper\mini-program`
4. AppID 填写你的小程序 AppID
5. 点击"导入"

### 4. 运行调试

- 导入成功后，工具会自动编译运行
- 可以在模拟器中预览效果
- 连接真机可扫描二维码在手机上测试

## API 配置

小程序默认连接本地服务器 `http://localhost:8080`。

如需连接远程服务器，修改 `app.js` 中的 `apiBase`：

```javascript
globalData: {
  apiBase: 'https://your-server.com',  // 替换为实际服务器地址
  userInfo: null
}
```

**注意**：微信小程序要求使用 HTTPS 协议，本地调试可使用 http://localhost。

## 发布上线

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台 → 管理 → 版本管理
4. 提交审核
5. 审核通过后发布

## 项目结构

```
mini-program/
├── app.js              # 小程序入口文件
├── app.json            # 小程序全局配置
├── app.wxss            # 全局样式
├── project.config.json # 项目配置（需替换 AppID）
├── sitemap.json        # 搜索配置
├── .eslintrc.js        # ESLint 配置
└── pages/
    └── index/          # 主页（包含所有功能）
        ├── index.js    # 逻辑
        ├── index.wxml  # 结构
        └── index.wxss  # 样式
```

## 注意事项

1. 首次使用前需要启动服务器：
   ```bash
   cd "D:/AI project/OIer-Helper/server"
   npm start
   ```

2. 微信小程序有请求域名白名单限制，开发阶段可在开发者工具中勾选"不校验合法域名"

3. 生产环境需要在微信公众平台配置服务器域名白名单
