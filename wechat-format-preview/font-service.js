const express = require('express');
const opentype = require('opentype.js');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// 字体文件路径配置
const FONTS = {
    kaiti: {
        path: path.join(__dirname, 'fonts', 'STKaiti.ttf'), // 华文楷体
        fallback: path.join(__dirname, 'fonts', 'AppleGothic.ttf'), // 使用 AppleGothic 作为测试字体
        systemFallback: '/System/Library/Fonts/Supplemental/AppleGothic.ttf'
    },
    songti: {
        path: path.join(__dirname, 'fonts', 'STSong.ttf'),
        fallback: '/System/Library/Fonts/STSong.ttc'
    }
};

// 确保字体目录存在
const fontsDir = path.join(__dirname, 'fonts');
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

// 加载字体缓存
let fontCache = null;

async function loadFont() {
    if (fontCache) return fontCache;

    try {
        // 尝试加载华文楷体
        let fontPath = FONTS.kaiti.path;

        // 如果本地没有，尝试使用替代字体
        if (!fs.existsSync(fontPath)) {
            fontPath = FONTS.kaiti.fallback;
        }

        // 如果还是没有，尝试系统字体
        if (!fs.existsSync(fontPath)) {
            fontPath = FONTS.kaiti.systemFallback;
        }

        // 检查字体文件是否存在
        if (!fs.existsSync(fontPath)) {
            console.log('⚠️  警告: 未找到楷体字体文件');
            console.log('📁 尝试的路径:');
            console.log('  -', FONTS.kaiti.path);
            console.log('  -', FONTS.kaiti.fallback);
            console.log('  -', FONTS.kaiti.systemFallback);
            throw new Error('字体文件不存在，请将字体文件放置在 fonts/ 目录下');
        }

        fontCache = await opentype.load(fontPath);
        console.log('✅ 字体加载成功:', fontPath);
        return fontCache;
    } catch (error) {
        console.error('❌ 字体加载失败:', error.message);
        throw new Error('字体加载失败: ' + error.message);
    }
}

// 核心 SVG 生成函数
async function generateTitleSVG(text, options = {}) {
    const {
        fontSize = 17,
        fillColor = '#2C2C2E',
        letterSpacing = 0
    } = options;

    try {
        const font = await loadFont();

        // 计算文本宽度 - 使用 opentype.js 的正确方法
        let textWidth = 0;
        const glyphs = font.stringToGlyphs(text);

        for (let i = 0; i < glyphs.length; i++) {
            const glyph = glyphs[i];
            if (glyph.advanceWidth) {
                textWidth += glyph.advanceWidth;
            }
            // 添加字间距
            if (i < glyphs.length - 1 && letterSpacing > 0) {
                textWidth += letterSpacing;
            }
        }

        // 将字体单位转换为像素 (opentype 使用 1000 units per em)
        const scale = fontSize / font.unitsPerEm;
        const scaledWidth = textWidth * scale;

        // 添加 padding
        const exactWidth = Math.ceil(scaledWidth) + 10;
        const exactHeight = Math.ceil(fontSize * 1.5);

        // 生成文字路径
        const path = font.getPath(text, 5, fontSize - 2, fontSize);

        // 转换为 SVG
        const pathSVG = path.toSVG(2);

        const finalSvgCode = `
<svg viewBox="0 0 ${exactWidth} ${exactHeight}" style="width: ${exactWidth}px; height: auto; display: block;" xmlns="http://www.w3.org/2000/svg">
    <g fill="${fillColor}">
        ${pathSVG}
    </g>
</svg>`.trim();

        return {
            svg: finalSvgCode,
            width: exactWidth,
            height: exactHeight
        };
    } catch (error) {
        console.error('SVG 生成失败:', error);
        // 返回纯文本后备方案
        return {
            svg: `<span style="font-family: '楷体', 'Kaiti', STKaiti, serif; font-size: ${fontSize}px; font-weight: bold; color: ${fillColor}; letter-spacing: 1.5px;">${text}</span>`,
            width: text.length * fontSize,
            height: Math.ceil(fontSize * 1.5)
        };
    }
}

// API 端点：生成标题 SVG
router.post('/api/svg-title', async (req, res) => {
    try {
        const { text, fontSize = 17, fillColor = '#2C2C2E', letterSpacing = 0 } = req.body;

        if (!text) {
            return res.status(400).json({ error: '缺少文本内容' });
        }

        const result = await generateTitleSVG(text, { fontSize, fillColor, letterSpacing });

        res.json({
            success: true,
            svg: result.svg,
            width: result.width,
            height: result.height
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API 端点：生成完整的标题 HTML 片段
router.post('/api/title-html', async (req, res) => {
    try {
        const { text, level = 3, badge = 'NODE' } = req.body;

        if (!text) {
            return res.status(400).json({ error: '缺少文本内容' });
        }

        // 根据标题级别设置样式
        const styles = {
            1: { fontSize: 22, badge: 'ROOT', margin: '56px 0 40px' },
            2: { fontSize: 19, badge: 'SECTION', margin: '48px 0 32px' },
            3: { fontSize: 17, badge: 'NODE', margin: '40px 0 24px' },
            4: { fontSize: 16, badge: 'ITEM', margin: '32px 0 20px' },
            5: { fontSize: 15, badge: null, margin: '28px 0 16px' },
            6: { fontSize: 14, badge: null, margin: '24px 0 12px' }
        };

        const style = styles[level] || styles[3];
        const badgeText = badge || style.badge;

        // 生成 SVG
        const svgResult = await generateTitleSVG(text, {
            fontSize: style.fontSize,
            fillColor: '#2C2C2E'
        });

        // 构建完整 HTML
        let html = '';

        if (badgeText) {
            html = `<section style="margin: ${style.margin}; display: flex; flex-direction: column; align-items: flex-start;">
  <div style="display: flex; align-items: center; margin-bottom: 6px;">
    <span style="background-color: #1C1C1E; color: #FFFFFF; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: ${Math.max(8, style.fontSize - 7)}px; font-weight: bold; padding: 2px 5px; border-radius: 3px; margin-right: 6px; letter-spacing: 0.5px;">&gt;_</span>
    <span style="font-family: -apple-system, sans-serif; font-size: ${Math.max(8, style.fontSize - 7)}px; color: #8E8E93; letter-spacing: 1px; text-transform: uppercase;">${badgeText}</span>
  </div>
  <div style="padding-bottom: 6px; border-bottom: 1.5px solid #E5E5EA;">
    ${svgResult.svg}
  </div>
</section>`;
        } else {
            html = `<section style="margin: ${style.margin}; display: flex; flex-direction: column; align-items: flex-start;">
  <div style="padding-bottom: 6px; border-bottom: 1.5px solid #E5E5EA;">
    ${svgResult.svg}
  </div>
</section>`;
        }

        res.json({
            success: true,
            html: html,
            width: svgResult.width,
            height: svgResult.height
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 健康检查
router.get('/api/font-health', async (req, res) => {
    try {
        await loadFont();
        res.json({
            success: true,
            message: '字体服务正常',
            fontsAvailable: {
                kaiti: fs.existsSync(FONTS.kaiti.path) || fs.existsSync(FONTS.kaiti.fallback)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = { router, generateTitleSVG, loadFont };
