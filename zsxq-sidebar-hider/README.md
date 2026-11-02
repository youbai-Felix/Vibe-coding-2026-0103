# 知识星球左栏隐藏（Chrome 扩展）

隐藏 wx.zsxq.com 网页版左侧的星球导航栏，正文更宽，专心阅读。

## 安装（Chrome / Edge / 任何 Chromium 内核浏览器）

1. 打开 `chrome://extensions/`
2. 右上角打开「开发者模式」
3. 点「加载已解压的扩展程序」，选择本文件夹

## 使用

装上后默认就隐藏，三种方式随时切换回来：

- 点工具栏里的扩展图标
- 快捷键 `⌥ Option + ⇧ Shift + Z`（Mac 上 Alt 键即 Option，同一条监听；在页面内直接监听按键，Chrome / Dia / Edge 都生效；同时也注册了浏览器原生命令，两路互不冲突）
- 页面左边缘中部的半透明小箭头（平时 25% 透明度，悬停变实）

状态全局记忆：所有标签页同步，重开浏览器后保持。

## 实现说明

- 主选择器：`.group-list-container` / `app-group-list`（来自 2025–2026 年仍在维护的油猴脚本验证过的类名）
- 官方改版类名漂移时，自动降级为几何启发式：贴左缘、160–340px 宽、过半屏高、含多个链接的列视为侧栏并打标 `.zsxq-sidebar-detected`
- 隐藏后对 `.main-content-container` / `.topic-flow-container` 做宽度补偿，让内容区吃掉空出来的位置
- `document_start` 先从 localStorage 镜像同步挂类，避免刷新时侧栏闪现；真实状态存 `chrome.storage.local`
- MutationObserver 兜住 SPA 路由切换重建的节点

## 文件

- `manifest.json` — MV3 清单
- `content.js` / `content.css` — 页面注入
- `background.js` — 图标点击 / 快捷键翻转开关
