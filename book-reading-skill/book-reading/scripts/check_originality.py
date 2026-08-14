#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读书解读 skill · 原创度 / AI 味自检（低创作度 & 滥用原创风险）

专查 check_style.py 不覆盖的「AI 味 / 低价值 AIGC」特征——
这些是微信判「低创作度 / 低价值 AIGC」时的形状信号（句长太齐、金句过密、
连词过多、翻案腔批量出现），单篇自检可显著降低被罚风险。

硬性 risk（必须清零才交付，退出码 1）：
  - pivot   翻案腔变形族（不是A而是B 等 11 种），正文 ≤ 1 处（首个 H1 标题照搬豁免）
软性 warning（建议改，不卡交付）：
  - cv      句长变异系数 < 0.40（句长太齐 = 模型腔）
  - quote   「」/“” 金句密度 > 3/千字（批量造金句嫌疑）
  - conj    连词密度 > 7/千字（因为/所以/但是…）
  - opening 连续 ≥4 段同一开场词（段落节奏机械）

用法:
    python check_originality.py <article.md>
    python check_originality.py <article.md> --json
"""
import sys
import re
import json
import argparse

# ---- 翻案腔变形族（微信 AIGC 检测头号特征，11 种）----
PIVOT_PATTERNS = [
    re.compile(r"不是.{1,15}而是"),
    re.compile(r"并非.{1,15}而是"),
    re.compile(r"不在于.{1,15}而在于"),
    re.compile(r"与其说.{1,15}不如说"),
    re.compile(r"表面.{1,15}实际"),
    re.compile(r"看似.{1,15}实则"),
    re.compile(r"你以为.{1,15}其实"),
    re.compile(r"回头才发现"),
    re.compile(r"答案恰恰相反"),
    re.compile(r"不重要.{0,8}重要的(是|在于)"),
    re.compile(r"真正值钱"),
]

# 高频连词（密度过高 = AI 痕迹）
CONJUNCTIONS = ["因为", "所以", "但是", "然而", "可是", "虽然", "尽管",
                "不仅", "而且", "并且", "因此", "此外", "同时", "从而", "于是"]

PIVOT_LIMIT = 1        # 正文翻案腔 ≤ 1（标题照搬豁免）
CV_THRESHOLD = 0.40    # 句长变异系数下限
QUOTE_PER_1K = 3.0     # 「」金句每千字上限
CONJ_PER_1K = 7.0      # 连词每千字上限


def _net_chars(text):
    """中文字符数（与 check_length 口径近似）"""
    return len(re.findall(r"[一-鿿]", text))


def check(path):
    with open(path, encoding="utf-8") as f:
        text = f.read()

    # 去 YAML front matter
    text = re.sub(r"\A\s*---\n.*?\n---\n?", "", text, flags=re.DOTALL)

    # 豁免首个 H1（总标题 = og:title 照搬，标题原文不算 AI 味）
    lines = text.split("\n")
    body_lines, skipped = [], False
    for ln in lines:
        if not skipped and re.match(r"^#\s+", ln.strip()):
            skipped = True
            continue
        body_lines.append(ln)
    body = "\n".join(body_lines)

    net = _net_chars(body) or 1

    # ---- 翻案腔（按命中位置去重，防一句多模式重复计数）----
    hits = []
    for pat in PIVOT_PATTERNS:
        for m in pat.finditer(body):
            hits.append(m.start())
    hits.sort()
    unique = []
    for s in hits:
        if unique and s - unique[-1] < 5:
            continue
        unique.append(s)
    pivot_count = len(unique)

    # ---- 句长变异系数 CV（跳过 # 标题行，标题不是句子，混入会拉偏句长）----
    non_heading = "\n".join(ln for ln in body.splitlines()
                            if not ln.lstrip().startswith("#"))
    sentences = re.split(r"[。！？]", non_heading)
    lengths = [_net_chars(s) for s in sentences if _net_chars(s) >= 2]
    if len(lengths) >= 5:
        mean = sum(lengths) / len(lengths)
        var = sum((x - mean) ** 2 for x in lengths) / len(lengths)
        cv = (var ** 0.5) / mean if mean else 0.0
    else:
        cv = 1.0  # 句子太少，不作判断

    # ---- 「」/ “” 金句密度（直角引号与弯引号都算，防弯引号文章漏检）----
    quote_marks = body.count("「") + body.count("\u201c")
    quote_density = quote_marks / net * 1000

    # ---- 连词密度 ----
    conj_count = sum(body.count(c) for c in CONJUNCTIONS)
    conj_density = conj_count / net * 1000

    # ---- 段落开场重复 ----
    paras = [p.strip() for p in re.split(r"\n\s*\n", body)
             if p.strip() and not p.strip().startswith(("#", ">", "👇", "!"))]
    openings = [p[:2] for p in paras if len(p) >= 2]
    repeat_opening = False
    repeat_word = ""
    for i in range(len(openings) - 3):
        w = openings[i]
        if w and w == openings[i + 1] == openings[i + 2] == openings[i + 3]:
            repeat_opening = True
            repeat_word = w
            break

    risks, warnings = [], []
    if pivot_count > PIVOT_LIMIT:
        risks.append(f"翻案腔变形族 {pivot_count} 处（正文应 ≤ 1；首个 H1 标题照搬已豁免）")
    if cv < CV_THRESHOLD:
        warnings.append(f"句长变异系数 {cv:.2f}（<{CV_THRESHOLD} 句长太齐=模型腔，建议长短句交错）")
    if quote_density > QUOTE_PER_1K:
        warnings.append(f"「」金句密度 {quote_density:.1f}/千字（>{QUOTE_PER_1K} 批量造金句嫌疑）")
    if conj_density > CONJ_PER_1K:
        warnings.append(f"连词密度 {conj_density:.1f}/千字（>{CONJ_PER_1K} 连词过多）")
    if repeat_opening:
        warnings.append(f"连续 ≥4 段以「{repeat_word}」开场（段落节奏机械）")

    status = "has_risks" if risks else ("has_warnings" if warnings else "pass")
    return {
        "status": status,
        "pivot_count": pivot_count,
        "sentence_cv": round(cv, 2),
        "quote_density": round(quote_density, 1),
        "conjunction_density": round(conj_density, 1),
        "repeat_opening": repeat_opening,
        "risks": risks,
        "warnings": warnings,
    }


def main():
    ap = argparse.ArgumentParser(description="读书解读原创度 / AI 味自检")
    ap.add_argument("path", help="Markdown 文章路径")
    ap.add_argument("--json", action="store_true", help="JSON 输出")
    args = ap.parse_args()

    try:
        r = check(args.path)
    except OSError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False) if args.json else f"读取失败: {e}")
        sys.exit(2)

    if args.json:
        print(json.dumps(r, ensure_ascii=False))
    else:
        print(f"状态：{r['status'].upper()}")
        print(f"  翻案腔变形族：{r['pivot_count']} 处（应 ≤ 1）")
        print(f"  句长变异系数：{r['sentence_cv']}（应 ≥ 0.40）")
        print(f"  「」金句密度：{r['quote_density']}/千字（应 ≤ 3）")
        print(f"  连词密度：{r['conjunction_density']}/千字（应 ≤ 7）")
        print(f"  段落开场重复：{'是' if r['repeat_opening'] else '否'}")
        if r["risks"]:
            print("  ⚠ 风险（必须修到 0）：")
            for x in r["risks"]:
                print(f"    - {x}")
        if r["warnings"]:
            print("  · 建议（软性，尽量改）：")
            for x in r["warnings"]:
                print(f"    - {x}")
        if not r["risks"] and not r["warnings"]:
            print("  原创度：全通过")
    sys.exit(0 if r["status"] != "has_risks" else 1)


if __name__ == "__main__":
    main()
