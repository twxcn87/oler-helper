// Cloudflare Worker - OIer-Helper API (极简版)
export default {
    async fetch(request) {
        const url = new URL(request.url);
        
        // 健康检查
        if (url.pathname === '/api/health') {
            return Response.json({ status: 'ok', timestamp: new Date().toISOString() });
        }
        
        // 返回简单消息
        return new Response('OIer-Helper is running! Try /api/health', {
            headers: { 'content-type': 'text/plain' }
        });
    }
};
