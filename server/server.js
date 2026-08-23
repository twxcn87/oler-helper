// server.js - OIer-Helper 后端 API 服务
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // 静态文件

// 检查 API 配置
function checkAPIConfig() {
    const aiProvider = process.env.AI_PROVIDER || 'openai';
    
    if (aiProvider === 'openai') {
        if (!process.env.OPENAI_API_KEY) {
            return { valid: false, error: '未配置 OPENAI_API_KEY' };
        }
        return { valid: true, provider: 'openai' };
    }
    
    if (aiProvider === 'deepseek') {
        if (!process.env.DEEPSEEK_API_KEY) {
            return { valid: false, error: '未配置 DEEPSEEK_API_KEY' };
        }
        return { valid: true, provider: 'deepseek' };
    }
    
    return { valid: false, error: '未支持的 AI 提供商' };
}

// 构建提示词
function buildPrompt(mode, input, issue = '') {
    const systemPrompt = `你是 OIer-Helper，一个专为信息学竞赛学生设计的算法学习助手。
你的语气要耐心友好，像真正的助教，不做居高临下的评判。
重要：给出的代码仅供学习参考，禁止直接复制提交，鼓励学生自己理解实现。

回答规范：
1. 使用 Emoji 让内容更生动
2. 结构清晰，使用标题、列表、代码块
3. 先给思路提示，再给完整代码
4. 注明参考资料来源
5. 每段代码后加上学术诚信声明`;

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
问题描述��${issue || '未指定'}
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

// API 路由
app.post('/api/generate', async (req, res) => {
    try {
        const { mode, input, issue } = req.body;
        
        if (!mode || !input) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        // 检查 API 配置
        const config = checkAPIConfig();
        if (!config.valid) {
            return res.status(500).json({ error: config.error });
        }

        const prompt = buildPrompt(mode, input, issue);
        let aiResponse;

        // 根据配置的提供商调用 API
        if (config.provider === 'openai') {
            aiResponse = await callOpenAI(prompt);
        } else if (config.provider === 'deepseek') {
            aiResponse = await callDeepSeek(prompt);
        }

        res.json({ 
            success: true, 
            content: aiResponse,
            mode 
        });

    } catch (error) {
        console.error('API 错误:', error.message);
        res.status(500).json({ 
            error: 'AI 服务暂时不可用，请稍后重试',
            details: error.message 
        });
    }
});

// 获取配置信息（不含密钥）
app.get('/api/config', (req, res) => {
    const config = checkAPIConfig();
    res.json({
        ...config,
        keys: config.valid ? {
            provider: config.provider,
            hasApiKey: true
        } : null
    });
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 调用 OpenAI 兼容 API
async function callOpenAI(prompt) {
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    const response = await axios.post(
        `${baseURL}/chat/completions`,
        {
            model: process.env.OPENAI_MODEL || 'agnes-2.5-flash',
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}

// 调用 DeepSeek API
async function callDeepSeek(prompt) {
    const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
            model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
            messages: [
                { role: 'system', content: '你是一个有帮助的助手。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        },
        {
            headers: {
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data.choices[0].message.content;
}

// 启动服务器（本地开发用）
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 OIer-Helper API 服务已启动`);
        console.log(`📍 服务地址: http://localhost:${PORT}`);
        console.log(`🔗 API 端点: http://localhost:${PORT}/api/generate`);
        
        const config = checkAPIConfig();
        if (config.valid) {
            console.log(`✅ AI 配置: ${config.provider}`);
        } else {
            console.log(`⚠️  警告: ${config.error}`);
            console.log(`   请创建 .env 文件并配置 API Key`);
        }
    });
}

// Vercel Serverless 导出
module.exports = app;
exports = module.exports = app;
