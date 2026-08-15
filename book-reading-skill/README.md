# 读书解读 Skill（1 引擎 + 6 人设）

一套公众号「读书解读」写作 skill，遵循 [Agent Skills](https://agentskills.io) 开放标准。

**架构：1 个基础引擎 + 6 个人设薄覆盖层。** 引擎承载所有方法论（结构 / 字数 / 三脚本校验 / 选书 / IP 植入法 / 带货规则），人设 overlay 只放该人设独有的声音与身份。加新人设 = 复制一个 overlay 目录 + 改 persona/voice，引擎一行不动。

> ⚠️ **本机绑定说明**：交付路径硬编码游白的 Obsidian vault（iCloud），封面脚本依赖同级安装的 `wechat-cover` skill，素材池依赖 vault 内 `AI书单公众号/素材池.md`。换机器 / 换工具使用前需先改 `SKILL.md` §8 路径并装好 wechat-cover；路径不可用时按 §8.1 降级落当前目录。

## 包含

**基础引擎 `book-reading/`**
- 3 节结构（标题/加粗/引用三样式）、正文净字数 **1000-1200** 硬校验（`check_length.py`）
- 风格与禁用词校验（`check_style.py`：禁用词 / 节数链式判定 / 破折号（引用块豁免）/ 三样式）
- 原创度 / AI 味自检（`check_originality.py`：翻案腔族全文 ≤ 1 硬卡；句长 CV / 金句密度 / 连词密度 / 开场重复软警告）——**三脚本全过才允许交付**
- 封面：**只抓文章原图**（`og:image`，调 wechat-cover 的 `fetch_article_cover.py`），不自己设计；设计类封面归 wechat-cover
- 方法论：`persona-method.md`（招牌动作 / 爆款杠杆 / 隐晦带货 / 禁区）、`ip-integration.md`（IP 植入法：身份轻量、自然织入，不当简历背）、`writing-credo.md`（赋神不赋形等六条心法）
- 素材池协议：动笔前从 vault 素材池挑一条真实素材做主体论据，用完回写状态（规避低价值 AIGC 判定）

**6 个人设 overlay**
| skill 目录 | 人设 | 声音关键词 |
|---|---|---|
| `book-reading-linye` | 林野·野生荐书人 | 随意、漂泊、自嘲、"没用才值得读" |
| `book-reading-shenzhiwei` | 沈知微·小径分岔的书房 | 克制、空间感、"用来居住一段时间" |
| `book-reading-guchen` | 顾沉·局外 | 旁观、追问前提、"没有标准答案" |
| `book-reading-suwan` | 苏晚·书中香气 | 温柔、不强行治愈、"陪人熬过一晚" |
| `book-reading-zhouyan` | 周砚·人间藏书 | 温厚、帮人配书、"时间比书贵" |
| `book-reading-liuzhixing` | 刘智行 | 冷峻、祛魅、借经典拆人情/职场/金钱真相 |

## 安装

把 `book-reading/` 和你想用的人设目录（如 `book-reading-linye/`）一起复制进 skills 文件夹，**保持同级**：
- Claude Code（macOS/Linux）：`~/.claude/skills/`
- Claude Code（Windows）：`%USERPROFILE%\.claude\skills\`
- 其他工具（Codex/Cursor 等）：该工具的 skills 文件夹（如 `~/.agents/skills/`）

人设 overlay 靠「同级目录」引用引擎。放好后新开对话即可。

> 至少要装 `book-reading/`（引擎）+ 一个人设目录。引擎单独也能用（普世第二人称版，无人设）。

## 依赖

| 依赖 | 必需？ | 说明 |
|---|---|---|
| Python 3 | 必需 | 写作、字数 / 风格 / 原创度校验都用 |
| wechat-cover skill | 封面 | 抓文章原图封面用它的 `fetch_article_cover.py`；没装则不出封面，不影响写作 |
| Obsidian vault（本机 iCloud 路径） | 交付落盘 | 文章 / 封面 / 素材池的默认存放地；不可用时降级落当前目录 |

## 用法（装好后直接对 AI 说）

- `用林野的口吻写《XX》的读书解读`
- `用刘智行的口吻写《XX》的读书解读`
- 或直接说书名 / 选题，AI 按人设匹配

流程：选书 → 素材池挑真实素材 → 原创 3 节 → 三脚本校验（length / style / originality）→ 抓文章原图封面 → 落盘 vault。

## 核心规则（所有人设共用）

- 正文净字数 **1000-1200**（硬约束，脚本判定）
- 3 节结构，每节「加粗金句小标题 → 内容」，必含标题 / 加粗 / 引用三样式
- **翻案腔族（不是 A 而是 B 等 11 种变形）全文 ≤ 1 处**（含小标题；照搬原标题豁免）
- 收尾 `# 写在最后` 全段零推荐字句，**全文到此结束，不另加任何导流推荐语**（2026-08-15 删「👇👇读《书名》」机制）
- **增量原则（对齐平台低创作度判定）**：每篇必须含作者自己的真实素材或独立观点 / 分析做主体——复述 + 拼接轻加工、无个人增量是平台负面案例；AI 辅助但融入大量个人经验与思考是正面案例
- **标题不必含书名**（能勾人 + 贴主题即可）；素材自带标题时一律照搬原文
- **IP 植入要轻**：身份 1-3 处自然透出，不当简历背；同人设多篇文章别反复用同一组素材
- **每人设每天 1 篇**（按日期目录计数），通用引擎无上限作兜底

## 开发

见 `DEVELOPMENT.md`。改完源码记得同步 `~/.claude/skills/` 装机副本（diff 对齐）；改校验规则时必须同步：references → 各 overlay → tests/fixtures → 本 README。

## 加一个人设

复制任一 overlay 目录（如 `book-reading-linye/`）→ 改名 → 改 `references/persona.md`（人设事实）和 `references/voice.md`（独有声音）→ 改 `SKILL.md` 里的名字和交付路径 → 引擎 SKILL §7 人设清单加名字。引擎与脚本都不用动。
