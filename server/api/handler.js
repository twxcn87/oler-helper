// Vercel Serverless Function - OIer-Helper API
module.exports = async function handler(req, res) {
    const { method, url, headers } = req;
    const pathname = new URL(url, 'http://localhost').pathname;
    
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const getEnv = (key) => process.env[key] || '';
    
    const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');
    const OPENAI_BASE_URL = getEnv('OPENAI_BASE_URL') || 'https://api.agnes-ai.cn/v1';
    const OPENAI_MODEL = getEnv('OPENAI_MODEL') || 'agnes-2.5-flash';
    
    // Health check
    if (pathname === '/api/health' && method === 'GET') {
        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    
    // Config endpoint
    if (pathname === '/api/config' && method === 'GET') {
        return res.json({
            mode: 'algorithm',
            model: OPENAI_MODEL,
            version: '1.0.0'
        });
    }
    
    // Generate endpoint
    if (pathname === '/api/generate' && method === 'POST') {
        const BODY = await readBody(req);
        const { mode, input, issue } = BODY || {};
        
        if (!input) {
            return res.status(400).json({ error: '请输入问题' });
        }
        
        if (!OPENAI_API_KEY) {
            return res.status(500).json({ error: '未配置 API Key' });
        }
        
        try {
            const promptText = buildPrompt(mode, input, issue || '');
            const response = await callAI(promptText, OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL);
            return res.json({ ...response, mode, input });
        } catch (e) {
            console.error('AI API error:', e.message);
            return res.status(500).json({ error: e.message });
        }
    }
    
    return res.status(404).json({ error: 'Not found' });
};

async function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
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
    
    const modeDesc = {
        algorithm: '算法教学',
        problem: '题目解析',
        debugging: '代码调试',
        learning: '学习规划'
    }[mode] || '算法学习';
    
    return `${system}\n\n用户问题（${modeDesc}）：\n${input}\n${issue ? '\n具体问题描述：\n' + issue : ''}\n\n请用中文回答，结构清晰。`;
}

async function callAI(prompt, apiKey, baseUrl, model) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
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
