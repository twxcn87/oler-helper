// renderer.js - 桌面应用渲染进程
let currentMode = 'problem';

async function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

async function generate() {
    const input = document.querySelector('input[type="text"]').value.trim();
    if (!input) {
        alert('请输入内容！');
        return;
    }

    const btn = document.querySelector('.btn-primary');
    const resultEl = document.getElementById('result');

    btn.disabled = true;
    btn.textContent = '分析中...';
    resultEl.parentElement.classList.remove('show');

    try {
        const response = await window.electronAPI.fetch({
            method: 'POST',
            url: 'http://localhost:8080/api/generate',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: currentMode, input })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '请求失败');
        }

        resultEl.textContent = data.content;
        resultEl.parentElement.classList.add('show');
    } catch (error) {
        alert('错误: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '开始分析';
    }
}

// 绑定按钮事件
document.querySelector('.btn-primary').addEventListener('click', generate);