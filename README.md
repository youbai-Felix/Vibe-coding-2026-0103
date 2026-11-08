# Vibe Coding 2026

个人 AI 结对编程工作区。2026 年 1 月 3 日建立，所有项目均为与 AI 协作完成——从需求对话、方案设计到代码实现与实测验证。

## 项目索引

### 公众号创作工具链（主力）

围绕「在 Obsidian 里写作 → 排版 → 发布到微信公众号」的完整链路：

| 项目 | 说明 |
|---|---|
| [obsidian-wechat-publish](obsidian-wechat-publish/) | **核心插件**：陶笺排版主题 + iPhone 15 真机级所见即所得预览（逐行断行与手机一致）+ 一键复制/推送草稿箱，含自部署推送服务 |
| [book-reading-skill](book-reading-skill/) | 「读书解读」写作 skill（1 引擎 + 6 人设薄覆盖层），产出 1000-1200 字原创长文 |
| [wechat-cover-skill](wechat-cover-skill/) | 公众号封面图生成 skill |
| [wechat-format-preview](wechat-format-preview/) | 排版预览工具的早期 Web 版（插件的前身之一） |
| [wechat-format-youbai](wechat-format-youbai/) / [wechat-editor](wechat-editor/) | 排版实验与编辑器探索 |

### 浏览器扩展

| 项目 | 说明 |
|---|---|
| [zsxq-sidebar-hider](zsxq-sidebar-hider/) | MV3 扩展：一键隐藏知识星球/小报童两侧栏，正文吃满屏宽，三维度独立开关 |

### 小游戏（妖坊游戏铺）

单文件、零依赖、双击 `index.html` 即玩，聚合入口见 [README-games.md](README-games.md)：

| 游戏 | 说明 |
|---|---|
| [anpai](anpai/) · 暗牌 | 扑克牌型 Roguelike：民国妖异赌坊，三盏命灯闯十五层妖局 |
| [heyaolu](heyaolu/) · 合妖录 | 妖果合成 |
| [yijian](yijian/) · 一箭封喉 | 风中射帖 |
| [nieuniu](nieuniu/) · 捏捏泡泡 | 打工人的三十秒 |
| [game-hub](game-hub/) | 四款游戏的聚合入口页 |

## 工作方式

- 每个项目一个独立目录，自带 README 与依赖，互不耦合
- 排版类项目的参数均经真机实测校准（详见各项目内的提交信息，记录了每个设计决策的原因）
- 微信相关工具针对编辑器的 HTML 清洗规则做了粘贴安全设计
