#!/bin/bash
# 后台运行并守护进程
NODE_ENV=production nohup node server.js > server.log 2>&1 &
echo $! > server.pid
echo "服务已启动，PID: $(cat server.pid)"
echo "日志文件: server.log"
