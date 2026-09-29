// 公众号草稿推送服务（自部署）
// 仅依赖 express + cors；凭据全部走环境变量，绝不写进代码。
// 用法：WX_APP_ID=xxx WX_APP_SECRET=yyy npm start
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3000;
const WX_APP_ID = process.env.WX_APP_ID || "";
const WX_APP_SECRET = process.env.WX_APP_SECRET || "";
const WX_THUMB_MEDIA_ID = process.env.WX_THUMB_MEDIA_ID || "";

if (!WX_APP_ID || !WX_APP_SECRET) {
  console.error("❌ 请先设置 WX_APP_ID / WX_APP_SECRET 环境变量（公众号后台 → 设置与开发 → 基本配置）");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

async function getAccessToken() {
  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX_APP_ID}&secret=${WX_APP_SECRET}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.errcode) throw new Error("获取 access_token 失败: " + data.errmsg);
  return data.access_token;
}

// 把 HTML 里的外链图片搬到微信图床（公众号正文不允许外链图）
function extractImageUrls(html) {
  const urls = new Set();
  const re = /<img[^>]+src="(https?:\/\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  return [...urls];
}

async function uploadImageToWechat(buffer, accessToken) {
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const payload = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="img"\r\nContent-Type: application/octet-stream\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const res = await fetch(`https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: payload,
  });
  const data = await res.json();
  if (data.errcode) throw new Error("图片上传失败: " + data.errmsg);
  return data.url;
}

// 创建草稿
app.post("/api/wechat/draft", async (req, res) => {
  try {
    const { title, author, digest, content, thumb_media_id } = req.body;
    const accessToken = await getAccessToken();

    let processedContent = content || "";
    const imageUrls = extractImageUrls(processedContent);
    let replaced = 0;
    for (const imageUrl of imageUrls) {
      try {
        const imgRes = await fetch(imageUrl);
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const wechatUrl = await uploadImageToWechat(buffer, accessToken);
        processedContent = processedContent.split(imageUrl).join(wechatUrl);
        replaced++;
      } catch (err) {
        console.error("图片搬运失败（不阻塞推送）:", imageUrl, err.message);
      }
    }
    if (replaced) console.log(`🖼️ 已搬运 ${replaced}/${imageUrls.length} 张外链图片`);

    const draftRes = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articles: [{
          title: title || "无标题",
          author: author || "匿名",
          digest: digest || "",
          content: processedContent,
          thumb_media_id: thumb_media_id || WX_THUMB_MEDIA_ID,
          show_cover_pic: 1,
          need_open_comment: 1,
          only_fans_can_comment: 0,
        }],
      }),
    });
    const draftData = await draftRes.json();
    if (draftData.errcode) return res.status(400).json({ error: draftData.errmsg });
    res.json({ success: true, media_id: draftData.media_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`🚀 公众号草稿推送服务已启动: http://localhost:${PORT}`);
});
