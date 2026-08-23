// OIer-Helper Vercel Serverless API
const { OPENAI_API_KEY, OPENAI_BASE_URL = 'https://api.agnes-ai.cn/v1', OPENAI_MODEL = 'agnes-2.5-flash' } = process.env;

function buildSystemPrompt() {
    return `你是 OIer-Helper，一个专为信息学竞赛学生设计的算法学习助手。
你的语气要耐心友好，像真正的助教，不做居高临下的评判。
重要：给出的代码仅供学习参考，禁止直接复制提交，鼓励学生自己理解实现。

回答规范：
1. 使用 Emoji 让内容更生动
2. 结构清晰，使用标题、列表、代码块
3. 先给思路提示，再给完整代码
4. 注明参考资料来源
5. 每段代码后加上学术诚信声明`;
}

function buildPrompt(mode, input, issue) {
    const systemPrompt = buildSystemPrompt();
    const prompts = {
        problem: `${systemPrompt}

用户发来了一道题目链接：${input}
请执行以下流程：
1. 分析题目类型和核心考点
2. 给出解题思路（分步骤）
3. 说明为什么这个算法正确
4. 提供 C++ 参考代码（标注"仅供参考"）
5. 分析时空复杂度
6. 列出常见易错点

如果链接无法访问，请询问用户提供更多题目信息。`,

        algorithm: `${systemPrompt}

用户想学习算法：${input}
请系统讲解：
1. 基本概念（通俗语言解释）
2. 核心步骤（分点列出）
3. 正确性证明或直观解释
4. C++ 代码模板（带注释）
5. 扩展内容（变体、优化）
6. 练习题推荐（3-5道）
7. 参考资料来源

使用 OI Wiki、算法竞赛书籍等权威资料。`,

        debug: `${systemPrompt}

用户发来了一段代码，想让我帮忙找错误。
问题描述：${issue || '未指定'}
代码内容：
\`\`\`cpp
${input}
\`\`\`

请：
1. 分析代码逻辑，定位 Bug
2. 指出具体错误行和原因
3. 给出修正后的代码（对比展示差异）
4. 解释为什么这样修改是正确的
5. 提示测试用例验证方法

常见错误类型：CE（编译错误）、RE（运行错误）、WA（答案错误）、TLE（超时）`,

        exercise: `${systemPrompt}

用户学完了知识点：${input}
想练习，请推荐：
1. 按难度递增推荐 3-5 道题
2. 每道题标注：考点、难度、解题方向提示（不直接给答案）
3. 生成学习路径建议

优先推荐洛谷、Codeforces 等知名 OJ 的题目。`,

        notes: `${systemPrompt}

用户想整理知识点笔记：${input}
请生成结构化笔记：
1. 核心概念和定义
2. 关键公式/定理
3. C++ 代码模板
4. 典型题型和解题套路
5. 易错点总结
6. 相关题目推荐

使用 Markdown 格式，结构清晰。`
    };
    return prompts[mode] || prompts.problem;
}

async function callOpenAI(prompt) {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
    const data = await response.json();
    return data.choices[0].message.content;
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (req.url === '/api/config' && req.method === 'GET') {
        return res.json({ valid: !!OPENAI_API_KEY, provider: 'openai' });
    }

    if (req.url === '/api/generate' && req.method === 'POST') {
        try {
            let body = '';
            for await (const chunk of req.body) body += chunk;
            const { mode, input, issue } = JSON.parse(body || '{}');

            if (!mode || !input) {
                return res.status(400).json({ error: '缺少必要参数' });
            }
            if (!OPENAI_API_KEY) {
                return res.status(500).json({ error: '未配置 OPENAI_API_KEY' });
            }

            const prompt = buildPrompt(mode, input, issue);
            const content = await callOpenAI(prompt);
            return res.json({ success: true, content, mode });
        } catch (error) {
            console.error('API error:', error.message);
            return res.status(500).json({
                error: 'AI 服务暂时不可用，请稍后重试',
                details: error.message
            });
        }
    }

    res.status(404).json({ error: 'Not found' });
}
