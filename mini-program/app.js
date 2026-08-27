// app.js
App({
  onLaunch() {
    // 检查登录状态
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定的是小程序调用云开发功能的默认环境
        //   该参数传入的是一个环境 ID（形如 xxx-yyy）
        //   因为小程序的环境 ID 是全局唯一的，您可以将此处设为您的云开发环境 ID
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {
      apiBase: 'http://49.235.106.148:3000',
      userInfo: null
    }
  },

  globalData: {
    apiBase: 'http://localhost:8080',
    userInfo: null
  }
})
