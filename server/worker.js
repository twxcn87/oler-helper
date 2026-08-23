// Cloudflare Worker - OIer-Helper API
// 环境变量通过 fetch 函数的 env 参数获取，不需要 process.env

// HTML 内容（内嵌）
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OIer-Helper - 算法学习助手</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        .header { text-align: center; color: white; margin-bottom: 30px; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .card { background: white; border-radius: 16px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); margin-bottom: 20px; }
        .mode-tabs { display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
        .mode-tab { flex: 1; min-width: 120px; padding: 12px 20px; border: 2px solid #e0e0e0; border-radius: 10px; background: white; cursor: pointer; transition: all 0.3s; text-align: center; font-size: 14px; font-weight: 500; }
        .mode-tab:hover { border-color: #667eea; background: #f5f3ff; }
        .mode-tab.active { border-color: #667eea; background: #667eea; color: white; }
        .mode-tab .icon { font-size: 24px; display: block; margin-bottom: 5px; }
        .input-section { margin-bottom: 20px; }
        .input-section label { display: block; font-weight: 600; color: #333; margin-bottom: 8px; }
        .input-section textarea, .input-section input[type="text"] { width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; transition: border-color 0.3s; }
        .input-section textarea:focus, .input-section input[type="text"]:focus { outline: none; border-color: #667eea; }
        .btn { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .result { margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 10px; border-left: 4px solid #667eea; display: none; }
        .result.show { display: block; }
        .result pre { white-space: pre-wrap; word-wrap: break-word; font-family: "Fira Code", monospace; font-size: 13px; line-height: 1.6; }
        .loading { text-align: center; padding: 20px; color: #666; display: none; }
        .loading.show { display: block; }
        .spinner { display: inline-block; width: 20px; height: 20px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 10px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .error { color: #e74c3c; padding: 10px; background: #fdf2f2; border-radius: 8px; margin-top: 10px; display: none; }
        .error.show { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 OIer-Helper</h1>
            <p>算法学习助手 - 信息学竞赛必备工具</p>
        </div>
        <div class="card">
            <div class="mode-tabs">
                <div class="mode-tab active" data-mode="problem"><span class="icon">📝</span>题目分析</div>
                <div class="mode-tab" data-mode="algorithm"><span class="icon">📚</span>算法学习</div>
                <div class="mode-tab" data-mode="debug"><span class="icon">🐛</span>代码调试</div>
                <div class="mode-tab" data-mode="exercise"><span class="icon">✏️</span>练习推荐</div>
                <div class="mode-tab" data-mode="notes"><span class="icon">📋</span>知识点整理</div>
            </div>
            <div class="input-section">
                <label>输入内容</label>
                <textarea id="input" rows="4" placeholder="请输入题目链接、算法名称、代码或知识点..."></textarea>
            </div>
            <div class="input-section" id="issue-section" style="display:none">
                <label>问题描述</label>
                <input type="text" id="issue" placeholder="描述你的问题...">
            </div>
            <button class="btn" id="submit">开始分析</button>
            <div class="loading" id="loading"><span class="spinner"></span>正在调用 AI 分析中...</div>
            <div class="error" id="error"></div>
            <div class="result" id="result"><pre id="result-content"></pre></div>
        </div>
    </div>
    <script>
        const API_BASE = window.location.origin;
        let currentMode = 'problem';
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMode = tab.dataset.mode;
                document.getElementById('issue-section').style.display = currentMode === 'debug' ? 'block' : 'none';
            });
        });
        document.getElementById('submit').addEventListener('click', async () => {
            const input = document.getElementById('input').value.trim();
            const issue = document.getElementById('issue').value.trim();
            if (!input) { alert('请输入内容'); return; }
            const btn = document.getElementById('submit');
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            const error = document.getElementById('error');
            btn.disabled = true;
            loading.classList.add('show');
            result.classList.remove('show');
            error.classList.remove('show');
            try {
                const res = await fetch(API_BASE + '/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: currentMode, input, issue })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || '请求失败');
                result.classList.add('show');
                document.getElementById('result-content').textContent = data.content;
            } catch (e) {
                error.classList.add('show');
                error.textContent = e.message;
            } finally {
                btn.disabled = false;
                loading.classList.remove('show');
            }
        });
    </script>
</body>
</html>`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        
        // CORS 预检
        if (request.method === 'OPTIONS') {
            return new Response('', {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                }
            });
        }

        // 健康检查
        if (url.pathname === '/api/health' && request.method === 'GET') {
            return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, {
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        // 配置检查
        if (url.pathname === '/api/config' && request.method === 'GET') {
            return Response.json({ valid: !!env.OPENAI_API_KEY, provider: 'openai' }, {
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        // API 生成
        if (url.pathname === '/api/generate' && request.method === 'POST') {
            return handleGenerate(env, request);
        }

        // 返回静态 HTML
        return new Response(HTML_CONTENT, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
};

async function handleGenerate(env, request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: '无效的 JSON 数据' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { mode, input, issue } = body;
    if (!mode || !input) {
        return Response.json({ error: '缺少必要参数' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    if (!env.OPENAI_API_KEY) {
        return Response.json({ error: '未配置 OPENAI_API_KEY' }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const prompt = buildPrompt(mode, input, issue, env);
    
    try {
        const response = await fetch(env.OPENAI_BASE_URL + '/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + env.OPENAI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: env.OPENAI_MODEL || 'agnes-2.5-flash',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            }),
            signal: AbortSignal.timeout ? AbortSignal.timeout(55000) : undefined
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error('API error: ' + response.status + ' - ' + errText.substring(0, 200));
        }

        const data = await response.json();
        return Response.json({
            success: true,
            content: data.choices[0].message.content,
            mode
        }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('API error:', error.message);
        return Response.json({
            error: 'AI服务暂时不可用',
            details: error.message
        }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}

function buildPrompt(mode, input, issue, env) {
    const sys = '你是 OIer-Helper，一个专为信息学竞赛学生设计的算法学习助手。你的语气要耐心友好，像真正的助教。重要：给出的代码仅供学习参考，禁止直接复制提交。';
    const prompts = {
        problem: sys + '\n\n用户发来了一道题目链接：' + input + '\n请分析题目并给出解题思路和C++参考代码。',
        algorithm: sys + '\n\n用户想学习算法：' + input + '\n请系统讲解概念、步骤和C++代码模板。',
        debug: sys + '\n\n用户发来了一段代码，请帮忙找错误。\n问题：' + (issue || '未指定') + '\n代码：\n' + input,
        exercise: sys + '\n\n用户学完了知识点：' + input + '\n请推荐练习题。',
        notes: sys + '\n\n用户想整理知识点笔记：' + input + '\n请生成结构化笔记。'
    };
    return prompts[mode] || prompts.problem;
}
