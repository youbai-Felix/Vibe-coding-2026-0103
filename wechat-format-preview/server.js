const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');
const agent = new https.Agent({
    rejectUnauthorized: false
});

const app = express();
const PORT = 3000;

// 微信公众号配置
const WECHAT_CONFIG = {
    appId: 'wx705454a05a8f7630',
    appSecret: 'cf72ae19369044642dabf43d354544bd',
    defaultThumbMediaId: 'IgP1a23LDfcWZLW6j6L8VEWMpY4CwCYVc4I6NUo4nADrNyVsLdHXzGiNSQfNpuA3'
};

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// 引入字体服务
const { router: fontRouter, generateTitleSVG, loadFont } = require('./font-service');
app.use(fontRouter);

// 获取 access_token
app.get('/api/wechat/token', async (req, res) => {
    try {
        const response = await fetch(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`,
            { agent }
        );
        const data = await response.json();

        if (data.errcode) {
            return res.status(400).json({ error: data.errmsg });
        }

        res.json({ access_token: data.access_token, expires_in: data.expires_in });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建草稿
app.post('/api/wechat/draft', async (req, res) => {
    try {
        const { title, author, digest, content, thumb_media_id } = req.body;

        // 先获取 token
        const tokenResponse = await fetch(
            `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`,
            { agent }
        );
        const tokenData = await tokenResponse.json();

        if (tokenData.errcode) {
            return res.status(400).json({ error: tokenData.errmsg });
        }

        // 创建草稿
        const draftResponse = await fetch(
            `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${tokenData.access_token}`,
            {
                agent,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articles: [{
                        title: title || '无标题',
                        author: author || '匿名',
                        digest: digest || '',
                        content: content,
                        thumb_media_id: thumb_media_id || WECHAT_CONFIG.defaultThumbMediaId,
                        show_cover_pic: 1,
                        need_open_comment: 1,
                        only_fans_can_comment: 0
                    }]
                })
            }
        );

        const draftData = await draftResponse.json();

        if (draftData.errcode) {
            return res.status(400).json({ error: draftData.errmsg });
        }

        res.json({ success: true, media_id: draftData.media_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`\n🚀 微信推送服务已启动！`);
    console.log(`📝 服务地址: http://localhost:${PORT}`);
    console.log(`\n按 Ctrl+C 停止服务\n`);
});
