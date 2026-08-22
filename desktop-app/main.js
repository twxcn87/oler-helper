// main.js - Electron 主进程
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'build', 'icon.ico'),
    title: 'OIer-Helper',
    backgroundColor: '#667eea'
  })

  // 加载 Web 版本（localhost:8080）
  mainWindow.loadURL('http://localhost:8080')

  // 创建菜单
  const menu = Menu.buildFromTemplate([
    {
      label: '文件',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于 OIer-Helper',
          click: () => {
            const { dialog } = require('electron')
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'OIer-Helper v1.0\n算法学习助手',
              buttons: ['确定']
            })
          }
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
