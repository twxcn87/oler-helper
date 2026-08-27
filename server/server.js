// Render 部署 - OIer-Helper API
const http = require('http');

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.agnes-ai.cn/v1';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'agnes-2.5-flash';

const PORT = process.env.PORT || 3000;

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.setEncoding('utf8');
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try { resolve(body ? JSON.parse(body) : {}); }
            catch (e) { resolve({}); }
        });
        req.on('error', reject);
    });
}

function buildPrompt(mode, input, issue = '') {
    const system = '你是 OIer-Helper，一个专为信息学竞赛学生设计的算法学习助手。语气耐心友好，结构清晰，使用Emoji，先给思路再给代码，注明参考来源。';
    const modeDesc = { algorithm: '算法教学', problem: '题目解析', debugging: '代码调试', learning: '学习规划' }[mode] || '算法学习';
    return `${system}\n\n用户问题（${modeDesc}）：\n${input}\n${issue ? '\n具体问题描述：\n' + issue : ''}\n\n请用中文回答，结构清晰。`;
}

async function callAI(prompt, apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    try {
        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: OPENAI_MODEL,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.7
            }),
            signal: controller.signal
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`API错误: ${response.status} - ${err}`);
        }
        const data = await response.json();
        return { content: data.choices?.[0]?.message?.content || '无回复内容', tokens: data.usage?.total_tokens };
    } finally {
        clearTimeout(timeout);
    }
}

function send(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const method = req.method;

    // CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
        res.end();
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY || '';

    // Health check
    if (pathname === '/api/health' && method === 'GET') {
        return send(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
    }

    // Config
    if (pathname === '/api/config' && method === 'GET') {
        return send(res, 200, { mode: 'algorithm', model: OPENAI_MODEL, version: '1.0.0' });
    }

    // Generate
    if (pathname === '/api/generate' && method === 'POST') {
        const body = await parseBody(req);
        const { mode, input, issue } = body;
        if (!input) return send(res, 400, { error: '请输入问题' });
        if (!apiKey) return send(res, 500, { error: '未配置 API Key' });
        try {
            const promptText = buildPrompt(mode, input, issue || '');
            const response = await callAI(promptText, apiKey);
            return send(res, 200, { ...response, mode, input });
        } catch (e) {
            console.error('AI API error:', e.message);
            return send(res, 500, { error: e.message });
        }
    }

    return send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
    console.log(`🚀 OIer-Helper API running on port ${PORT}`);
});
