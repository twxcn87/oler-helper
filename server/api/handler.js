// OIer-Helper Vercel Serverless API (CommonJS)
const { OPENAI_API_KEY = '', OPENAI_BASE_URL = 'https://api.agnes-ai.cn/v1', OPENAI_MODEL = 'agnes-2.5-flash' } = process.env;

function buildPrompt(mode, input, issue) {
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

async function callOpenAI(prompt) {
    const res = await fetch(OPENAI_BASE_URL + '/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + OPENAI_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error('API error: ' + res.status + ' - ' + err);
    }
    const data = await res.json();
    return data.choices[0].message.content;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
        return;
    }

    if (req.url === '/api/config' && req.method === 'GET') {
        res.json({ valid: !!OPENAI_API_KEY, provider: 'openai' });
        return;
    }

    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const { mode, input, issue } = JSON.parse(body || '{}');
                if (!mode || !input) {
                    res.status(400).json({ error: '缺少必要参数' });
                    return;
                }
                if (!OPENAI_API_KEY) {
                    res.status(500).json({ error: '未配置 OPENAI_API_KEY' });
                    return;
                }
                const prompt = buildPrompt(mode, input, issue);
                const content = await callOpenAI(prompt);
                res.json({ success: true, content, mode });
            } catch (error) {
                console.error('API error:', error.message);
                res.status(500).json({ error: 'AI服务暂时不可用', details: error.message });
            }
        });
        return;
    }

    res.status(404).json({ error: 'Not found' });
};
