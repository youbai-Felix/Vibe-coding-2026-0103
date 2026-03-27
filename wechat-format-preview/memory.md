# 微信公众号排版预览工具 - 记忆

## 项目概述
这是一个微信公众号文章排版预览工具，支持将 Markdown 转换为精美的 HTML 排版。

## 最新更新 (2025-03-17)

### 主题系统重构
- **删除了所有多主题系统**：移除了杂志风、森林绿、纸张、紫罗兰四个主题
- **新增单一主题**：游白·硅基书写
  - 背景：#fafafa
  - 文字：#1a1a1a
  - 强调色：#0066cc
  - 边框：#e0e0e0
  - 字体：系统默认无衬线字体

### 代码简化
- 移除了 `parseMarkdown` 函数中所有主题判断逻辑
- 移除了 `switchTheme` 函数中的主题特殊样式处理
- 移除了 `generateHTML` 函数中的纸张主题特殊处理
- 移除了 `updatePreview` 和 `copyHTML` 中的主题调试代码
- 移除了 SVG 字体生成相关代码（`generateSVGTitle` 函数）
- 移除了所有主题特定的 CSS 样式（`.paper-theme`, `.violet-theme` 等）

### 设计理念
遵循产品方法论：**简单 - 专注于一个功能并做到极致**
- 单一主题，减少选择困扰
- 专注内容本身，而非样式
- 符合"游白·硅基书写"的极简主义风格

## 技术栈
- 纯前端 HTML/CSS/JavaScript
- 后端服务：Node.js + Express
- 支持实时预览和一键推送到公众号草稿箱

## 核心功能
1. Markdown 转 HTML
2. 实时预览
3. 复制 HTML 代码
4. 推送到公众号草稿箱

## 项目文件
- `index.html` - 主应用文件（单文件应用，包含所有 HTML/CSS/JS）
- `server.js` - 后端服务
- `font-service.js` - 字体服务
- `component-builder.html` - 组件构建器

## 重要修复 (2026-03-18)

### 微信公众号标题字号兼容性优化
**问题**：推送到公众号草稿箱后，标题显示为默认的 17px 而非设置的 22px

**解决方案**：
- 使用 `<section>` 标签代替 `<div>`（微信公众号对 section 样式保留更好）
- 双重 font-size 设置：外层 section + 内层 span 都设置 `font-size: 22px !important`
- 添加 `line-height: 1.4` 确保行高正确
- 使用 `!important` 强制覆盖微信默认样式

### Markdown处理顺序重构
解决了代码块、提示框、警告框、总结卡片无法正确显示的问题。

**问题根因**：占位符被后续的Markdown处理破坏（如 `_(.+?)_` 正则会匹配 `__CODE_BLOCK_0__` 中的部分内容）

**解决方案**：调整处理顺序，在HTML转义后立即恢复代码块和多行块，在其他Markdown处理之前
1. 处理代码块 → 占位符 `__CODE_BLOCK_0__`
2. 处理多行块 → 占位符 `__MULTILINE_BLOCK_0__`
3. 处理行内代码 → 占位符 `«CODE0»`
4. HTML转义
5. 恢复行内代码
6. **立即恢复代码块和多行块**（关键步骤）
7. 处理标题、粗体、斜体等
8. 处理引用、列表等
9. 段落处理（跳过已生成的HTML块）

### Mac终端风格代码块
- 白色外卡片，12px圆角，阴影
- 深色内背景 (#1E1E1E)
- 38px头部栏，红黄绿三色圆点（12px，间距8px）
- 文件名显示（SF Mono, 12px）
- 代码区域：SF Mono, 14px, 行高1.6
- **重要**：代码换行使用 `<br>` 标签而非 `white-space: pre-wrap`，避免空行导致下方代码变灰

### 引用块支持空行
- 引用格式：`>` + 两个空格 + 内容
- 支持多行引用，中间可以有空行（`>  `）
- 空行会被正确保留和显示

### 代码语言支持空格
- 正则表达式从 `(\w*)` 改为 `([^\n]*)`
- 支持 `plain text`、`c++` 等带空格或特殊字符的语言名称
- 自动 trim 语言名称前后空格

### 新增组件
- `[!tip]` - 提示框（💡图标，蓝色边框）
- `[!warn]` - 警告框（⚠️图标，橙色边框）
- `[!summary] title=...` - 总结卡片（收据风格）

### 微信公众号分隔符兼容性修复
**问题**：推送到草稿箱后，分隔符下方有空行，且有的能删有的不能删

**解决方案**：
- 将 `<hr>` 标签改为 `<section>` 嵌套结构
- 使用外层 section 控制 margin，内层 section 控制边框样式
- 结构：`<section style="margin: 10px 0;"><section style="border-top: 2px solid ...;"></section></section>`
- 段落处理已正确识别并跳过 `section` 开头的内容

### 引用块后续空行处理修复
**问题**：引用块后面无论输入多少空行，都会在预览中产生额外的空段落

**解决方案**：
- 在 HTML 转义之前处理引用块，使用占位符保护
- 匹配引用块及其后面的所有空行：`/((?:^> .*$\n?)+)(\n*)/gm`
- 替换为占位符 + 两个换行符：`__QUOTE_BLOCK_X__\n\n`
- 在 HTML 转义后恢复占位符为 `<blockquote>` HTML，不添加额外换行符
- 结果：无论用户输入多少空行，引用块后只显示默认的 30px 间距

## 最新更新 (2026-03-19)

### 间距系统优化
- **段间距**：25px（所有元素之间的默认间距）
- **列表内间距**：10px（列表项之间的间距）
- **标题上边距**：37.5px（25×1.5）
- **左右缩进**：16px

### 列表处理重构
**问题**：飞书复制的markdown中，列表项之间有空行，导致无法正确识别为连续列表

**解决方案**：
- 在段落处理之前收集连续的列表项（支持空行），用占位符替换
- 每个列表块的第一个列表项：`margin-top: 25px`（块间间距）
- 块内其他列表项：`margin-top: 10px`（块内间距）
- 使用 `section` 包裹确保微信兼容

### 外层背景卡片
- 添加外层背景section：`background-color: #FAFAF9`
- 上下padding：15px，左右padding：0（不影响内容缩进）
- border-radius：8px

### 字体调整
- **正文**：16px
- **行内代码**：16px，字间距 0.5px
- **代码块内容**：15px

### 组件样式更新
按照用户提供的参考样式更新：
- **提示框**：背景色 `#F6F8FA`，蓝色边框 `#007AFF`
- **警告框**：背景色 `#FFF9F0`，橙色边框 `#FF9500`
- **总结卡片**：使用 section 嵌套结构确保微信兼容
  - 外层 section：控制边框、背景、边距
  - 绿色圆点：`#22c55e`，8px
  - 头部：padding `16px 24px`，背景 `#FAFAFA`
  - 内容区：padding `16px 24px 24px 24px`
  - 边框：`#e5e7eb`，虚线分隔
  - 底部：padding `12px 24px`，字号 12px
  - 标题字号：18px，内容字号：16px
  - 标题与内容间距：12px

### 微信公众号兼容性经验（2026-03-19 更新）

**核心原则：参考标题实现技术**

✅ **推荐技术**：
- `section` 嵌套结构 - 所有内容写在一行（无换行）
- 内部用 `span` + `margin-bottom` 控制间距
- 外层 `section` 控制整体样式
- 使用 `overflow: hidden` 配合 `border-radius`

❌ **避免使用**：
- `table` - 任何形式的 table 都会显示表格样式
- `display: flex` - 微信兼容性差
- `div` - 可能被过滤
- `h1-h6` / `p` 等块级标签 - 改用 `span`
- HTML 换行 - 会导致额外空行
- `padding` - 改用 `margin-bottom` 控制间距

**组件标准结构模板**：
```html
<section style="margin: 30px 0; border: 1px solid rgb(229, 229, 234); border-radius: 8px; background-color: rgb(255, 255, 255); overflow: hidden;">
  <section style="padding: 8px 12px; ..."><span>...</span></section>
  <section style="margin-bottom: 8px;"><span>...</span></section>
  <section>...</section>
</section>
```

### 总结卡片微信兼容性修复 (2026-03-19 最终版)
**问题演变**：
1. 嵌套 table → "全变成表格"
2. section + table（单层）→ 仍有表格样式 + 额外空行
3. section 换行写法 → 内部上下空行过多

**最终解决方案**：
- 完全参考标题技术实现
- **所有 HTML 写在一行**（关键！）
- 用 `section` + `span` + `margin-bottom`
- 移除 `h4`/`p` 标签，改用 `span`

### 总结卡片布局细节修复 (2026-03-20)

**问题1：实线连接边框**
- 原方案：`margin: 0 -16px` 负边距延伸
- 微信问题：不支持负边距
- 解决方案：改用 `border-top: 1px solid rgb(229, 229, 234) !important;` 直接设置边框

**问题2：最后一行下方 padding 消失**
- 原方案：div 上 `padding-bottom: 20px`
- 微信问题：div 的 padding 被重置
- 解决方案：改用 section 的 `margin-bottom: 15px !important`

**问题3：圆角边框缺失**
- 原因：移除了 `overflow: hidden` 导致内部背景覆盖圆角
- 解决方案：添加 `overflow: hidden` 到外层容器

**问题4：列表项间距不统一**
- 原方案：第一个 `margin: 0`，其他 `margin: 15px 0 0 0`，最后 `margin: 0 0 20px`
- 微信问题：间距叠加导致不一致
- 解决方案：
  - 第一个元素：`margin-top: 0; margin-bottom: 0`
  - 其他元素：`margin-top: 15px; margin-bottom: 0`
  - 最后一个元素：`margin-top: 15px; margin-bottom: 15px !important`

**总结卡片最终样式规范**：
```
外层容器：
- border: 1px solid rgb(229, 229, 234)
- border-radius: 8px
- background-color: rgb(255, 255, 255)
- overflow: hidden（必须！）

顶部区域（虚线）：
- padding: 12px 16px
- background-color: rgb(250, 250, 250)
- border-bottom: 1px dashed rgb(209, 209, 214)

内容区域：
- padding: 20px 16px 0 16px（无底部 padding）

列表项间距：
- 第一个：margin-top: 0
- 其他：margin-top: 15px
- 最后一个：margin-bottom: 15px !important

实线区域：
- border-top: 1px solid rgb(229, 229, 234) !important
- padding: 16px 16px 16px 0 !important
- 文字：inline-block + padding: 16px 16px 16px 0
```

### Markdown处理顺序最终方案 (2026-03-20)

**问题演变**：
- 粗体/斜体处理位置不当，导致列表无法被识别
- 占位符中的 `___` 字符被粗体/斜体正则匹配，导致占位符被破坏
- 列表收集在HTML转义后进行，导致内容被转义影响匹配

**最终处理顺序**（关键步骤）：
1. 处理代码块 → 占位符 `__CODE_BLOCK_X__`
2. 处理多行块 → 占位符 `__MULTILINE_BLOCK_X__`
3. **收集列表块** → 占位符 `__LIST_BLOCK_X__`（在HTML转义之前）
4. 处理引用块 → 占位符 `__QUOTE_BLOCK_X__`
5. 处理行内代码 → 占位符 `«CODEX»`
6. HTML转义
7. 恢复行内代码
8. **恢复代码块**（使用 `replaceAll`）
9. 恢复引用块
10. 恢复多行块（提示框、警告框、总结卡片）
11. 处理标题
12. 处理链接、图片、分隔线
13. 段落处理（**在段落内容中处理粗体/斜体**）
14. **恢复列表块**（**在恢复时处理内容的粗体/斜体样式**）

**关键要点**：
- 列表收集必须在HTML转义之前进行，否则内容被转义后无法匹配
- 粗体/斜体处理必须在段落和列表恢复时单独处理，避免影响其他HTML结构
- 使用 `replaceAll` 而非 `replace` 确保所有占位符都被替换
- 粗体/斜体正则：`\*\*\*([^*\n]+)\*\*\*`（确保内容中不含`*`，避免匹配特殊标识）

## 服务器部署 (2026-03-28)

### 部署信息
- **服务器**：腾讯云轻量应用服务器（Ubuntu）
- **公网 IP**：123.207.219.251
- **项目路径**：/opt/wechat-format
- **端口**：3000
- **进程管理**：pm2（服务名 wechat-format）

### 注意事项
- 轻量服务器没有"安全组"，端口开放在 **防火墙** 标签页里操作
- 微信公众号 IP 白名单需添加：`123.207.219.251`
- 本地代码更新后需重新 scp 上传并 `pm2 restart wechat-format`
