// Cloudflare Worker - OIer-Helper API (简化版)
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
            return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // 配置检查
        if (url.pathname === '/api/config' && request.method === 'GET') {
            return new Response(JSON.stringify({ valid: !!env.OPENAI_API_KEY, provider: 'openai' }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // API 生成
        if (url.pathname === '/api/generate' && request.method === 'POST') {
            return handleGenerate(env, request);
        }

        // 返回简单欢迎页面
        return new Response('<h1>OIer-Helper is running!</h1><p>API endpoints:</p><ul><li>/api/health</li><li>/api/config</li><li>/api/generate</li></ul>', {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
};

async function handleGenerate(env, request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: '无效的 JSON 数据' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    const { mode, input, issue } = body;
    if (!mode || !input) {
        return new Response(JSON.stringify({ error: '缺少必要参数' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
    if (!env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({ error: '未配置 OPENAI_API_KEY' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    const prompt = buildPrompt(mode, input, issue);

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
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error('API error: ' + response.status + ' - ' + errText.substring(0, 200));
        }

        const data = await response.json();
        return new Response(JSON.stringify({
            success: true,
            content: data.choices[0].message.content,
            mode
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        console.error('API error:', error.message);
        return new Response(JSON.stringify({
            error: 'AI服务暂时不可用',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

function buildPrompt(mode, input, issue) {
    const sys = '你是 OIer-Helper，一个专为信息学竞赛学生设计的算法学习助手。你的语气要耐心友好，像真正的助教。重要：给出的代码仅供学习参考，禁止直接复制提交。';
    const prompts = {
        problem: sys + '\n\n用户发来了一道题目链接：' + input + '\n请分析题目并给出解题思路和C++参考代码。',
        algorithm: sys + '\n\n用户想学习算法：' + input + '\n请系统讲解概��、步骤和C++代码模板。',
        debug: sys + '\n\n用户发来了一段代码，请帮忙找错误。\n问题：' + (issue || '未指定') + '\n代码：\n' + input,
        exercise: sys + '\n\n用户学完了知识点：' + input + '\n请推荐练习题。',
        notes: sys + '\n\n用户想整理知识点笔记：' + input + '\n请生成结构化笔记。'
    };
    return prompts[mode] || prompts.problem;
}
