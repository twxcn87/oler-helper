@echo off
chcp 65001 >nul
echo ====================================
echo    OIer-Helper API 服务启动器
echo ====================================
echo.

cd /d "%~dp0server"

echo [1/3] 检查 Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖，请稍候...
    npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)
echo [OK] 依赖已就绪

echo [3/3] 启动服务...
echo.
echo ====================================
echo    服务地址: http://localhost:8080
echo    API 地址: http://localhost:8080/api/generate
echo ====================================
echo.
echo 按 Ctrl+C 停止服务
echo.

node server.js

pause
