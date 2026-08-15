#!/usr/bin/env python3
"""book-reading 脚本回归测试。

合规样本应同时通过 check_length + check_style；踩雷样本应在对应维度 fail。
用法:
    python3 tests/test_checks.py            # unittest 直接跑
    python3 -m pytest tests/                # 或用 pytest
"""
import os
import sys
import unittest

SKILL_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(SKILL_DIR, "scripts"))
FIX = os.path.join(SKILL_DIR, "tests", "fixtures")

import check_length  # noqa: E402
import check_style   # noqa: E402
import check_originality  # noqa: E402


def _read(name):
    with open(os.path.join(FIX, name), encoding="utf-8") as f:
        return f.read()


class ChecksRegression(unittest.TestCase):
    def test_pass_sample_length_ready(self):
        n = check_length.net_chars(_read("pass_sample.md"))
        status, _ = check_length.classify(n)
        self.assertEqual(status, "ready", f"合规样本应 ready（1000-1200），实际净字数 {n} → {status}")

    def test_pass_sample_style_pass(self):
        r = check_style.check(os.path.join(FIX, "pass_sample.md"))
        self.assertEqual(r["status"], "pass", f"合规样本应 pass，实际：{r}")

    def test_fail_banned_detected(self):
        r = check_style.check(os.path.join(FIX, "fail_banned.md"))
        self.assertTrue(r["banned_hits"], "含禁用词应被检出")
        self.assertEqual(r["status"], "fail")

    def test_fail_no_closing(self):
        r = check_style.check(os.path.join(FIX, "fail_no_closing.md"))
        self.assertFalse(r["has_closing"], "缺「写在最后」应判 has_closing=False")
        self.assertEqual(r["status"], "fail")

    def test_fail_sections_out_of_range(self):
        r = check_style.check(os.path.join(FIX, "fail_sections.md"))
        self.assertFalse(2 <= r["section_count"] <= 4,
                         f"节数 {r['section_count']} 应超出 2-4 范围")
        self.assertEqual(r["status"], "fail")

    def test_two_sections_rejected(self):
        """锁死 3 节后，2 节应判 fail。"""
        import tempfile
        two = ("# T\n\n你。\n\n# 01 一\n\n**g1。** 内容一。\n\n> 引用。\n\n"
               "# 02 二\n\n**g2。** 内容二。\n\n**g3。** 内容三。\n\n# 写在最后\n\n收尾。\n")
        fd, p = tempfile.mkstemp(suffix=".md")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(two)
        try:
            r = check_style.check(p)
            self.assertEqual(r["section_count"], 2)
            self.assertEqual(r["status"], "fail", f"2 节应 fail（锁死 3 节）：{r}")
        finally:
            os.unlink(p)

    def _write_tmp(self, content):
        import tempfile
        fd, p = tempfile.mkstemp(suffix=".md")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        return p

    def test_four_sections_rejected(self):
        """锁死 3 节后，4 节应判 fail。"""
        four = ("# T\n\n# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
                "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n"
                "# 04 四\n\n**g4。** 四。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(four)
        try:
            r = check_style.check(p)
            self.assertEqual(r["section_count"], 4)
            self.assertEqual(r["status"], "fail", f"4 节应 fail：{r}")
        finally:
            os.unlink(p)

    def test_no_title_still_three_sections(self):
        """无总标题 H1 时，3 个数字编号节仍应判 section=3（保护 section 识别修复）。"""
        three = ("# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
                 "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(three)
        try:
            r = check_style.check(p)
            self.assertEqual(r["section_count"], 3)
            self.assertEqual(r["status"], "pass", f"无总标题 3 节应 pass：{r}")
        finally:
            os.unlink(p)

    def test_stale_recommend_line_warned(self):
        """残留导流推荐语（已废弃机制）→ 软警告。"""
        stale = ("# T\n\n# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
                 "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n\n👇👇读《X》：金句。\n")
        p = self._write_tmp(stale)
        try:
            r = check_style.check(p)
            self.assertTrue(any("已废弃" in w for w in r["warnings"]),
                            f"应警告残留推荐语：{r['warnings']}")
        finally:
            os.unlink(p)

    def test_digit_leading_title_not_counted_as_section(self):
        """数字开头的总标题（照搬原标题）不应被误计为节。"""
        digit = ("# 35岁还单身，是我不够好吗\n\n你。\n\n# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
                 "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(digit)
        try:
            r = check_style.check(p)
            self.assertEqual(r["section_count"], 3, f"数字标题不应误计节数：{r}")
            self.assertEqual(r["status"], "pass")
        finally:
            os.unlink(p)

    def test_section_chain_must_start_at_01(self):
        """节编号必须从 01 连续递增；跳号只数链内节数。"""
        skipped = ("# T\n\n# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
                   "# 02 二\n\n**g2。** 二。\n\n# 30 三十\n\n**g30。** 三十。\n\n# 03 三\n\n**g3。** 三。\n\n"
                   "# 写在最后\n\n收。\n")
        p = self._write_tmp(skipped)
        try:
            r = check_style.check(p)
            self.assertEqual(r["section_count"], 3, f"链外编号(30)不应计入：{r}")
        finally:
            os.unlink(p)

    def test_emdash_in_quote_block_exempt(self):
        """引用块中的书中原文含破折号 → 豁免，不判 fail。"""
        q = ("# T\n\n# 01 一\n\n**g1。** 一。\n\n> 我们并不是为了满足别人的期待而活着——岸见一郎\n\n"
             "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(q)
        try:
            r = check_style.check(p)
            self.assertEqual(r["status"], "pass", f"引用块破折号应豁免：{r}")
        finally:
            os.unlink(p)

    def test_emdash_in_body_still_fails(self):
        """正文里的破折号仍然 fail。"""
        b = ("# T\n\n# 01 一\n\n**g1。** 一——二。\n\n> 引。\n\n"
             "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(b)
        try:
            r = check_style.check(p)
            self.assertEqual(r["status"], "fail", f"正文破折号应 fail：{r}")
            self.assertTrue(any("破折号" in h for h in r["banned_hits"]))
        finally:
            os.unlink(p)


class OriginalityRegression(unittest.TestCase):
    def _write_tmp(self, content):
        import tempfile
        fd, p = tempfile.mkstemp(suffix=".md")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(content)
        return p

    def test_pass_sample_no_risks(self):
        """合规样文（已改写翻案腔）应无 risks。"""
        r = check_originality.check(os.path.join(FIX, "pass_sample.md"))
        self.assertEqual(r["status"], "pass", f"样文应三脚本全过：{r}")

    def test_pivot_over_limit_reports_risk(self):
        """翻案腔超 1 处 → has_risks。"""
        t = ("# T\n\n# 01 一\n\n**这不是勇气，而是逃避。** 又一句：看似自由，实则枷锁。\n\n> 引。\n\n"
             "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(t)
        try:
            r = check_originality.check(p)
            self.assertEqual(r["status"], "has_risks", f"翻案腔 2 处应 has_risks：{r}")
        finally:
            os.unlink(p)

    def test_pivot_in_first_h1_exempt(self):
        """首个 H1（照搬原标题）中的翻案腔豁免。"""
        t = ("# 你不是不够好，而是太想被喜欢\n\n# 01 一\n\n**g1。** 一。\n\n> 引。\n\n"
             "# 02 二\n\n**g2。** 二。\n\n# 03 三\n\n**g3。** 三。\n\n# 写在最后\n\n收。\n")
        p = self._write_tmp(t)
        try:
            r = check_originality.check(p)
            self.assertEqual(r["pivot_count"], 0, f"标题翻案腔应豁免：{r}")
        finally:
            os.unlink(p)


if __name__ == "__main__":
    unittest.main(verbosity=2)
