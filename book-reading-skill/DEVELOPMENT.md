# book-reading 写作 skill · 二次开发思路

> 一句话：从 skill001 那套"1 引擎 × 1000 人设皮"逆向学来机制与架构，但换成真人设、解耦成薄 overlay、用"赋神不赋形"心法 + 脚本质检压住 AI 味，做成能持续养人设的精品引擎。

## 继承了 skill001 那套的什么

- **三部分 IP 协议**：观看位置 / 专业判断 / 价值落点——IP 当分析工具，不是简历。
- **persona 极简标签 + 不编造硬约束**：只用提供的事实，不扩写成故事。
- **选书固定顺序 + 单本隐晦带货**：围绕一本书、不喊推销。
- **"引擎 + 人设"分层架构**。

## 改了什么（关键差异）

- **假人设 → 真人设**：人设是自己设定的真实角色（周砚/林野/沈知微/顾沉/苏晚/刘智行），不是蒸馏第三方榜单的低置信度假样本。
- **绑死包 → 解耦**：1 个 base 引擎冻结不动，每个人设是一层薄 overlay（SKILL 指针 + persona.md + voice.md）。加人不改引擎。
- **强模板 → 赋神不赋形**：招牌手法（开头/金句/词组）当工具不当公式；换主题换书也能原样用就是套路。
- **追量 → 重质**：6 个精品人设，不是 1000 个皮。
- 叠加**卡兹克式质检**：三层脚本（字数 / 禁用词+节数 / 原创度·AI味形状）+ 活人感终检（温度/独特/心流）+ 正反例库。

## 架构

```
book-reading/（base 引擎，冻结）
  SKILL.md + references/(心法/风格/骨架/字数/禁用词/IP协议)
  + scripts/check_length.py check_style.py check_originality.py
book-reading-<人设>/（overlay ×6，薄层）
  SKILL.md(指针) + persona.md(事实) + voice.md(声音)
wechat-cover/（独立封面 skill，按需召唤；fetch_article_cover.py 抓文章原图）
```

## 二次开发怎么动手

- **加人设**：复制一个 overlay 目录 → 填 persona/voice → 改 SKILL.md 名字和交付路径 → base SKILL §7 人设清单加名字（引擎不动）。
- **改风格/骨架/禁用词**：改对应 references + check 脚本。
- **改完两份同步**：`~/.claude/skills/`（加载版）↔ `~/ClaudeProject/book-reading-skill/`（源码），diff 对齐。
- **改校验规则的同步清单（防再漂移）**：references → 6 个 overlay 的 SKILL.md → tests/fixtures（官方样文必须三脚本全过）→ tests/test_checks.py → README。只改 base SKILL.md 不算完成。

## 两个外部来源

skill001/0012（产品架构 + 人设植入机制）、khazix-writer（质检分层 + 活人感 + 正反例），再加用户本人反馈（赋神不赋形）。
