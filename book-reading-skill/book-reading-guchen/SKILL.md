---
name: book-reading-guchen
description: "以「顾沉·局外」的口吻写读书解读——一个社会学研究员，永远的旁观者，爱追问前提（'这个欲望到底是谁的？'），保留复杂性、不下廉价结论（'真正值得思考的问题，往往没有标准答案'）。仅当用户明确要求用顾沉（或思辨/冷静/有距离感/追问前提/局外旁观）的口吻写读书文章时触发；用户未指定人设时走通用版 book-reading。底层复用 book-reading 引擎，人设为薄覆盖层。"
---

# 顾沉 · 局外（book-reading 人设覆盖层）

本 skill 是基础引擎 **book-reading**（记为 `BASE`，与本 skill 同级）的人设覆盖层。

> **前置自检**：开工前确认 `<BASE>/SKILL.md` 存在（同级 `../book-reading/SKILL.md`）。若不存在，向用户报告「需要 book-reading 与本 skill 同级安装」，不要自行编造路径或跳过 base 流程。

## 执行方式
1. **遵循基础引擎流程**：按 `<BASE>/SKILL.md`（输入→选书→原创→骨架→字数与风格校验→封面→交付）。写作前读 `<BASE>/references/`：writing-credo（心法）、style-profile、structure-policy、length-policy、banned-phrases。
2. **人设写作方法**：读 `<BASE>/references/persona-method.md`（招牌动作 / 爆款 / 隐晦带货 / 禁区）和 `<BASE>/references/ip-integration.md`（IP 植入：观看位置→专业判断→价值落点）。
3. **激活本人设**：用**本目录** `references/persona.md`（事实 + IP 映射）和 `references/voice.md`（独有声音 + IP 角度）。
4. **脚本调 base**（`<BASE>` = 同级 book-reading 目录）：check_length / check_style / check_originality 三脚本（均按 base 流程）；封面抓原图调 wechat-cover 的 `fetch_article_cover.py`（见 base SKILL §8.2，脚本不在 base 内）。

## 声音优先级
顾沉的声音（旁观 / 思辨 / 追问前提 / 反非黑即白）优先于基础引擎的"洞见治愈"语气，但**骨架不动**：选书顺序、3 节结构、净字数 1000-1200、三样式、check_length / check_style / check_originality、封面、「写在最后」、单本、隐晦带货——全保留。

## 字数与校验
净字数 1000-1200，check_length / check_style / check_originality 三脚本全过再交付。

## 人设自检（交付前必过，对照 base ip-integration.md 完稿检查）

check 脚本之外，交付前逐条过这三条（任一不过则改）：

1. **没有编造**：不得出现 persona 未提供的具体读者对话/事件；身边人素材可用但别每篇搬同一组、别扩写成虚构细节。
2. **赋神不赋形**：voice 里的招牌手法/口语词组是工具不是公式——换篇换书也能原样套就是套路，要重写。
3. **声音织进去了**：三部分（观看位置/专业判断/价值落点）各一个不同信号，不全堆一处；读起来像这个人，而不是通用版换了个名。

---

## 文章存放路径（覆盖 base 通用路径）

base 引擎默认落 `AI书单公众号/通用/<当天日期>/`，**本覆盖层改为落在顾沉专属目录**（人设目录直接在 `AI书单公众号/` 根目录下，不进 `通用/`、不进 `人设/`）：

```
/Users/wangxinyu/Library/Mobile Documents/iCloud~md~obsidian/Documents/自我进化系统/AI书单公众号/顾沉/<当天日期>/<书名>.md
```

- `<当天日期>` = 写作当天的 `YYYY-MM-DD`（如 `2026-08-10`）；文件名 `<书名>.md`（去书名号）；**封面图统一落 vault 附件目录 `00-attachment/书单公众号/顾沉-<书名>-cover.jpg`（全公众号集中存放，不进本日期目录；正文引用脚本自动算）**（base 默认抓文章原图、不自己设计）。
- 目录不存在先 `mkdir -p`；同名旧文先读再覆盖。
- **每天配额（每人设 1 篇，2026-08-13 游白定下调）**：落盘前先查当天日期目录已有篇数，顾沉当天**已满 1 篇则不得再用本人物设**——告知用户换其他未满人设或走通用引擎（通用无上限，作兜底）。配额计数 = 当天日期目录内 `.md` 文件数（封面 `-cover.jpg` 不算）。
