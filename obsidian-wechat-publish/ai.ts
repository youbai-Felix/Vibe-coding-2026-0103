// AI 排版：调 OpenAI 兼容 /chat/completions（或 Anthropic 兼容端点），把 markdown 重排成
// 更适合阅读的结构。策略：原句保留 + 允许适度新增（拟小标题、承接引导语，不改原意）。
// 校验兜底：原文每个句子（标题行除外）必须逐字出现在输出里——改写、删句、句内插词都会
// 被抓住；新增文字不受限。失败自动重试一次。网络走 Obsidian 原生 requestUrl（无 CORS）。

import { requestUrl } from "obsidian";

export interface AiTypesetSettings {
  aiApiUrl: string;
  aiApiKey: string;
  aiModel: string;
}

// 校验用的规范化：只保留汉字/字母/数字，其余（标点、空白、markdown 符号）全部剥掉
export function normalizeForCheck(s: string): string {
  return s.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
}

// 剥掉行首列表标记（有序 1./1、/1) 与无序 -/*/+）：有序列表化的编号数字不算正文
function stripListMarkers(md: string): string {
  return md
    .split("\n")
    .map((l) => l.replace(/^\s{0,3}(?:\d{1,3}[.、)]|[-*+])\s+/, ""))
    .join("\n");
}

// 提取原文里必须逐字保留的句子：标题行（可重拟）与引用出处行之外的正文句
function requiredSentences(md: string): string[] {
  const out: string[] = [];
  for (const line of stripListMarkers(md).split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("---")) continue;
    for (const seg of t.split(/[。！？；!?~]+/)) {
      const norm = normalizeForCheck(seg);
      if (norm.length >= 2) out.push(seg.trim());
    }
  }
  return out;
}

// 原句保留校验：每个原文句子（规范化后）必须是输出的子串；长句若因拆列表断开，
// 退化为逐个逗号小句检查。返回第一个失配的句子（null = 全部通过）。
export function findBrokenSentence(original: string, rewritten: string): string | null {
  const target = normalizeForCheck(stripListMarkers(rewritten));
  for (const seg of requiredSentences(original)) {
    const ns = normalizeForCheck(seg);
    if (target.includes(ns)) continue;
    // 整句不连续：按逗号/顿号拆小句再查（列表化会把句号间的短语拆成条目）
    const clauses = seg.split(/[，、,]+/).map(normalizeForCheck).filter((c) => c.length >= 2);
    if (clauses.length > 1 && clauses.every((c) => target.includes(c))) continue;
    return seg;
  }
  return null;
}

// 正文新增量（不含标题行）：输出比原文多出来的正文文字，用于限制引导语等杂项新增
function addedBodyChars(original: string, rewritten: string): number {
  const o = normalizeForCheck(stripListMarkers(original));
  const r = normalizeForCheck(stripListMarkers(rewritten));
  const headingChars = rewritten
    .split("\n")
    .filter((l) => l.trim().startsWith("#"))
    .reduce((n, l) => n + normalizeForCheck(l).length, 0);
  return Math.max(0, r.length - o.length - headingChars);
}

// 结构保护：只守用户明确要过的——代码块围栏+内容、手写眉题、原文高亮。
// 不做加粗/引用/行内反引号的守恒：模型正常重组强调样式（如加粗转高亮）会误杀
function structuralGuard(original: string, rewritten: string): string | null {
  const blocksOf = (s: string) => [...s.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => normalizeForCheck(m[1])).filter(Boolean);
  const origBlocks = blocksOf(original);
  if (origBlocks.length > 0) {
    // 规范化已剥空白，未改动的代码块应逐字符等长；等长 + 包含 ⇒ 内容一致，
    // 追加/改写（长度变化或非前缀）都会被拒
    const outBlocks = blocksOf(rewritten);
    for (const b of origBlocks) {
      if (!outBlocks.some((ob) => ob.length === b.length && ob.includes(b))) {
        return "代码块丢失或被改写";
      }
    }
  }
  const kickers = (s: string) => (s.match(/class=["']kicker["']/g) || []).length;
  if (kickers(rewritten) < kickers(original)) return "手写眉题标记丢失";
  // 克制配额：新增高亮全文 ≤5 处（借 gzh-design-skill「主色全文 ≤5 处」的配额思想）
  const count = (s: string, re: RegExp) => (s.match(re) || []).length;
  if (count(rewritten, /==/g) < count(original, /==/g)) return "原文高亮标记丢失";
  const addedHl = (count(rewritten, /==/g) - count(original, /==/g)) / 2;
  if (addedHl > 5) return `新增高亮过多（${addedHl} 处 > 5），重点被稀释`;
  return null;
}

// 综合校验：开场引子 → 结构守恒 + 原句保留 + 无重复引导语 + 正文新增限额 + 分隔线。
// 段落长度不设硬性守卫（用户口径：尽量，不是必须），只靠 prompt 引导。
// 返回错误描述（null = 通过）
export function validateTypeset(original: string, rewritten: string): string | null {
  // 开场规则：正文以引子开场，标题不出现在开头，且引子至少约一句话。
  // 标题判定要覆盖两种写法：ATX（# 标题）与 Setext（标题下一行 === / --- 下划线），
  // 后者曾绕过守卫导致「以标题开头」规则失效
  const lines = rewritten.split("\n");
  const isSetextUnderline = (l: string) => /^\s{0,3}(={2,}|-{3,})\s*$/.test(l);
  const isHeadingAt = (i: number) =>
    /^\s{0,3}#{1,6}\s/.test(lines[i]) ||
    (i + 1 < lines.length && lines[i].trim() !== "" && isSetextUnderline(lines[i + 1]));
  const firstMeaningfulIdx = lines.findIndex((l) => l.trim() !== "");
  if (firstMeaningfulIdx >= 0 && isHeadingAt(firstMeaningfulIdx)) return "文章以标题开头，应先有引子文字";
  const headingIdx = lines.findIndex((_, i) => isHeadingAt(i));
  if (headingIdx >= 0) {
    const lede = normalizeForCheck(lines.slice(0, headingIdx).join(""));
    if (lede.length < 12) return "标题前的引子太短（不足一句）";
  }
  const structural = structuralGuard(original, rewritten);
  if (structural) return structural;
  if (LEADIN_RE.test(rewritten) && !LEADIN_RE.test(original)) {
    return "新增了重复引导语（如「举个例子：举个简单的例子…」）";
  }
  const broken = findBrokenSentence(original, rewritten);
  if (broken) return `AI 改写或删除了原句：「${broken.slice(0, 30)}${broken.length > 30 ? "…" : ""}」`;
  // 重复守卫：任何原句在输出里出现的次数不得超过在原文里的次数——
  // 「移入引用块」被模型执行成「复制」（正文+引用各一份）就会在这里被抓
  const countIn = (haystack: string, needle: string) => haystack.split(needle).length - 1;
  const origNorm = normalizeForCheck(stripListMarkers(original));
  const outNorm = normalizeForCheck(stripListMarkers(rewritten));
  for (const seg of requiredSentences(original)) {
    const ns = normalizeForCheck(seg);
    if (ns.length < 8) continue;
    if (countIn(outNorm, ns) > countIn(origNorm, ns)) {
      return `句子被复制而非移动（重复了「${seg.slice(0, 20)}${seg.length > 20 ? "…" : ""}」）`;
    }
  }
  const o = normalizeForCheck(stripListMarkers(original));
  const cap = Math.max(20, Math.floor(o.length * 0.03));
  const added = addedBodyChars(original, rewritten);
  if (added > cap) return `正文新增文字过多（${added} 字 > 上限 ${cap} 字），疑似夹带了新内容`;
  // 分隔线：默认不用，新增至多 1 条（Setext 标题的 --- 下划线不算分隔线）
  const hrCount = (s: string) => {
    const ls = s.split("\n");
    let n = 0;
    ls.forEach((l, i) => {
      if (!/^\s*-{3,}\s*$/.test(l)) return;
      if (i > 0 && ls[i - 1].trim() !== "") return;
      n++;
    });
    return n;
  };
  if (hrCount(rewritten) - hrCount(original) > 1) return "新增分隔线超过 1 条，分隔线只在明确大转折处使用";
  return null;
}

const SYSTEM_PROMPT = `你是排版引擎。把 <<<ARTICLE>>> 与 <<<END>>> 之间的文章重排成最适合读者阅读的 markdown。

底线（输出会被程序逐句校验）：
- 原文的每个句子禁止改写、删减、调换句内文字；拿不准的句子保持原样
- 新增文字要极度克制（宁缺毋滥，正文新增合计不超过 20 字），仅限两类：
  a) 标题：为章节重拟更凝练的 H1/H2/H3，或为无小标题的段落群加小标题
  b) 「如下：」这类结构性引导，且仅当：它紧邻列表/引用块，同时原句本身没有引导词
- 严禁在已带引导词的句子前再加引导语（例句已以「举个例子/例如/比如/具体来说/如下/首先」等开头时，再加一个就是重复废话，会被直接拒收）
- 严禁新增观点、总结、解释性句子
- 结构标记原样保留：代码块（\`\`\` 围栏与语言标注）不拆不转（不得变成引用/列表/正文）；行内代码的反引号保留；手写的 <span class="kicker"> 标记原样保留

排版操作（先判断文章形态再动手——配方优于自由发挥）：
- 开场规则：文章不得以标题开头——用原文开头的 2~3 句正文作引子先行，第一个标题出现在引子之后；若原文以标题开头，把该标题移到引子后作第一个章节标题（文字可保留或重拟）
- 千字内的随笔/情感文：以段落节奏为主，少用列表，H1 章节 3~4 个
- 观点/说理文：每节「段落阐述 + 1 个引用或列表」交替，避免连续同构块
- 教程/清单文：步骤用有序列表，要点用无序列表，H2 小节细分
1. 段落长度尽力控制：目标手机 4 行内（约 90 字），超过的尽量按句群拆开；若拆分会打断论证、或单句拆不动，保留原样即可——这是尽力而为，不是硬性要求
2. 最点题的一句移入引用块（>），前后留空行；原文带出处则末行写 "> —— 出处"。「移入」= 从正文原位置移走，正文里不再保留该句——严禁正文和引用各留一份造成重复
3. 高亮是本排版的灵魂，必须用起来：为每节最核心的一句加 ==高亮==，全文新增 2~5 处——一句都不加是失职，满篇都是是灾难；短文（不足 3 节）也至少加 1 处
4. 顿号/分号密集的枚举句转列表（- 或 1.），条目文字原样，保留原引导句
5. 标题体系：H1 作章节（全文 3~7 个），小节用 H2/H3，标题可重拟；标题一律用 # 号写法，禁止用文字下划线（=== / ---）的 Setext 写法
6. 分隔线默认不用：只在内容发生明确大转折（叙事切方法论、正文切尾声）时用一条 ---，全文至多 1 条，拿不准就一条都别加

直接输出重排后的 markdown 正文：不要 <<<ARTICLE>>>/<<<END>>> 标记，不要代码块围栏，不要任何解释或前后缀。`;

// 引导语扎堆检测：如「举个例子：举个简单的例子：…」——两个引导词在 6 字内相继出现即废稿
const LEADIN_RE =
  /(举个简单的例子|举个例子|例如|比如|具体来说|总的来说|换句话说|换言之|如下)[：:，]?\s{0,6}(举个简单的例子|举个例子|例如|比如|具体来说|总的来说|换句话说|换言之)[：:，]/;

// 剥掉模型可能回显的正文标记行
function stripArticleMarkers(s: string): string {
  return s.replace(/<<<\/?(?:ARTICLE|END)>>>[^\n]*\n?/g, "");
}

// ====== 确定性自动修复：LLM 输出的常见结构违规用代码修，不再靠模型返工 ======

// 修「以标题开头」：把第一段正文移到最前（纯块移动，句子原样）
function fixLeadingHeadings(md: string): string {
  const blocks = md.trim().split(/\n\s*\n/);
  const isSetextU = (l: string) => /^\s{0,3}(={2,}|-{3,})\s*$/.test(l);
  const isHeadingBlock = (b: string) => {
    const ls = b.split("\n").filter((l) => l.trim() !== "");
    if (!ls.length) return false;
    if (/^\s{0,3}#{1,6}\s/.test(ls[0])) return true;
    return ls.length >= 2 && isSetextU(ls[1]);
  };
  const isPlainPara = (b: string) => {
    const ls = b.split("\n").filter((l) => l.trim() !== "");
    if (!ls.length || isHeadingBlock(b)) return false;
    return ls.every((l) => !/^\s{0,3}([-*+]|\d{1,3}[.、)]|>|#{1,6}|```|---)/.test(l));
  };
  if (!blocks.length || !isHeadingBlock(blocks[0])) return md;
  const moved: string[] = [];
  let ledeLen = 0;
  for (let pass = 0; pass < 2; pass++) {
    const idx = blocks.findIndex(isPlainPara);
    if (idx < 0) break;
    const [para] = blocks.splice(idx, 1);
    moved.unshift(para);
    ledeLen += normalizeForCheck(para).length;
    if (ledeLen >= 12) break;
  }
  if (!moved.length) return md;
  return [...moved, ...blocks].join("\n\n");
}

// 修「重复引导语」：剥掉扎堆引导词中的第一个（原文自含的不动）
function fixDupLeadin(md: string, original: string): string {
  if (!LEADIN_RE.test(md) || LEADIN_RE.test(original)) return md;
  return md.replace(LEADIN_RE, (_m, _a, second) => second + "：");
}

// 修「代码块围栏被拆」：原文有围栏块在输出里找不到围栏版，但内容以连续文本行
// 完整存在时，原位重新围栏
function restoreFences(original: string, out: string): string {
  const origFenced = [...original.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)];
  if (!origFenced.length) return out;
  const outFencedNorms = [...out.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => normalizeForCheck(m[1]));
  for (const m of origFenced) {
    const norm = normalizeForCheck(m[2]);
    if (!norm || outFencedNorms.some((ob) => ob.length === norm.length && ob.includes(norm))) continue;
    const lines = out.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim() || lines[i].trim().startsWith("```")) continue;
      let j = i;
      while (j < lines.length && lines[j].trim() !== "" && !lines[j].includes("```")) j++;
      if (j > i && normalizeForCheck(lines.slice(i, j).join("")) === norm) {
        lines.splice(i, j - i, "```" + (m[1] || ""), ...lines.slice(i, j), "```");
        return lines.join("\n");
      }
    }
  }
  return out;
}

export function autoFix(original: string, out: string): string {
  let fixed = fixLeadingHeadings(out);
  fixed = fixDupLeadin(fixed, original);
  fixed = restoreFences(original, fixed);
  if (fixed !== out) console.log("[wechat-publish] 已自动修复结构问题（标题开头/重复引导语/代码围栏）");
  return fixed;
}
function friendlyError(status: number, body: string): string {
  const detail = body.slice(0, 200);
  if (/1113/.test(body)) {
    return `余额不足（1113）：当前端点是按量付费的。若 Key 是 GLM Coding Plan 的订阅 Key，请把 API 地址换成 https://open.bigmodel.cn/api/anthropic/v1/messages 走订阅额度`;
  }
  switch (status) {
    case 401:
      return `401：Key 无效或无权限（${detail}）`;
    case 403:
      return `403：Key 没有该模型权限，或账户未开通此 API（${detail}）`;
    case 404:
      return `404：地址不对（${detail}）`;
    case 429:
      return `429：触发限流或额度不足（${detail}）`;
    default:
      if (status >= 500) return `${status}：服务端错误，稍后再试（${detail}）`;
      return `${status}：${detail}`;
  }
}

async function callLlm(userContent: string, s: AiTypesetSettings): Promise<string> {
  // Anthropic 兼容端点（GLM Coding Plan 的订阅额度走这里）；其余按 OpenAI 格式
  const isAnthropic = /\/anthropic/i.test(s.aiApiUrl);
  const body = isAnthropic
    ? {
        model: s.aiModel,
        max_tokens: 8192,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
        temperature: 0.2,
        thinking: { type: "disabled" },
      }
    : {
        model: s.aiModel,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
        // 排版任务不需要深度思考：关掉可把响应从几十秒压到几秒（不支持的端点会忽略此参数）
        thinking: { type: "disabled" },
        max_tokens: 8192,
      };
  const res = await requestUrl({
    url: s.aiApiUrl,
    method: "POST",
    headers: isAnthropic
      ? {
          "Content-Type": "application/json",
          "x-api-key": s.aiApiKey,
          "anthropic-version": "2023-06-01",
        }
      : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${s.aiApiKey}`,
        },
    body: JSON.stringify(body),
    throw: false,
  });
  if (res.status !== 200) {
    const bodyText = typeof res.text === "string" ? res.text : "";
    throw new Error(friendlyError(res.status, bodyText || res.statusText || ""));
  }
  const data = res.json;
  const content: unknown = isAnthropic
    ? (data?.content || []).map((c: any) => (c?.type === "text" ? c.text : "")).join("")
    : data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`API 返回里没有内容：${JSON.stringify(data).slice(0, 200)}`);
  }
  // 剥掉模型可能回显的正文标记行与代码块围栏
  return stripArticleMarkers(content)
    .trim()
    .replace(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/m, "$1")
    .trim();
}

// 排版摘要：AI 相对原文新增了哪些标记（完成提示里给用户一眼可见的改动量）
export function typesetSummary(original: string, rewritten: string): string {
  const c = (s: string, re: RegExp) => (s.match(re) || []).length;
  const hl = Math.max(0, (c(rewritten, /==/g) - c(original, /==/g)) / 2);
  const qLines = (s: string) => s.split("\n").filter((l) => l.trim().startsWith(">")).length;
  const q = Math.max(0, qLines(rewritten) - qLines(original));
  const h1 = Math.max(0, (rewritten.match(/^# /gm) || []).length - (original.match(/^# /gm) || []).length);
  const parts: string[] = [];
  if (hl) parts.push(`高亮 +${hl}`);
  if (q) parts.push(`引用 +${q}`);
  if (h1) parts.push(`章节 +${h1}`);
  return parts.length ? `：${parts.join("、")}` : "";
}

// 致命问题 = 内容完整性被破坏（改写/删句/复制/代码块内容被改）；其余为结构/配额类，
// 修复机会给过后可降级放行并在结果上标注——保证排版永远有产出
const FATAL_PROBLEM_RE = /改写或删除|复制而非移动|代码块丢失或被改写|眉题标记丢失|高亮标记丢失/;

export interface TypesetResult {
  markdown: string;
  warning: string;
}

export async function aiTypeset(
  md: string,
  s: AiTypesetSettings,
  onProgress?: (stage: string) => void
): Promise<TypesetResult> {
  if (!s.aiApiUrl || !s.aiApiKey) {
    throw new Error("未配置 AI 排版 API：请在设置里填写 API 地址和 Key");
  }
  const attempt = (userContent: string): Promise<string> =>
    Promise.race([
      callLlm(userContent, s),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("AI 排版超时（90 秒）")), 90000)
      ),
    ]);
  const freshMsg = `请排版：\n<<<ARTICLE>>>\n${md}\n<<<END>>>`;
  const repairMsg = (prev: string, problem: string) =>
    `上一版排版输出未通过程序校验。\n校验指出的问题：${problem}\n` +
    `请只修正该问题（其余保持上一版不动），重新输出完整 markdown；铁律不变：原句逐字保留、只调排版。\n` +
    `<<<ARTICLE>>>\n${md}\n<<<END>>>\n<<<上一版输出>>>\n${prev}\n<<<END>>>`;

  // 四轮：前两轮全新生成，后两轮定向修复；每轮先过代码自动修复再校验；
  // 非致命问题在给过修复机会后降级放行（带警告），只有内容完整性问题才可能最终失败
  let prev = "";
  let lastProblem = "";
  for (let round = 0; round < 4; round++) {
    const stage =
      round === 0 ? "模型生成中"
      : round === 1 ? "首次结果未过校验，重新生成中"
      : `第 ${round - 1} 次修正中（问题：${lastProblem.slice(0, 12)}…）`;
    onProgress?.(stage);
    const raw = await attempt(round < 2 || !prev ? freshMsg : repairMsg(prev, lastProblem));
    onProgress?.("校验排版结果中");
    const out = autoFix(md, raw);
    const problem = validateTypeset(md, out);
    if (!problem) return { markdown: out, warning: "" };
    console.error(`[wechat-publish] 第 ${round + 1} 版未过校验：${problem}\n模型输出：\n${out}`);
    prev = out;
    lastProblem = problem;
    if (round >= 2 && !FATAL_PROBLEM_RE.test(problem)) {
      console.warn(`[wechat-publish] 非致命问题降级放行：${problem}`);
      return { markdown: out, warning: problem };
    }
  }
  throw new Error(
    `连续 4 版未通过校验，最后一版问题：${lastProblem}。完整输出已打印在控制台（Cmd+Option+I 搜 wechat-publish），把报错发我可精确定位`
  );
}
