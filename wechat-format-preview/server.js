const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
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

// 提取 HTML 中所有图片 URL
function extractImageUrls(html) {
    const urls = [];
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        const url = match[1];
        // 跳过已经是微信域名的图片
        if (!url.includes('mmbiz.qpic.cn') && !url.includes('mmbiz.qlogo.cn')) {
            urls.push(url);
        }
    }
    return [...new Set(urls)]; // 去重
}

// 下载图片到临时文件
async function downloadImage(imageUrl) {
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const urlObj = new URL(imageUrl);
    const ext = path.extname(urlObj.pathname).split('?')[0] || '.jpg';
    const fileName = `img_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`;
    const filePath = path.join(tmpDir, fileName);

    const response = await fetch(imageUrl, { agent });
    if (!response.ok) {
        throw new Error(`下载图片失败: ${response.status}`);
    }

    const buffer = await response.buffer();
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// 上传图片到微信（uploadimg 接口，用于图文正文）
async function uploadImageToWechat(filePath, accessToken) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    // 构建 multipart/form-data
    const boundary = '----FormBoundary' + Math.random().toString(36).substr(2);
    const payload = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${fileName}"\r\nContent-Type: application/octet-stream\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
    ]);

    const response = await fetch(
        `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`,
        {
            agent,
            method: 'POST',
            headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
            body: payload
        }
    );

    const data = await response.json();

    if (data.errcode) {
        throw new Error(`微信图片上传失败: ${data.errmsg}`);
    }

    return data.url; // 返回微信图片 URL
}

// 替换 HTML 中的外部图片 URL 为微信 URL
function replaceImageUrls(html, urlMap) {
    let result = html;
    for (const [oldUrl, newUrl] of Object.entries(urlMap)) {
        result = result.split(oldUrl).join(newUrl);
    }
    return result;
}

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

        const accessToken = tokenData.access_token;

        // 处理内容中的外部图片：下载 → 上传微信 → 替换 URL
        let processedContent = content;
        const imageUrls = extractImageUrls(content);

        if (imageUrls.length > 0) {
            console.log(`🖼️  发现 ${imageUrls.length} 张外部图片，开始处理...`);
            const urlMap = {};

            for (const imageUrl of imageUrls) {
                try {
                    console.log(`  ↓ 下载: ${imageUrl.substring(0, 80)}...`);
                    const filePath = await downloadImage(imageUrl);

                    console.log(`  ↑ 上传到微信...`);
                    const wechatUrl = await uploadImageToWechat(filePath, accessToken);
                    urlMap[imageUrl] = wechatUrl;

                    // 清理临时文件
                    fs.unlinkSync(filePath);
                    console.log(`  ✅ 完成: ${wechatUrl.substring(0, 60)}...`);
                } catch (err) {
                    console.error(`  ❌ 图片处理失败: ${err.message}`);
                    // 单张图片失败不阻塞整个流程，保留原始 URL
                }
            }

            if (Object.keys(urlMap).length > 0) {
                processedContent = replaceImageUrls(content, urlMap);
                console.log(`🖼️  图片处理完成，成功替换 ${Object.keys(urlMap).length} 张`);
            }
        }

        // 创建草稿
        const draftResponse = await fetch(
            `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`,
            {
                agent,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articles: [{
                        title: title || '无标题',
                        author: author || '匿名',
                        digest: digest || '',
                        content: processedContent,
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
