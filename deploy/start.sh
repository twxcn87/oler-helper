#!/bin/bash
# OIer-Helper Server 启动脚本
set -e

echo "🚀 正在启动 OIer-Helper API 服务..."

# 安装依赖（如果不存在）
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install --production
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告：未找到 .env 文件"
    echo "   请复制 .env.example 并填写 API Key："
    echo "   cp .env.example .env"
    exit 1
fi

# 启动服务
echo "✅ 启动服务..."
node server.js
