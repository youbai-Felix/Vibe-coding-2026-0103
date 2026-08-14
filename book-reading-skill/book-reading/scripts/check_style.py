#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读书解读 skill · 风格与禁用词自检

硬性检查（命中即 fail，退出码 1）：
  - banned     绝对禁用词/套话扫描（与 references/banned-phrases.md 同步）
               破折号 U+2014 计数：跳过引用块行（书中原文照录可含破折号）、首个 H1 总标题
  - closing    含「写在最后」收尾标记
  - sections   固定 3 个节：取 H1 行开头的编号，从 01 起连续递增的链计为节数
               （数字开头的总标题如「# 35岁还单身」不进链，不会误计为节）
  - format     三种必备 Markdown 样式：H1 标题 / 加粗(≥3) / 引用块(≥1)
软性检查（仅警告，不影响退出码）：
  - you        第二人称「你」出现次数（仅统计输出，不计警告）
  - limit      限频句式「正如一句话所说」（> 3 警告）
               （「不是A而是B」等翻案腔族已移交 check_originality.py 硬卡 ≤ 1，此处不再双标）
  - para       偏长段落（> 3 句的段落）

用法:
    python check_style.py <article.md>
    python check_style.py <article.md> --json
"""
import sys
import re
import json
import argparse

# ---- 绝对禁用（与 references/banned-phrases.md「绝对禁用」保持同步）----
BANNED = [
    "综上所述", "总的来说", "总而言之",
    "值得一提的是", "值得注意的是",
    "不难发现", "不难看出",
    "毋庸置疑", "不可否认", "众所周知",
    "让我们来看看", "接下来让我们", "下面我们来看",
    "在这个快节奏的时代", "随着社会的发展", "随着时代的发展",
    "当今社会", "现今社会",
    "说白了", "换句话说", "本质上", "从本质上讲",
    "这意味着", "意味着什么呢",
    "这不禁让人",
    "最戳我的地方", "最戳我的一点", "最扎心的地方", "最扎心的一点", "最绝的一点", "正在栽", "栽坑",
    "崩了", "破防了", "绷不住了", "裂开了",
    # 空洞升华
    "或许这就是人生", "这就是人生的意义",
    # 伪深度隐喻金句（固定串；"把灵魂××"类通配易误伤合法修辞，留人工复查）
    "把命分了一点给他们", "交出了半条命", "把心剜了一块",
]

# 正则禁用项（与 banned-phrases.md 通配模式同步）
# 注：「最×的地方/一点」通配会误伤「最心酸的地方」等合法表达，故改用固定串只禁典型 AI 套话（见 BANNED）
BANNED_PATTERNS = [
    re.compile(r"在这个[一-鿿]{2,4}的时代"),
    re.compile(r"随着[一-鿿]{2,4}的进步"),
    re.compile(r"(?m)^今天想(跟你聊|分享|聊聊)"),
]

# 「不是A而是B」翻案腔族不再列入此处限频：由 check_originality.py 统一硬卡 ≤ 1，
# 避免同一句式在两个脚本里两套阈值。
LIMIT_PATTERNS = [r"正如一句话所说"]


def check(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()

    # 去 YAML front matter（与 check_length.py 口径一致，避免元数据遮挡 H1 导致误判）
    text = re.sub(r"\A\s*---\n.*?\n---\n?", "", text, flags=re.DOTALL)
    body = re.sub(r"\A\s*#\s+.+", "", text, count=1)  # 去首个 H1（总标题），扫描用

    banned_hits = [w for w in BANNED if w in body]
    banned_hits += [p.pattern for p in BANNED_PATTERNS if p.search(body)]
    # 破折号 U+2014「——」：禁用于正文；引用块行（> 开头）是书中原文照录，豁免
    _em = sum(ln.count("—") for ln in body.splitlines()
              if not ln.lstrip().startswith(">"))
    if _em:
        banned_hits.append(f"破折号 ×{_em}")
    # 标题结构（全一级标题 #）：可选 # 总标题 + N 个 # 节标题(01/02/03…) + # 写在最后
    h1_lines = [ln.strip() for ln in text.splitlines() if re.match(r"^#\s+", ln.strip())]
    has_h1 = bool(h1_lines)
    closing_count = sum(1 for ln in h1_lines if "写在最后" in ln)
    has_closing = closing_count >= 1
    # 节数：H1 行开头的编号从 01 起连续递增才算节（01→02→03…）。
    # 数字开头的总标题（如「# 35岁还单身」）编号不在链上，不会被误计；无总标题时 01/02/03 仍计 3 节。
    sec_nums = [int(m.group(1)) for ln in h1_lines
                if (m := re.match(r"^#\s*(\d{1,2})\b", ln))]
    section_count, expected = 0, 1
    for n in sec_nums:
        if n == expected:
            section_count += 1
            expected += 1
    bold_count = len(re.findall(r"\*\*[^*]+\*\*", body))
    quote_count = len(re.findall(r"^>\s+", body, re.MULTILINE))

    you_count = body.count("你")
    limit_hits = {p: len(re.findall(p, body)) for p in LIMIT_PATTERNS}
    limit_over = {p: c for p, c in limit_hits.items() if c > 3}

    paras = [p.strip() for p in re.split(r"\n\s*\n", body) if p.strip()]
    long_paras = 0
    for p in paras:
        if p.startswith(("#", ">")):
            continue
        if len(re.findall(r"[。！？]", p)) > 3:
            long_paras += 1

    hard_fail = (bool(banned_hits) or (not has_closing) or section_count != 3
                 or (not has_h1) or bold_count < 3 or quote_count < 1)
    warnings = []
    if "👇👇读《" not in text:
        warnings.append("缺末尾推荐语「👇👇读《书名》：金句」（默认应加）")
    if closing_count > 1:
        warnings.append(f"有 {closing_count} 个「写在最后」标题，应只 1 个")
    if limit_over:
        warnings.append(f"限频句式超标 {limit_over}（建议每篇 ≤ 3 次）")
    if long_paras:
        warnings.append(f"有 {long_paras} 个段落超过 3 句，建议拆短")

    return {
        "status": "fail" if hard_fail else "pass",
        "banned_hits": banned_hits,
        "has_closing": has_closing,
        "section_count": section_count,
        "has_h1": has_h1,
        "bold_count": bold_count,
        "quote_count": quote_count,
        "you_count": you_count,
        "limit_over": limit_over,
        "long_paragraph_count": long_paras,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="读书解读风格与禁用词自检")
    ap.add_argument("path", help="Markdown 文章路径")
    ap.add_argument("--json", action="store_true", help="JSON 输出")
    args = ap.parse_args()

    try:
        r = check(args.path)
    except OSError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False) if args.json
              else f"读取失败: {e}")
        sys.exit(2)

    if args.json:
        print(json.dumps(r, ensure_ascii=False))
    else:
        print(f"状态：{r['status'].upper()}")
        print(f"  禁用词命中：{r['banned_hits'] or '无'}")
        print(f"  「写在最后」标记：{'有' if r['has_closing'] else '缺'}")
        print(f"  节数：{r['section_count']}（应 3）")
        print(f"  标题H1：{'有' if r['has_h1'] else '缺'} | 加粗：{r['bold_count']}（应≥3） | 引用：{r['quote_count']}（应≥1）")
        print(f"  「你」出现：{r['you_count']} 次")
        if r["warnings"]:
            print("  ⚠ 警告：")
            for w in r["warnings"]:
                print(f"    - {w}")
        else:
            print("  软性项：全通过")
    sys.exit(0 if r["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
