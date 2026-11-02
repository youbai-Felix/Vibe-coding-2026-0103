# 侧栏隐藏（知识星球 / 小报童）

一个 MV3 浏览器扩展：一键隐藏知识星球左右两侧栏与小报童右侧专栏信息栏，让正文吃满屏幕宽度。

## 功能

| 站点 | 隐藏对象 | 默认 |
|---|---|---|
| wx.zsxq.com | 左侧星球导航栏 | 隐藏 |
| wx.zsxq.com | 右侧星球预览/信息栏 | 隐藏 |
| xiaobot.net | 右侧专栏信息栏（购买卡/数据卡） | 隐藏 |

## 切换方式（每个维度独立记忆，所有标签页同步）

- **⌥ Option + ⇧ Shift + Z**：知识星球左栏
- **⌥ Option + ⇧ Shift + X**：右栏（知识星球 / 小报童）
- 页面左缘 / 右缘的半透明悬浮箭头
- 工具栏图标：知识星球页切左栏，小报童页切右栏

状态存 `chrome.storage.local`，各标签页实时同步，重开浏览器保持；`localStorage` 镜像在 `document_start` 先挂类，防止刷新时侧栏闪现。

## 安装（Chrome / Dia / Edge，任何 Chromium 内核）

1. 打开 `chrome://extensions/`
2. 右上角打开「开发者模式」
3. 点「加载已解压的扩展程序」，选择本文件夹

已装过旧版（1.0.x）的：覆盖加载后旧的左栏开关会自动迁移，无需重新设置。

## 实现说明

- 知识星球类名（`.group-list-container` / `app-group-list` / `.group-preview-wrapper` / `app-group-info`）来自 Greasyfork 2025-07 #541540、2026-02 #565137 两个油猴脚本交叉验证；**右栏未在登录后页面实测**，类名漂移时 F12 报 class
- 小报童右栏（`.sidebar-sticky` > `.info-wrapper` > `.paper-info`）2026-11-02 实测；正文区 `.app-container .left` 定宽 630px，需放开 `max-width` 才能吃满宽度
- 类名全部漂移时降级为几何启发式：贴屏幕左/右缘、固定窄宽、过半屏高、含链接的列视为侧栏打标隐藏
- Dia 浏览器对 `chrome.commands` 注册支持不全，快捷键走 content script 页面内 keydown 捕获监听（`chrome.commands` 仍注册给标准 Chrome，两路互不冲突）
- Chrome 137+ 正式版禁止无头命令行加载未打包扩展，自动化验证改为真实页面注入脚本全量回归

## 文件

- `manifest.json` — MV3 清单（注入两域，document_start）
- `content.js` — 站点/维度配置、状态同步、启发式兜底、悬浮箭头、页面内快捷键
- `content.css` — 各栏隐藏规则 + 布局补偿
- `background.js` — 图标/命令消息路由到当前标签页；旧版 `hidden` 迁移
- `gen_icons.py` — 纯 Python 生成 PNG 图标

## 版本

- 1.1.0（2026-11-02）：新增知识星球右栏、小报童右栏隐藏；状态拆为三维度独立开关
- 1.0.1（2026-10-23）：初版，知识星球左栏隐藏
