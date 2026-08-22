// preload.js - 为渲染进程提供安全的 API 访问
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getVersion: () => ipcRenderer.invoke('get-version'),

  // 打开外部链接
  openUrl: (href) => ipcRenderer.send('open-url', href),

  // 显示通知
  notify: (title, body) => ipcRenderer.send('notify', title, body),

  // 安全的 HTTP 请求代理（通过 IPC 发送到主进程）
  fetch: (options) => ipcRenderer.invoke('fetch-request', options)
})