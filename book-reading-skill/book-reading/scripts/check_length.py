#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""读书解读 skill · 正文净字数校验

净字数口径：汉字每个计 1；连续英文/数字作为一个 token 计 1。
不计入：YAML front matter、H1 标题行、图片、URL、Markdown 标记符号。

用法:
    python check_length.py <article.md>            # 人读输出
    python check_length.py <article.md> --json     # JSON 输出

退出码: 0 = ready（1000-1200），1 = needs-length-review / rejected
"""
import sys
import re
import json
import argparse

TARGET_MIN, TARGET_MAX = 1000, 1200
TOL_MIN, TOL_MAX = 900, 1320


def net_chars(text: str) -> int:
    # 去 YAML front matter
    text = re.sub(r"\A\s*---\n.*?\n---\n", "", text, flags=re.DOTALL)
    # 去首个 H1 标题行（文章标题，单独统计口径外）
    text = re.sub(r"\A\s*#\s+.+", "", text, count=1)
    # 去图片和裸 URL
    text = re.sub(r"!\[.*?\]\(.*?\)", "", text)                          # 行内图片 ![alt](url)
    text = re.sub(r"!\[.*?\]\[[^\]]*\]", "", text)                       # 参考式图片 ![alt][ref]
    text = re.sub(r"^\[[^\]]+\]:\s*\S+", "", text, flags=re.MULTILINE)   # 参考式链接定义 [ref]: url
    text = re.sub(r"<img[^>]*>", "", text)                               # HTML 图片标签
    text = re.sub(r"https?://\S+", "", text)
    # 去 Markdown 标记符号
    text = re.sub(r"^#{1,6}\s*", "", text, flags=re.MULTILINE)   # 标题井号
    text = re.sub(r"^\s*>\s?", "", text, flags=re.MULTILINE)     # 引用块
    text = re.sub(r"^\s*[-*+]\s+", "", text, flags=re.MULTILINE) # 列表
    text = re.sub(r"[*_`~]", "", text)                           # 粗斜体代码
    text = re.sub(r"^\s*-{3,}\s*$", "", text, flags=re.MULTILINE)  # 水平分割线（只删成行的，不误伤正文里的 ---）

    chinese = len(re.findall(r"[一-鿿]", text))
    tokens = len(re.findall(r"[A-Za-z0-9]+", text))
    return chinese + tokens


def classify(n: int):
    if TARGET_MIN <= n <= TARGET_MAX:
        return "ready", 0
    if TOL_MIN <= n <= TOL_MAX:
        return "needs-length-review", 1
    return "rejected", 1


def main():
    ap = argparse.ArgumentParser(description="读书解读正文净字数校验")
    ap.add_argument("path", help="Markdown 文章路径")
    ap.add_argument("--json", action="store_true", help="JSON 输出")
    args = ap.parse_args()

    try:
        with open(args.path, encoding="utf-8") as f:
            text = f.read()
    except OSError as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False) if args.json
              else f"读取失败: {e}")
        sys.exit(2)

    n = net_chars(text)
    status, code = classify(n)

    if args.json:
        print(json.dumps({
            "net_chars": n,
            "status": status,
            "target": f"{TARGET_MIN}-{TARGET_MAX}",
        }, ensure_ascii=False))
    else:
        print(f"净字数 {n} → {status}（目标 {TARGET_MIN}-{TARGET_MAX}）")
    sys.exit(code)


if __name__ == "__main__":
    main()
