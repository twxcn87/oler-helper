// mini-program/pages/index/index.js
// OIer-Helper 微信小程序 - 接入真实 AI API

// API 地址配置 - 使用 Vercel 在线部署
const API_BASE = 'https://shame-tomatoes-contest-screen.trycloudflare.com';

// Markdown 转 HTML（简单实现）
function markdownToHTML(md) {
  if (!md) return '';
  let html = md
    // 标题
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // 粗体和斜体
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // 代码块
    .replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // 列表
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li>$1. $2</li>')
    // 分割线
    .replace(/^---$/gm, '<hr>')
    // 段落
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return '<p>' + html + '</p>';
}

Page({
  data: {
    currentMode: 'problem',
    loading: false,
    result: '',
    resultTitle: '',
    resultNodes: '',
    problemUrl: '',
    algorithmName: '',
    debugCode: '',
    debugIssue: '',
    exerciseTopic: '',
    notesTopic: ''
  },

  onLoad() {
    console.log('OIer-Helper 小程序加载')
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ currentMode: mode })
  },

  fillInput(e) {
    const text = e.currentTarget.dataset.text
    const mode = this.data.currentMode
    const fields = {
      'problem': 'problemUrl',
      'algorithm': 'algorithmName',
      'exercise': 'exerciseTopic',
      'notes': 'notesTopic'
    }
    const field = fields[mode]
    if (field) this.setData({ [field]: text })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    if (field) this.setData({ [field]: e.detail.value })
  },

  async generate(e) {
    const mode = e.currentTarget.dataset.mode
    let input = ''
    let issue = ''
    let title = ''

    switch(mode) {
      case 'problem':
        input = this.data.problemUrl.trim()
        title = '📋 题目解析结果'
        if (!input) {
          wx.showToast({ title: '请输入题目链接', icon: 'none' })
          return
        }
        break
      case 'algorithm':
        input = this.data.algorithmName.trim()
        title = '📚 算法讲解结果'
        if (!input) {
          wx.showToast({ title: '请输入算法名称', icon: 'none' })
          return
        }
        break
      case 'debug':
        input = this.data.debugCode.trim()
        issue = this.data.debugIssue.trim()
        title = '🔍 代码分析结果'
        if (!input) {
          wx.showToast({ title: '请粘贴你的代码', icon: 'none' })
          return
        }
        break
      case 'exercise':
        input = this.data.exerciseTopic.trim()
        title = '📝 练习题推荐'
        if (!input) {
          wx.showToast({ title: '请输入知识点名称', icon: 'none' })
          return
        }
        break
      case 'notes':
        input = this.data.notesTopic.trim()
        title = '📒 笔记整理结果'
        if (!input) {
          wx.showToast({ title: '请输入知识点名称', icon: 'none' })
          return
        }
        break
    }

    this.setData({
      loading: true,
      result: '',
      resultTitle: title,
      resultNodes: ''
    })

    try {
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${API_BASE}/api/generate`,
          method: 'POST',
          data: { mode, input, issue },
          header: { 'Content-Type': 'application/json' },
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        })
      })

      if (!response || !response.data) {
        throw new Error('网络请求失败，请检查服务器是否运行')
      }

      if (response.data && response.data.content) {
        // 将 Markdown 转换为 HTML
        const htmlContent = markdownToHTML(response.data.content)
        this.setData({
          result: response.data.content,
          resultNodes: htmlContent
        })
      } else {
        throw new Error(response.data?.error || '请求失败，服务器未返回有效内容')
      }
    } catch (error) {
      console.error('请求失败:', error)
      let errorMsg = '请求失败'
      if (error.errMsg) {
        if (error.errMsg.includes('timeout')) errorMsg = '请求超时，请检查网络'
        else if (error.errMsg.includes('fail')) errorMsg = '网络连接失败，请检查服务器地址'
      } else if (error.message) {
        errorMsg = error.message
      }
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
