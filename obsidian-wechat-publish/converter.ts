import { marked } from "marked";
import type { ThemeConfig } from "./themes";

// ====== 盘古之白 ======

function addPanGu(html: string): string {
  return html.replace(/>([^<]+)</g, (match, text) => {
    let spaced = text;
    spaced = spaced.replace(/([一-龥])([a-zA-Z0-9])/g, "$1 $2");
    spaced = spaced.replace(/([a-zA-Z0-9])([一-龥])/g, "$1 $2");
    return `>${spaced}<`;
  });
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ====== Wiki-link 图片预处理 ======

function preprocessWikiLinkImages(md: string): string {
  return md.replace(/!\[\[([^\[\]|]+)(?:\|([^\[\]]+))?\]\]/g, (_match, path, alt) => {
    const trimmed = path.trim();
    if (!alt) {
      const filename = trimmed.split("/").pop()?.replace(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i, "") || trimmed;
      return `![${filename}](${encodeURI(trimmed)})`;
    }
    return `![${alt}](${encodeURI(trimmed)})`;
  });
}

// ====== 剥离 YAML frontmatter ======

function stripFrontmatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

// ====== Callout 检测：从 blockquote token 的原始文本中识别 ======

function tryParseCalloutFromToken(token: any, theme: ThemeConfig): string | null {
  const raw = token.raw || "";
  const lines = raw.split("\n").filter((l: string) => l.trim() !== "");

  if (lines.length === 0) return null;

  const firstLine = lines[0].replace(/^>\s?/, "");
  const match = firstLine.match(/^\[!(\w+)\]\s*(.*)/);
  if (!match) return null;

  const type = match[1].toLowerCase();
  const title = match[2].trim();
  const contentLines = lines
    .slice(1)
    .map((l: string) => l.replace(/^>\s?/, ""))
    .filter((l: string) => l.trim() !== "");
  const content = contentLines.join("<br>");

  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";

  if (isClassical) {
    const titlePart = title
      ? `<div style="font-size: 10px; font-weight: 400; color: #666663; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; border-bottom: 0.5px solid #D5D1C6; padding-bottom: 8px;">${esc(title)}</div>`
      : "";
    const contentPart = content
      ? `<span style="font-size: 15px; color: #262624; line-height: 1.85;">${content}</span>`
      : "";
    return `<section style="margin: 24px 0; background-color: #EBE7DF; border: 1px solid #D5D1C6; padding: 20px 24px;">${titlePart}${contentPart}</section>`;
  }

  if (isBauhaus) {
    const titlePart = title
      ? `<div style="font-size: 13px; font-weight: 900; color: #0055A4; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">${esc(title)}</div>`
      : "";
    const contentPart = content
      ? `<span style="font-size: 15px; color: #1A1A1A; line-height: 1.7; font-weight: 700; letter-spacing: 0.5px;">${content}</span>`
      : "";
    return `<section style="margin: 24px 0; background-color: #FFFFFF; border: 2px solid #1A1A1A; padding: 20px; position: relative;"><section style="position: absolute; top: -8px; right: -8px; width: 16px; height: 16px; background-color: #D32F2F; border: 2px solid #1A1A1A;"></section>${titlePart}${contentPart}</section>`;
  }

  if (isApple) {
    const titlePart = title
      ? `<div style="font-size: 13px; font-weight: 600; color: #86868B; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${esc(title)}</div>`
      : "";
    const contentPart = content
      ? `<span style="font-size: 15px; color: #1D1D1F; line-height: 1.7; font-weight: 500; letter-spacing: 0.3px;">${content}</span>`
      : "";
    return `<section style="margin: 24px 0; background-color: #F5F5F7; border-radius: 16px; padding: 20px 24px;">${titlePart}${contentPart}</section>`;
  }

  const s = CALLOUT_STYLES[type] || DEFAULT_CALLOUT;

  const titlePart = title
    ? `<span style="font-weight: 600; color: ${s.color};">${esc(title)}</span>${content ? "<br>" : ""}`
    : "";

  const contentPart = content
    ? `<span style="font-size: 15px; color: #3A332F; line-height: 1.8;">${content}</span>`
    : "";

  return `<section style="margin: 20px 0; border-left: 4px solid ${s.color}; background-color: ${s.bg}; border-radius: 4px; padding: 16px 20px;"><span style="font-size: 16px; margin-right: 6px;">${s.icon}</span>${titlePart}${contentPart}</section>`;
}

// ====== Callout 样式配置（对齐 Obsidian 原生配色） ======

interface CalloutStyle {
  icon: string;
  color: string;
  bg: string;
}

const CALLOUT_STYLES: Record<string, CalloutStyle> = {
  note:     { icon: "✏️", color: "#448aff", bg: "#e3f2fd" },
  abstract: { icon: "📋", color: "#00b8d4", bg: "#e0f7fa" },
  info:     { icon: "ℹ️", color: "#448aff", bg: "#e3f2fd" },
  todo:     { icon: "✔️", color: "#448aff", bg: "#e3f2fd" },
  tip:      { icon: "💡", color: "#00c853", bg: "#e8f5e9" },
  hint:     { icon: "💡", color: "#00c853", bg: "#e8f5e9" },
  important:{ icon: "💡", color: "#00c853", bg: "#e8f5e9" },
  success:  { icon: "✅", color: "#00c853", bg: "#e8f5e9" },
  check:    { icon: "✅", color: "#00c853", bg: "#e8f5e9" },
  done:     { icon: "✅", color: "#00c853", bg: "#e8f5e9" },
  question: { icon: "❓", color: "#ff9100", bg: "#fff3e0" },
  help:     { icon: "❓", color: "#ff9100", bg: "#fff3e0" },
  faq:      { icon: "❓", color: "#ff9100", bg: "#fff3e0" },
  warning:  { icon: "⚠️", color: "#ff9100", bg: "#fff3e0" },
  attention:{ icon: "⚠️", color: "#ff9100", bg: "#fff3e0" },
  caution:  { icon: "⚠️", color: "#ff9100", bg: "#fff3e0" },
  failure:  { icon: "❌", color: "#ff1744", bg: "#ffebee" },
  missing:  { icon: "❌", color: "#ff1744", bg: "#ffebee" },
  fail:     { icon: "❌", color: "#ff1744", bg: "#ffebee" },
  danger:   { icon: "🔥", color: "#ff1744", bg: "#ffebee" },
  error:    { icon: "🔥", color: "#ff1744", bg: "#ffebee" },
  bug:      { icon: "🐛", color: "#ff1744", bg: "#ffebee" },
  example:  { icon: "📑", color: "#7c4dff", bg: "#ede7f6" },
  quote:    { icon: "💬", color: "#9e9e9e", bg: "#f5f5f5" },
  cite:     { icon: "💬", color: "#9e9e9e", bg: "#f5f5f5" },
};

const DEFAULT_CALLOUT: CalloutStyle = { icon: "✏️", color: "#448aff", bg: "#e3f2fd" };

function renderBlockquote(lines: string[], theme: ThemeConfig): string {
  const content = lines
    .filter((l: string) => l.trim() !== "")
    .join("<br>");
  if (!content) return "";
  if (isBookTheme(theme)) return renderBookBlockquote(content, theme);
  if (isStyleTheme(theme)) return renderStyleBlockquote(content, theme);
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  if (isClassical) {
    return `<blockquote style="margin: 36px 0; padding: 4px 24px; border-left: 1px solid #262624;"><p style="font-size: 18px; color: #262624; line-height: 2; margin: 0; font-style: italic; letter-spacing: 2px; font-family: Georgia, 'Songti SC', serif;">${content}</p></blockquote>`;
  }
  if (isBauhaus) {
    return `<blockquote style="margin: 36px 0; padding: 16px 20px; border-left: 8px solid #0055A4; border-top: 2px solid #1A1A1A; border-bottom: 2px solid #1A1A1A; border-right: 2px solid #1A1A1A; background-color: #EAEAEA;"><p style="font-size: 17px; color: #1A1A1A; line-height: 1.75; margin: 0; font-weight: 900; letter-spacing: 0.5px;">${content}</p></blockquote>`;
  }
  const fontStyle = isApple ? " font-style: italic;" : "";
  return `<blockquote style="margin: 24px 0 0 0; padding: 4px 16px; border-left: 3px solid ${theme.quoteBorder};"><p style="font-size: ${theme.baseFontSize}; color: ${theme.textLight}; line-height: ${theme.lineHeight}; margin: 0;${fontStyle}">${content}</p></blockquote>`;
}

// ====== 书单系列：标题 / 加粗 / 引用 专门渲染（素墨书摘 / 暖纸书房 / 青简藏书）======

function isBookTheme(theme: ThemeConfig): boolean {
  return theme.name === "素墨书摘" || theme.name === "暖纸书房" || theme.name === "青简藏书";
}

function renderBookHeading(text: string, level: number, theme: ThemeConfig): string {
  const hw = theme.headingWeight || "600";
  const serif = " font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;";
  const isSumo = theme.name === "素墨书摘";
  const isNuanZhi = theme.name === "暖纸书房";

  let size = "16px";
  let mt = "28px";
  let decoration = "";
  let extraStyle = "";

  if (level === 1) {
    size = isSumo ? "22px" : "24px";
    mt = "30px";
    if (isSumo) {
      decoration = `border-bottom: 1px solid ${theme.border}; padding-bottom: 10px;`;
    } else if (isNuanZhi) {
      decoration = `border-bottom: 1px solid #C9A87C; padding-bottom: 12px;`;
      extraStyle = "letter-spacing: 1px;";
    } else {
      decoration = `border-bottom: 3px double #9CB5A0; padding-bottom: 10px;`;
      extraStyle = "letter-spacing: 1px;";
    }
  } else if (level === 2) {
    size = "19px";
    mt = "40px";
    if (isSumo) {
      decoration = `border-left: 3px solid rgba(0, 0, 0, 0.85); padding-left: 12px;`;
    } else if (isNuanZhi) {
      decoration = `border-left: 4px solid #9C6B3F; padding-left: 14px;`;
    } else {
      text = `<span style="display: inline-block; width: 8px; height: 8px; background-color: #2E5C4E; margin-right: 10px; vertical-align: middle;"></span>${text}`;
    }
  } else {
    decoration = `border-left: 3px solid ${theme.headingBorder}; padding-left: 10px;`;
  }

  const center: boolean = (theme as any).centerHeading;
  if (center) decoration = centerizeDecoration(decoration);
  const align = center ? " text-align: center;" : "";

  return `<section style="margin-top: ${mt}; margin-bottom: 15px;"><section style="font-size: ${size}; font-weight: ${hw}; color: ${theme.headingColor}; line-height: 1.4; letter-spacing: 0.5px;${serif} ${decoration} ${extraStyle}${align}">${text}</section></section>`;
}

function renderBookBold(text: string, theme: ThemeConfig): string {
  if (theme.name === "素墨书摘") {
    return `<strong style="font-weight: 700; color: rgba(0, 0, 0, 0.9); border-bottom: 1px solid rgba(0, 0, 0, 0.35);">${text}</strong>`;
  }
  if (theme.name === "暖纸书房") {
    return `<strong style="font-weight: 700; color: #9C6B3F; background-color: #F2E9DC; padding: 1px 4px; border-radius: 2px;">${text}</strong>`;
  }
  return `<strong style="font-weight: 700; color: #2E5C4E;">${text}</strong>`;
}

function renderBookBlockquote(content: string, theme: ThemeConfig): string {
  const serif = "font-family: Georgia, 'Songti SC', 'STSong', serif;";
  if (theme.name === "素墨书摘") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 3px solid rgba(0, 0, 0, 0.85); background-color: #F7F7F7;"><p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.7; margin: 0; font-style: italic; ${serif}">${content}</p></blockquote>`;
  }
  if (theme.name === "暖纸书房") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 4px solid #9C6B3F; background-color: #F5EFE5;"><p style="font-size: 15px; color: #6B5F54; line-height: 1.8; margin: 0; font-style: italic; ${serif}">${content}</p></blockquote>`;
  }
  return `<blockquote style="margin: 24px 0 0 0; padding: 14px 18px 12px 42px; border-left: 4px solid #2E5C4E; background-color: #E8EFE7; position: relative;"><span style="position: absolute; left: 12px; top: 2px; font-size: 34px; color: #9CB5A0; line-height: 1; ${serif}">"</span><p style="font-size: 15px; color: #2F3330; line-height: 1.8; margin: 0; ${serif}">${content}</p></blockquote>`;
}

// ====== 全文主题系列（极简留白/古典水墨/圆润治愈/装饰艺术/杂志风）专用渲染 ======

function isDiaTheme(theme: ThemeConfig): boolean {
  return theme.name.startsWith("Dia");
}

// Dia 系列配色：品牌渐变（横/竖两个方向）+ 引用块浅底渐变，未配置时回退珊瑚粉默认
function diaGrad(theme: ThemeConfig): { grad120: string; grad180: string; quote: string; tint0: string; c0: string } {
  const g = theme.diaGradient ?? ["#F8567F", "#FF8A5B", "#FFC46B"];
  const t = theme.diaQuoteTints ?? ["#FFF0F3", "#FFF3EC", "#FFF8EC"];
  return {
    grad120: `linear-gradient(120deg, ${g[0]} 0%, ${g[1]} 55%, ${g[2]} 100%)`,
    grad180: `linear-gradient(180deg, ${g[0]} 0%, ${g[1]} 55%, ${g[2]} 100%)`,
    quote: `linear-gradient(120deg, ${t[0]} 0%, ${t[1]} 60%, ${t[2]} 100%)`,
    tint0: t[0],
    c0: g[0],
  };
}

function isStyleTheme(theme: ThemeConfig): boolean {
  return (
    theme.name === "极简留白" ||
    theme.name === "古典水墨" ||
    theme.name === "圆润治愈" ||
    theme.name === "装饰艺术" ||
    theme.name === "杂志风" ||
    theme.name === "百年孤独" ||
    theme.name === "飘" ||
    theme.name === "朱砂笺" ||
    isDiaTheme(theme)
  );
}

function renderStyleHeading(text: string, level: number, theme: ThemeConfig): string {
  const n = theme.name;
  const hw = theme.headingWeight || "600";
  const serif = " font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;";
  const sans = ` font-family: ${theme.fontFamily};`;
  // 极简留白 / 圆润治愈 用无衬线标题；古典水墨 / 装饰艺术 / 杂志风 用衬线标题
  const ff = n === "古典水墨" || n === "装饰艺术" || n === "杂志风" ? serif : sans;
  const accent = theme.accent;
  let size = "16px";
  let mt = "28px";
  let decoration = "";
  let extra = "";

  // 百年孤独：橙 #F89A3A 居中粗体，各级标题统一风格（拆解自原文 h1）
  if (n === "百年孤独") {
    const sizes: Record<number, string> = { 1: "22px", 2: "18px", 3: "15px" };
    const mts: Record<number, string> = { 1: "32px", 2: "28px", 3: "24px" };
    const ls = level === 1 ? "-0.03em" : "-0.02em";
    return `<section style="margin-top: ${mts[level] || "28px"}; margin-bottom: 20px;"><section style="font-size: ${sizes[level] || "16px"}; font-weight: ${hw}; color: ${theme.headingColor}; line-height: 1.4; letter-spacing: ${ls}; text-align: center;${sans}">${text}</section></section>`;
  }

  // 朱砂笺：H1 宋体 22px 墨色 + 5px 朱红左竖线；H2 18px 深朱红 + 前置 8px 圆点；H3 16px 墨色 + 6px 圆点
  if (n === "朱砂笺") {
    const center: boolean = (theme as any).centerHeading;
    const align = center ? " text-align: center;" : "";
    if (level === 1) {
      const dec = center
        ? "border-bottom: 2px solid #B8452F; padding-bottom: 10px;"
        : "border-left: 5px solid #B8452F; padding-left: 14px;";
      return `<section style="margin-top: 34px; margin-bottom: 18px;"><section style="font-size: 22px; font-weight: 700; color: #2B2926; line-height: 1.5;${serif} ${dec}${align}">${text}</section></section>`;
    }
    const sizes: Record<number, string> = { 2: "18px", 3: "16px" };
    const colors: Record<number, string> = { 2: "#963521", 3: "#2B2926" };
    const dotSize = level === 2 ? "8px" : "6px";
    const dot = center
      ? ""
      : `<span style="display: inline-block; width: ${dotSize}; height: ${dotSize}; background-color: #B8452F; border-radius: 50%; margin-right: 9px; vertical-align: middle;"></span>`;
    return `<section style="margin-top: ${level === 2 ? "30px" : "24px"}; margin-bottom: 14px;"><section style="font-size: ${sizes[level] || "16px"}; font-weight: 600; color: ${colors[level] || "#2B2926"}; line-height: 1.5;${sans}">${dot}${text}</section></section>`;
  }

  // Dia：H1 22px + 6px 三段渐变竖条（圆角 6px，字距 -0.3px）；H2 17.5px 套系色 + 9px 渐变圆点；H3 16px + 小渐变圆点
  if (isDiaTheme(theme)) {
    const dg = diaGrad(theme);
    const gradDot = (size: string, mr: string) =>
      `<span style="display: inline-block; width: ${size}; height: ${size}; border-radius: 50%; background-image: ${dg.grad120}; margin-right: ${mr}; vertical-align: middle;"></span>`;
    const center: boolean = (theme as any).centerHeading;
    const h1Style: string = (theme as any).diaH1Style || "bar";
    // 渐变文字填充（background-clip: text）的装饰字符：▶ 播放三角 / ⏏ 旋转90°右向箭头
    const gradGlyph = (glyph: string, rotate: boolean) =>
      `<span style="display: inline-block; font-size: 15px; line-height: 1; margin-right: 9px;${rotate ? " transform: rotate(90deg);" : ""} background-image: ${dg.grad120}; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">${glyph}</span>`;
    if (level === 1) {
      const align = center ? " text-align: center;" : "";
      // 渐变胶囊：整块渐变底白字居中；不用 width:fit-content（公众号支持不稳），
      // 用「外层 text-align:center + 内层 inline-block」的等价粘贴安全写法
      if (h1Style === "pill") {
        return `<section style="margin-top: 36px; margin-bottom: 18px; text-align: center;"><section style="display: inline-block; padding: 9px 22px; border-radius: 10px; background-image: ${dg.grad120}; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12); font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.5; letter-spacing: -0.3px;${sans}">${text}</section></section>`;
      }
      // 装饰无条件显示（原竖条版行为：居中只影响文字对齐，不隐藏装饰）
      const lead =
        h1Style === "triangle"
          ? gradGlyph("▶", false)
          : h1Style === "arrow"
          ? gradGlyph("⏏", true)
          : `<section style="flex-shrink: 0; width: 6px; height: 26px; border-radius: 6px; background-image: ${dg.grad180}; margin-right: 9px;"></section>`;
      return `<section style="margin-top: 36px; margin-bottom: 18px;"><section style="display: flex; align-items: center;">${lead}<section style="flex: 1; font-size: 22px; font-weight: 700; color: #1D1D1F; line-height: 1.4; letter-spacing: -0.3px;${sans}${align}">${text}</section></section></section>`;
    }
    const sizes: Record<number, string> = { 2: "17.5px", 3: "16px" };
    const colors: Record<number, string> = { 2: theme.boldColor, 3: "#1D1D1F" };
    const dot = center ? "" : level === 2 ? gradDot("9px", "9px") : gradDot("6px", "9px");
    return `<section style="margin-top: ${level === 2 ? "28px" : "24px"}; margin-bottom: 14px;"><section style="font-size: ${sizes[level] || "16px"}; font-weight: 600; color: ${colors[level] || "#1D1D1F"}; line-height: 1.5;${sans}">${dot}${text}</section></section>`;
  }

  // 飘：橙红 #E2561B 粗体 + 左竖线（h1 粗，h3 浅橙），拆解自《飘》读书文
  if (n === "飘") {
    const sizes: Record<number, string> = { 1: "22px", 2: "19px", 3: "16px" };
    const mts: Record<number, string> = { 1: "32px", 2: "28px", 3: "22px" };
    const widths: Record<number, string> = { 1: "5px", 2: "4px", 3: "3px" };
    const lineColor = level >= 3 ? "#fac08f" : theme.accent;
    return `<section style="margin-top: ${mts[level] || "28px"}; margin-bottom: 14px;"><section style="font-size: ${sizes[level] || "16px"}; font-weight: ${hw}; color: ${theme.headingColor}; line-height: 1.4; border-left: ${widths[level] || "3px"} solid ${lineColor}; padding-left: 12px;${sans}">${text}</section></section>`;
  }

  if (level === 1) {
    mt = "30px";
    if (n === "极简留白") {
      size = "22px";
      decoration = `border-bottom: 1px solid ${theme.border}; padding-bottom: 10px;`;
    } else if (n === "古典水墨") {
      size = "24px";
      decoration = `border-bottom: 2px solid ${accent}; padding-bottom: 12px;`;
      extra = "letter-spacing: 2px;";
    } else if (n === "圆润治愈") {
      size = "22px";
      decoration = `border-bottom: 2px solid ${theme.headingBorder}; padding-bottom: 10px;`;
    } else if (n === "装饰艺术") {
      size = "26px";
      decoration = `border-bottom: 3px double ${accent}; padding-bottom: 12px;`;
      extra = "letter-spacing: 3px;";
    } else {
      // 杂志风：超大衬线 + 顶部黑粗线
      size = "30px";
      decoration = `border-top: 4px solid ${accent}; padding-top: 20px;`;
      extra = "letter-spacing: 1px;";
    }
  } else if (level === 2) {
    mt = "40px";
    if (n === "杂志风") {
      size = "20px";
      decoration = `border-bottom: 1px solid ${theme.border}; padding-bottom: 6px;`;
    } else if (n === "装饰艺术") {
      size = "19px";
      decoration = `border-bottom: 1px solid ${accent}; padding-bottom: 6px;`;
      extra = "letter-spacing: 2px;";
    } else {
      size = "19px";
      decoration = `border-left: 4px solid ${accent}; padding-left: 12px;`;
    }
  } else {
    size = "16px";
    decoration = `border-left: 3px solid ${theme.headingBorder}; padding-left: 10px;`;
  }

  const center: boolean = (theme as any).centerHeading;
  if (center) decoration = centerizeDecoration(decoration);
  const align = center ? " text-align: center;" : "";

  return `<section style="margin-top: ${mt}; margin-bottom: 15px;"><section style="font-size: ${size}; font-weight: ${hw}; color: ${theme.headingColor}; line-height: 1.4;${ff} ${decoration} ${extra}${align}">${text}</section></section>`;
}

function renderStyleBold(text: string, theme: ThemeConfig): string {
  const n = theme.name;
  if (isDiaTheme(theme)) {
    // 仅字重 + 套系品牌色，去底纹
    return `<strong style="font-weight: 700; color: ${theme.boldColor};">${text}</strong>`;
  }
  if (n === "朱砂笺") {
    return `<strong style="font-weight: 700; color: #963521; background-image: linear-gradient(to top, #F7E9E3 0%, #F7E9E3 45%, transparent 45%);">${text}</strong>`;
  }
  if (n === "极简留白") {
    return `<strong style="font-weight: 700; color: rgba(0, 0, 0, 0.9); border-bottom: 1px solid rgba(0, 0, 0, 0.35);">${text}</strong>`;
  }
  if (n === "圆润治愈") {
    return `<strong style="font-weight: 700; color: ${theme.accent}; background-color: ${theme.accentLight}; padding: 1px 5px; border-radius: 4px;">${text}</strong>`;
  }
  // 古典水墨 / 装饰艺术 / 杂志风：纯强调色
  return `<strong style="font-weight: 700; color: ${theme.boldColor};">${text}</strong>`;
}

function renderStyleBlockquote(content: string, theme: ThemeConfig): string {
  const n = theme.name;
  const serif = "font-family: Georgia, 'Songti SC', 'STSong', serif;";
  if (isDiaTheme(theme)) {
    // 引用卡用 section 而非 blockquote：编辑器会给 blockquote 补默认灰左边框且行内样式盖不住。
    // 左"边框"= 7px 渐变竖条贴住卡片左边缘（padding-left: 0），竖条用 flex 行内
    // 「flex-shrink: 0 空竖条 + 带文字兄弟 section」的已验证粘贴安全结构
    const dg = diaGrad(theme);
    const parts = content.split("<br>");
    let cite = "";
    if (parts.length > 1 && /^(-{2,}|—)/.test(parts[parts.length - 1].trim())) {
      cite = parts.pop()!.trim();
    }
    const citeHtml = cite
      ? `<span style="display: block; margin-top: 12px; font-size: 13.5px; color: #A6A1AB;">${cite}</span>`
      : "";
    return `<section style="margin: 24px 0 0 0; border-radius: 16px; background-image: ${dg.quote}; padding: 22px 26px 22px 0;"><section style="display: flex; align-items: stretch;"><section style="flex-shrink: 0; width: 4px; border-radius: 0 4px 4px 0; background-image: ${dg.grad180}; margin: -6px 18px -6px 0;"></section><section style="flex: 1;"><p style="margin: 0; font-size: 16px; line-height: 1.9; color: #33333A;">${parts.join("<br>")}</p>${citeHtml}</section></section></section>`;
  }
  if (n === "朱砂笺") {
    return `<blockquote style="margin: 24px 0 0 0; background-color: #FAF6EE; border-left: 4px solid #B8452F; border-radius: 0 10px 10px 0; padding: 16px 18px;"><span style="display: block; font-size: 32px; line-height: 1; color: #D9C0A8; margin: -4px 0 -18px -2px;${serif}">“</span><p style="font-size: 15px; color: #57534D; line-height: 1.9; margin: 0;${serif}">${content}</p></blockquote>`;
  }
  if (n === "百年孤独") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 14px 8px; border-left: 3px solid ${theme.accent}; color: ${theme.textLight}; line-height: 1.75; font-style: normal;"><p style="font-size: 15px; color: ${theme.textLight}; line-height: 1.75; margin: 0;">${content}</p></blockquote>`;
  }
  if (n === "飘") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 4px solid #075146; background-color: #eef3f0; border-radius: 2px;"><p style="font-size: 15px; color: #3e3e3e; line-height: 1.75; margin: 0;">${content}</p></blockquote>`;
  }
  if (n === "极简留白") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 3px solid ${theme.accent}; background-color: #F7F7F7;"><p style="font-size: 15px; color: rgba(0, 0, 0, 0.7); line-height: 1.7; margin: 0; font-style: italic;">${content}</p></blockquote>`;
  }
  if (n === "古典水墨") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 3px solid ${theme.accent}; background-color: #f3ece0;"><p style="font-size: 15px; color: #6b5f54; line-height: 1.9; margin: 0;${serif}">${content}</p></blockquote>`;
  }
  if (n === "圆润治愈") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 14px 18px; border-left: 4px solid ${theme.accent}; background-color: ${theme.accentLight}; border-radius: 12px;"><p style="font-size: 15px; color: #9a3412; line-height: 1.8; margin: 0;">${content}</p></blockquote>`;
  }
  if (n === "装饰艺术") {
    return `<blockquote style="margin: 24px 0 0 0; padding: 12px 16px; border-left: 3px solid ${theme.accent}; background-color: #f5efe0;"><p style="font-size: 15px; color: #6b6b6b; line-height: 1.85; margin: 0;${serif}">${content}</p></blockquote>`;
  }
  // 杂志风：大引号 + 衬线
  return `<blockquote style="margin: 24px 0 0 0; padding: 14px 18px 12px 42px; border-left: 4px solid ${theme.accent}; background-color: #F7F7F7; position: relative;"><span style="position: absolute; left: 12px; top: 2px; font-size: 34px; color: #d1d5db; line-height: 1;${serif}">"</span><p style="font-size: 15px; color: #4b5563; line-height: 1.8; margin: 0;${serif}">${content}</p></blockquote>`;
}

// ====== 书单卡片（ ```book:<style> 围栏触发，5 套自包含行内样式，不依赖文章主题）======

interface BookCardData {
  title: string;
  author: string;
  tag: string;
  quote: string[]; // 摘录（可能多行）
}

// 解析围栏正文里的「键: 值」行；支持中英 key、半角/全角冒号；无 key 的行追加到摘录
function parseBookCardData(text: string): BookCardData {
  const data: BookCardData = { title: "", author: "", tag: "", quote: [] };
  const keyMap: Record<string, "title" | "author" | "tag" | "quote"> = {
    "书名": "title", title: "title",
    "作者": "author", author: "author",
    "标签": "tag", tag: "tag",
    "摘录": "quote", quote: "quote", text: "quote", excerpt: "quote",
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^([^:：]+?)[:：]\s*(.*)$/);
    if (m) {
      const field = keyMap[m[1].trim().toLowerCase()];
      if (field) {
        const val = m[2].trim();
        if (field === "quote") {
          if (val) data.quote.push(val);
        } else if (field === "title") data.title = val;
        else if (field === "author") data.author = val;
        else if (field === "tag") data.tag = val;
        continue;
      }
    }
    data.quote.push(line);
  }
  return data;
}

// 书名展示：未带书名号则自动补 《》
function bookTitleDisplay(title: string): string {
  if (!title) return "";
  if (/^[《【]/.test(title)) return esc(title);
  return `《${esc(title)}》`;
}

// 去掉书名号取首个字，用作水墨/杂志卡片的装饰大字
function bookFirstChar(title: string): string {
  const clean = title.replace(/^[《【]|[》】]$/g, "").trim();
  return esc(clean.charAt(0) || "·");
}

// —— 1. 极简留白 ——
function renderBookCardMinimal(d: BookCardData): string {
  const sub: string[] = [];
  if (d.author) sub.push(`${esc(d.author)} 著`);
  if (d.tag) sub.push(esc(d.tag));
  const titleLine = d.title
    ? `<section style="font-size: 20px; font-weight: 700; color: #1f2937; letter-spacing: 0.5px; margin: 0 0 6px 0;">${bookTitleDisplay(d.title)}</section>` : "";
  const subLine = sub.length
    ? `<section style="font-size: 13px; color: #9ca3af; margin: 0 0 18px 0;">${sub.join(" · ")}</section>` : "";
  const quoteLine = d.quote.length
    ? `<section style="background-color: #f9fafb; border-left: 4px solid #1f2937; padding: 14px 16px; font-size: 15px; line-height: 1.8; color: #374151; border-radius: 0 6px 6px 0;">${d.quote.map(esc).join("<br>")}</section>` : "";
  return `<section style="margin: 24px 0; padding: 26px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.03);">${titleLine}${subLine}${quoteLine}</section>`;
}

// —— 2. 古典水墨 ——
function renderBookCardInk(d: BookCardData): string {
  const serif = "font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;";
  const sub: string[] = [];
  if (d.author) sub.push(`${esc(d.author)} 著`);
  if (d.tag) sub.push(esc(d.tag));
  const wm = bookFirstChar(d.title);
  const titleLine = d.title
    ? `<section style="position: relative; display: inline-block; border-bottom: 2px solid #8b2626; padding-bottom: 6px; margin-bottom: 10px;"><section style="font-size: 20px; color: #333333; letter-spacing: 4px; font-weight: 600;${serif}">${bookTitleDisplay(d.title)}</section></section>` : "";
  const subLine = sub.length
    ? `<section style="position: relative; font-size: 13px; color: #8a7f72; margin: 0 0 14px 0;${serif}">${sub.join(" · ")}</section>` : "";
  const quoteLine = d.quote.length
    ? `<section style="position: relative; font-size: 15px; line-height: 2; color: #444444; text-align: justify; text-indent: 2em;${serif}">${d.quote.map(esc).join("<br>")}</section>` : "";
  return `<section style="position: relative; margin: 24px 0; padding: 28px 24px; background-color: #f9f6f0; border: 1px solid #e2d5c3; border-radius: 4px; overflow: hidden;${serif}"><section style="position: absolute; top: -10px; right: 10px; font-size: 96px; color: #8b2626; opacity: 0.06; line-height: 1;${serif}">${wm}</section>${titleLine}${subLine}${quoteLine}</section>`;
}

// —— 3. 圆润治愈 ——
function renderBookCardHealing(d: BookCardData): string {
  const coverText = esc(d.title.replace(/^[《【]|[》】]$/g, "").trim().slice(0, 4) || "书");
  const titleLine = d.title
    ? `<section style="font-size: 17px; font-weight: 700; color: #7c2d12; margin: 0 0 6px 0;">${bookTitleDisplay(d.title)}</section>` : "";
  const authorLine = d.author
    ? `<section style="font-size: 12px; color: #c2410c; margin: 0 0 6px 0;">${esc(d.author)}</section>` : "";
  const tagLine = d.tag
    ? `<section style="margin: 0 0 8px 0;"><span style="display: inline-block; padding: 2px 9px; background-color: #ffedd5; color: #c2410c; font-size: 11px; border-radius: 999px; border: 1px solid #fed7aa;">${esc(d.tag)}</span></section>` : "";
  const quoteLine = d.quote.length
    ? `<section style="font-size: 14px; color: #9a3412; line-height: 1.7;">${d.quote.map(esc).join("<br>")}</section>` : "";
  const cover = `<section style="width: 72px; height: 98px; flex-shrink: 0; border-radius: 10px; background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); box-shadow: inset 0 0 8px rgba(154,52,18,0.08); display: flex; align-items: center; justify-content: center;"><section style="font-size: 17px; color: #7c2d12; font-weight: 700; font-family: Georgia, 'Songti SC', serif; writing-mode: vertical-rl; letter-spacing: 6px;">${coverText}</section></section>`;
  return `<section style="margin: 24px 0; padding: 22px; background-color: #fff7ed; border-radius: 24px;"><section style="display: flex; align-items: center;">${cover}<section style="flex: 1; padding-left: 16px; min-width: 0;">${titleLine}${authorLine}${tagLine}${quoteLine}</section></section></section>`;
}

// —— 4. Art Deco ——
function renderBookCardDeco(d: BookCardData): string {
  const gold = "#d4af37";
  const serif = "font-family: Georgia, 'Songti SC', serif;";
  const sub: string[] = [];
  if (d.author) sub.push(esc(d.author));
  if (d.tag) sub.push(esc(d.tag));
  const subLine = sub.length
    ? `<section style="font-size: 13px; color: #a78b3f; letter-spacing: 4px; margin-bottom: 6px;">${sub.join(" · ")}</section>` : "";
  const titleLine = d.title
    ? `<section style="font-size: 22px; color: ${gold}; letter-spacing: 6px; font-weight: 600;${serif}">${bookTitleDisplay(d.title)}</section>` : "";
  const head = (subLine || titleLine)
    ? `<section style="border-bottom: 1px solid rgba(212,175,55,0.5); padding-bottom: 12px; margin-bottom: 14px;">${subLine}${titleLine}</section>` : "";
  const quoteLine = d.quote.length
    ? `<section style="font-size: 14px; line-height: 1.85; color: #d1d5db;">${d.quote.map(esc).join("<br>")}</section>` : "";
  return `<section style="margin: 24px 0; padding: 7px; background-color: #1a1a1a;"><section style="border: 2px solid ${gold}; padding: 22px 20px;">${head}${quoteLine}</section></section>`;
}

// —— 5. 杂志大字号 ——
function renderBookCardMagazine(d: BookCardData): string {
  const glyph = bookFirstChar(d.title);
  const sub: string[] = [];
  if (d.author) sub.push(`${esc(d.author)} 著`);
  if (d.tag) sub.push(esc(d.tag));
  const subLine = sub.length
    ? `<section style="position: relative; font-size: 13px; color: #9ca3af; letter-spacing: 2px; margin-bottom: 6px;">${sub.join(" · ")}</section>` : "";
  const titleLine = d.title
    ? `<section style="position: relative; font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 16px;">${bookTitleDisplay(d.title)}</section>` : "";
  const quoteLine = d.quote.length
    ? `<section style="position: relative; font-size: 14px; line-height: 1.95; color: #4b5563; text-align: justify;"><span style="float: left; font-size: 44px; line-height: 0.9; color: #c4c4cc; font-family: Georgia, serif; margin: 4px 8px 0 0;">"</span>${d.quote.map(esc).join("<br>")}</section>` : "";
  return `<section style="position: relative; margin: 24px 0; padding: 24px; background-color: #ffffff; border-top: 4px solid #111111; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);"><section style="position: absolute; top: 4px; right: 16px; font-size: 76px; font-weight: 900; color: #f1f1f4; line-height: 1;">${glyph}</section>${subLine}${titleLine}${quoteLine}</section>`;
}

const BOOK_CARD_STYLES: Record<string, (d: BookCardData) => string> = {
  minimal: renderBookCardMinimal,
  ink: renderBookCardInk,
  healing: renderBookCardHealing,
  deco: renderBookCardDeco,
  magazine: renderBookCardMagazine,
};

// lang 形如 "book:ink"；未命中风格兜底 minimal
function renderBookCard(lang: string, text: string): string {
  const styleKey = (lang.split(":")[1] || "").trim().toLowerCase();
  const data = parseBookCardData(text);
  const fn = BOOK_CARD_STYLES[styleKey] || BOOK_CARD_STYLES.minimal;
  return fn(data);
}

// ====== 各元素渲染 ======

// 标题居中模式：把「左竖线」装饰转成「下划线」（居中 + 左竖线违和），返回处理后的 decoration
function centerizeDecoration(decoration: string): string {
  if (!decoration || !/border-left:/.test(decoration)) return decoration;
  const m = decoration.match(/border-left:\s*([^;]+);/);
  const val = m ? m[1].trim() : "3px solid currentColor";
  return decoration
    .replace(/border-left:\s*[^;]+;/, `border-bottom: ${val};`)
    .replace(/padding-left:\s*[^;]+;/, "padding-bottom: 6px;");
}

function renderHeading(text: string, level: number, theme: ThemeConfig): string {
  if (isBookTheme(theme)) return renderBookHeading(text, level, theme);
  if (isStyleTheme(theme)) return renderStyleHeading(text, level, theme);
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  const hw = theme.headingWeight || "600";
  const sizes: Record<number, { size: string; weight: string; color: string }> = {
    1: { size: "22px", weight: hw, color: theme.headingColor },
    2: { size: "19px", weight: hw, color: theme.headingColor },
    3: { size: "16px", weight: hw, color: theme.headingColor },
  };
  if (isBauhaus) {
    sizes[1] = { size: "24px", weight: "900", color: "#1A1A1A" };
    sizes[2] = { size: "20px", weight: "900", color: "#1A1A1A" };
  }
  if (isClassical) {
    sizes[1] = { size: "28px", weight: "400", color: "#262624" };
    sizes[2] = { size: "18px", weight: "400", color: "#262624" };
  }
  const s = sizes[level] || sizes[1];
  const noSerif = isApple || isBauhaus;
  const serif = noSerif ? "" : " font-family: Georgia, 'Songti SC', 'STSong', 'SimSun', serif;";
  const mt = level === 1 ? (theme.name === "卡兹克" ? "12px" : "25px") : (isBauhaus ? "48px" : "40px");
  const style = theme.headingStyle || "underline";

  let decoration = "";
  let extraStyle = "";

  if (isClassical) {
    if (level === 1) {
      decoration = `border-bottom: 1px solid #262624; padding-bottom: 16px;`;
      extraStyle = "text-transform: uppercase; letter-spacing: 2px;";
    } else if (level === 2) {
      decoration = `border-bottom: 0.5px solid #666663; padding-bottom: 4px; display: inline-block;`;
      extraStyle = "text-transform: uppercase; letter-spacing: 3px;";
    }
  } else if (isBauhaus) {
    if (level === 1) {
      text = `${text}<span style="display: inline-block; width: 24px; height: 24px; background-color: #FFCC00; border-radius: 50%; border: 2px solid #1A1A1A; margin-left: 12px; vertical-align: middle;"></span>`;
    } else if (level === 2) {
      text = `<span style="display: inline-block; width: 16px; height: 16px; background-color: #D32F2F; border: 2px solid #1A1A1A; margin-right: 10px; vertical-align: middle; flex-shrink: 0;"></span>${text}`;
      decoration = `border-bottom: 4px solid #1A1A1A; padding-bottom: 8px; display: flex; align-items: center; gap: 12px;`;
    }
  } else if (style === "underline" && level <= 2) {
    const bw = theme.headingBorderWidth || "2px";
    decoration = `border-bottom: ${bw} solid ${theme.headingBorder}; padding-bottom: 8px;`;
  } else if (style === "left-bar" && level === 2) {
    if (theme.name === "卡兹克") {
      decoration = `border-left: 3px solid rgba(0, 0, 0, 0.4); border-radius: 4px; padding-left: 12px;`;
    } else {
      decoration = `border-left: 4px solid ${theme.accent}; padding-left: 12px;`;
    }
  } else if (style === "left-bar" && level === 1) {
    decoration = "";
  } else if (style === "classic" && level === 1) {
    decoration = `text-align: center;`;
  }

  const borderTop =
    level === 1 && style === "underline" && !isClassical
      ? "border-top: 1px solid " + theme.border + "; padding-top: 35px;"
      : "";

  const center: boolean = (theme as any).centerHeading;
  if (center) {
    decoration = centerizeDecoration(decoration);
    if (/display:\s*flex/.test(decoration)) decoration += " justify-content: center;";
  }
  const align = center ? " text-align: center;" : "";

  return `<section style="margin-top: ${mt}; ${borderTop} margin-bottom: 15px;"><section style="font-size: ${s.size}; font-weight: ${s.weight}; color: ${s.color}; line-height: 1.4; letter-spacing: ${isApple ? "-0.3px" : (isBauhaus ? "-0.5px" : "0")};${serif} ${decoration} ${extraStyle}${align}">${text}</section></section>`;
}

function renderParagraph(text: string, theme: ThemeConfig): string {
  if (!text) return "";
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  let extra = "";
  if (isApple) extra = " letter-spacing: 0.3px;";
  else if (isBauhaus) extra = " letter-spacing: 0.3px; font-weight: 500;";
  else if (theme.letterSpacing) extra = ` letter-spacing: ${theme.letterSpacing};`;
  return `<section style="margin: ${theme.paragraphMargin} 0 0 0;"><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text}; text-align: justify; font-family: ${theme.fontFamily}; display: block;${extra}">${text}</span></section>`;
}

function renderBold(text: string, theme: ThemeConfig): string {
  if (isBookTheme(theme)) return renderBookBold(text, theme);
  if (isStyleTheme(theme)) return renderStyleBold(text, theme);
  const isBauhaus = theme.name === "包豪斯";
  const weight = isBauhaus ? "900" : "700";
  return `<strong style="font-weight: ${weight}; color: ${theme.boldColor};">${text}</strong>`;
}

function renderItalic(text: string): string {
  return `<em>${text}</em>`;
}

function renderInlineCode(text: string, theme: ThemeConfig): string {
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  const isZhusha = theme.name === "朱砂笺";
  const isDia = isDiaTheme(theme);
  if (isZhusha) {
    return `<span style="font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 13px; color: #2C2A27; background-color: #F0EADD; padding: 2px 5px; border-radius: 3px;">${text}</span>`;
  }
  if (isDia) {
    // 行内代码：品牌色文字 + 主题浅底胶囊（与引用卡浅底同源）
    return `<span style="font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace; font-size: 13.5px; color: ${theme.boldColor}; background-color: ${diaGrad(theme).tint0}; padding: 1px 7px; border-radius: 6px;">${text}</span>`;
  }
  if (isBauhaus) {
    return `<span style="font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 14px; color: #1A1A1A; background-color: #FFFFFF; padding: 2px 6px; border: 2px solid #1A1A1A; font-weight: 900;">${text}</span>`;
  }
  if (isClassical) {
    return `<span style="font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 13px; color: #F2EFE9; background-color: #262624; padding: 2px 6px; text-transform: uppercase; letter-spacing: 1px;">${text}</span>`;
  }
  const radius = isApple ? "6px" : "3px";
  const padding = isApple ? "3px 6px" : "0.15em 0.18em";
  return `<span style="font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 14px; color: ${theme.codeText}; background-color: ${theme.codeBg}; padding: ${padding}; border-radius: ${radius};">${text}</span>`;
}

function renderUnorderedList(
  items: string[],
  theme: ThemeConfig,
  rawLines?: string[]
): string {
  const isChunmu = theme.name === "春木培土";
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isZhusha = theme.name === "朱砂笺";
  const isDia = isDiaTheme(theme);
  const rendered = items.map((content, i) => {
    // 任务列表检测：检查原始行是否以 - [ ] 或 - [x] 开头
    const raw = rawLines?.[i] || "";
    const taskMatch = raw.match(/^[-*]\s+\[([ xX])\]\s*/);
    if (taskMatch) {
      const checked = taskMatch[1] !== " ";
      const checkbox = checked
        ? `<span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border: 1.5px solid ${theme.accent}; border-radius: 3px; background-color: ${theme.accent}; margin-right: 8px; flex-shrink: 0; margin-top: 3px; font-size: 11px; color: white; line-height: 1;">✓</span>`
        : `<span style="display: inline-block; width: 16px; height: 16px; border: 1.5px solid ${theme.border}; border-radius: 3px; margin-right: 8px; flex-shrink: 0; margin-top: 3px;"></span>`;
      const textColor = checked ? `color: ${theme.textLight}; text-decoration: line-through;` : `color: ${theme.text};`;
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 10px;">${checkbox}<span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; ${textColor}">${content}</span></section>`;
    }

    if (isChunmu) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 15px;"><section style="margin-right: 12px; margin-top: 8px; flex-shrink: 0; width: 6.5px; height: 6.5px; border: 1.5px solid #1F6E43; border-radius: 50%; box-sizing: border-box; background-color: #F0F7F2; box-shadow: 0 0 0 4px #D8ECD8;"></section><span style="color: #3A332F; line-height: 1.7; font-size: ${theme.baseFontSize};">${content}</span></section>`;
    }
    if (isApple) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 12px;"><section style="margin-right: 12px; margin-top: 10px; flex-shrink: 0; width: 6px; height: 6px; border-radius: 50%; background-color: ${theme.bulletColor};"></section><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text};">${content}</span></section>`;
    }
    if (isBauhaus) {
      const color = i % 2 === 0 ? "#0055A4" : "#FFCC00";
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 12px;"><section style="margin-right: 12px; margin-top: 8px; flex-shrink: 0; width: 10px; height: 10px; background-color: ${color}; border: 1.5px solid #1A1A1A;"></section><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text}; font-weight: 500;">${content}</span></section>`;
    }
    if (isZhusha) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 13px;"><section style="flex-shrink: 0; width: 7px; height: 7px; background-color: #B8452F; transform: rotate(45deg); margin-right: 13px; margin-top: 10px;"></section><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text};">${content}</span></section>`;
    }
    if (isDia) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 14px;"><section style="flex-shrink: 0; width: 8px; height: 8px; border-radius: 50%; background-image: ${diaGrad(theme).grad120}; margin-right: 12px; margin-top: 10px;"></section><span style="font-size: ${theme.baseFontSize}; line-height: 1.72; color: ${theme.text};">${content}</span></section>`;
    }
    return `<section style="margin: 0; padding-left: 16px; text-indent: -16px;"><span style="color: ${theme.bulletColor}; margin-right: 6px;">${theme.bulletChar}</span><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text};">${content}</span></section>`;
  });
  return `<section style="margin: 25px 0;">${rendered.join("")}</section>`;
}

function renderOrderedList(
  items: string[],
  theme: ThemeConfig
): string {
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isZhusha = theme.name === "朱砂笺";
  const isDia = isDiaTheme(theme);
  const rendered = items.map((content, i) => {
    const num = String(i + 1);
    if (isDia) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 15px;"><section style="flex-shrink: 0; width: 26px; height: 26px; border-radius: 9px; background-image: ${diaGrad(theme).grad120}; display: flex; align-items: center; justify-content: center; margin-right: 14px; margin-top: 2px;"><span style="font-size: 13px; font-weight: 700; color: #FFFFFF; font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace;">${num}</span></section><span style="font-size: ${theme.baseFontSize}; line-height: 1.72; color: ${theme.text};">${content}</span></section>`;
    }
    if (isZhusha) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 14px;"><section style="flex-shrink: 0; width: 24px; height: 24px; background-color: #B8452F; border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 2px;"><span style="font-size: 13px; font-weight: 600; color: #FFFFFF;">${num}</span></section><span style="font-size: ${theme.baseFontSize}; line-height: 1.7; color: ${theme.text};">${content}</span></section>`;
    }
    if (isApple) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 12px;"><section style="flex-shrink: 0; width: 24px; height: 24px; border-radius: 6px; background-color: ${theme.numBg}; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 3px;"><span style="font-size: 13px; font-weight: 600; color: ${theme.numText};">${num}</span></section><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text};">${content}</span></section>`;
    }
    if (isBauhaus) {
      return `<section style="display: flex; align-items: flex-start; margin-bottom: 16px;"><section style="flex-shrink: 0; width: 24px; height: 24px; background-color: #1A1A1A; display: flex; align-items: center; justify-content: center; margin-right: 12px; margin-top: 4px;"><span style="font-size: 14px; font-weight: 900; color: #FFFFFF;">${num}</span></section><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text}; font-weight: 500;">${content}</span></section>`;
    }
    const padNum = num.padStart(2, "0");
    return `<section style="margin: 0; padding-left: 28px; text-indent: -28px;"><span style="font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 12px; color: ${theme.numText}; background-color: ${theme.numBg}; padding: 1px 5px; border-radius: 3px; margin-right: 8px;">${padNum}</span><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text};">${content}</span></section>`;
  });
  return `<section style="margin: 25px 0;">${rendered.join("")}</section>`;
}

function renderCodeBlock(code: string, theme: ThemeConfig): string {
  const isChunmu = theme.name === "春木培土";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  const isZhusha = theme.name === "朱砂笺";
  const isDia = isDiaTheme(theme);
  const bg = isChunmu ? "#F5F0E6" : theme.codeBg;
  const border = isChunmu ? "1px solid #EBE3D5" : "none";
  const escaped = esc(code).replace(/\n/g, "<br>");

  if (isDia) {
    // 左上角三个圆点 = 主题渐变三停色，用带真实文字的 ● 字符实现（空 span 装饰点会被公众号剥掉）
    const [c1, c2, c3] = theme.diaGradient ?? ["#F8567F", "#FF8A5B", "#FFC46B"];
    const dot = (c: string, mr: string) => `<span style="color: ${c}; font-size: 9px;${mr}">●</span>`;
    return `<section style="margin: 24px 0 0 0; background-color: #F7F7F4; border: 1px solid #EDEDEA; border-radius: 16px; padding: 16px 18px 18px;"><section style="margin: 0 0 10px 0; line-height: 1;">${dot(c1, " margin-right: 5px;")}${dot(c2, " margin-right: 5px;")}${dot(c3, "")}</section><section style="display: block; margin: 0; font-family: 'SF Mono', 'JetBrains Mono', Menlo, Consolas, monospace; font-size: 13px; line-height: 1.72; color: #3A3A40;">${escaped}</section></section>`;
  }

  if (isZhusha) {
    return `<section style="margin: 24px 0 0 0; background-color: #2C2A27; border-radius: 12px; padding: 18px 20px; overflow-x: auto;"><section style="display: block; margin: 0; font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 13px; color: #E9E2D4; line-height: 1.7;">${escaped}</section></section>`;
  }

  if (isClassical) {
    return `<section style="margin: 24px 0; background-color: #EBE7DF; border: 1px solid #D5D1C6; padding: 24px; overflow-x: auto;"><section style="display: block; margin: 0; font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 13px; color: #262624; line-height: 1.7;">${escaped}</section></section>`;
  }

  if (isBauhaus) {
    return `<section style="margin: 24px 0; border: 3px solid #1A1A1A; background-color: #1A1A1A; box-shadow: 6px 6px 0px #0055A4;"><section style="display: flex; gap: 8px; padding: 10px 16px; border-bottom: 2px solid #555555; background-color: #333333;"><span style="width: 12px; height: 12px; background-color: #D32F2F; border: 1px solid #1A1A1A;"></span><span style="width: 12px; height: 12px; background-color: #FFCC00; border: 1px solid #1A1A1A;"></span><span style="width: 12px; height: 12px; background-color: #0055A4; border: 1px solid #1A1A1A;"></span></section><section style="padding: 20px; overflow-x: auto;"><section style="display: block; margin: 0; font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 14px; color: #F4F4F0; line-height: 1.6;">${escaped}</section></section></section>`;
  }

  if (theme.macCodeBlock) {
    return `<section style="margin: 24px 0 0 0; border-radius: ${theme.codeBlockRadius}; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);"><section style="background-color: #282C34; padding: 10px 16px; display: flex; align-items: center; gap: 6px;"><span style="width: 10px; height: 10px; border-radius: 50%; background-color: #FF5F57;"></span><span style="width: 10px; height: 10px; border-radius: 50%; background-color: #FEBC2E;"></span><span style="width: 10px; height: 10px; border-radius: 50%; background-color: #28C840;"></span></section><section style="background-color: #1E1E1E; padding: 16px; overflow-x: auto;"><section style="display: block; margin: 0; font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 13px; color: #ABB2BF; line-height: 1.5;">${escaped}</section></section></section>`;
  }

  return `<section style="margin: 24px 0 0 0; background-color: ${bg}; border: ${border}; border-radius: ${theme.codeBlockRadius}; padding: 16px; overflow-x: auto;"><section style="display: block; margin: 0; font-family: 'Menlo', Monaco, Consolas, monospace; font-size: 14px; color: ${theme.codeBlockText}; line-height: 1.45;">${escaped}</section></section>`;
}

function renderHr(theme: ThemeConfig): string {
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isZhusha = theme.name === "朱砂笺";
  const isDia = isDiaTheme(theme);
  if (isBauhaus) {
    return `<section style="margin: 40px 0;"><section style="border-top: 4px solid #1A1A1A;"></section></section>`;
  }
  if (isZhusha) {
    const gap = `<span style="display: inline-block; width: 14px;"></span>`;
    const dot = (c: string) => `<span style="color: #B8452F; font-size: 9px;">${c}</span>`;
    return `<section style="margin: 34px 0; position: relative; text-align: center;"><section style="position: absolute; top: 50%; left: 0; right: 0; border-top: 1px solid #E7DDCD;"></section><section style="display: inline-block; position: relative; padding: 0 16px; background-color: ${theme.background};">${dot("◆")}${gap}${dot("◆")}${gap}${dot("◆")}</section></section>`;
  }
  if (isDia) {
    return `<section style="margin: 34px auto; text-align: center;"><section style="display: inline-block; width: 36px; height: 5px; border-radius: 5px; background-image: ${diaGrad(theme).grad120};"></section></section>`;
  }
  const color = isApple ? "#F5F5F7" : theme.name === "春木培土" ? "#eee" : theme.headingBorder;
  return `<section style="margin: 30px 0;"><section style="border-top: 1px solid ${color};"></section></section>`;
}

function renderTable(token: any, theme: ThemeConfig): string {
  const headers: string[] = [];
  const rows: string[][] = [];

  // 提取表头
  if (token.header && token.header.length > 0) {
    for (const cell of token.header) {
      headers.push(renderInlineTokens(cell.tokens, theme));
    }
  }

  // 提取行数据
  if (token.rows) {
    for (const row of token.rows) {
      const cells: string[] = [];
      for (const cell of row) {
        cells.push(renderInlineTokens(cell.tokens, theme));
      }
      rows.push(cells);
    }
  }

  if (headers.length === 0) return "";

  let html = `<section style="margin: 24px 0; overflow-x: auto;"><table style="width: 100%; border-collapse: collapse; font-size: ${theme.baseFontSize}; color: ${theme.text};">`;

  // 表头
  html += `<thead><tr>`;
  for (const h of headers) {
    html += `<th style="padding: 10px 12px; text-align: left; border-bottom: 2px solid ${theme.border}; font-weight: 600; color: ${theme.headingColor}; background-color: ${theme.accentLight};">${h}</th>`;
  }
  html += `</tr></thead>`;

  // 表体
  if (rows.length > 0) {
    html += `<tbody>`;
    rows.forEach((row, i) => {
      const bg = i % 2 === 1 ? `background-color: ${theme.accentLight};` : "";
      html += `<tr>`;
      for (const cell of row) {
        html += `<td style="padding: 8px 12px; border-bottom: 1px solid ${theme.listBorder}; ${bg}">${cell}</td>`;
      }
      html += `</tr>`;
    });
    html += `</tbody>`;
  }

  html += `</table></section>`;
  return html;
}

function renderImage(src: string, alt: string, theme: ThemeConfig): string {
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  const imgRadius = isApple ? "16px" : "4px";
  let caption = "";
  if (alt && (theme as any).imageCaption) {
    if (isBauhaus) {
      caption = `<span style="font-size: 13px; color: #1A1A1A; display: block; text-align: center; margin-top: 5px; font-weight: 900; letter-spacing: 0.5px;">${esc(alt)}</span>`;
    } else if (isClassical) {
      caption = `<span style="font-size: 11px; color: #666663; display: block; text-align: left; margin-top: 5px; letter-spacing: 2px; text-transform: uppercase;">${esc(alt)}</span>`;
    } else {
      caption = `<span style="font-size: 13px; color: ${theme.textLight}; display: block; text-align: center; margin-top: 5px;">${esc(alt)}</span>`;
    }
  }
  if (isBauhaus) {
    return `<section style="margin: 20px 0; text-align: center;"><img style="max-width: 100%; border: 3px solid #1A1A1A; box-shadow: 6px 6px 0px #D32F2F;" src="${src}" alt="${esc(alt)}" />${caption}</section>`;
  }
  if (isClassical) {
    return `<section style="margin: 20px 0;"><img style="max-width: 100%; display: block;" src="${src}" alt="${esc(alt)}" />${caption}</section>`;
  }
  return `<section style="margin: 20px 0; text-align: center;"><img style="max-width: 100%; border-radius: ${imgRadius};" src="${src}" alt="${esc(alt)}" />${caption}</section>`;
}

// ====== 主转换函数 ======

export interface ConvertOptions {
  resolveImage?: (src: string) => string;
  fontSize?: string;
  fontFamily?: string;
  accentColor?: string;
  sideMargin?: number;
  centerHeading?: boolean;
  imageCaption?: boolean;
  diaH1Style?: string;
}

export function buildConvertOptions(s: { fontSize: string; fontFamily: string; accentColor: string; sideMargin: number; centerHeading: boolean; imageCaption: boolean; diaH1Style?: string }, fontFamilyMap: Record<string, { label: string; value: string }>, resolveImage?: (src: string) => string): ConvertOptions {
  return {
    resolveImage,
    fontSize: s.fontSize,
    fontFamily: fontFamilyMap[s.fontFamily]?.value,
    accentColor: s.accentColor || undefined,
    sideMargin: s.sideMargin,
    centerHeading: s.centerHeading,
    imageCaption: s.imageCaption,
    diaH1Style: s.diaH1Style,
  };
}

// 复制富文本 HTML 到剪贴板：写入 text/html（公众号等富文本编辑器据此识别 inline 样式），
// text/plain 必须放纯文字（否则粘贴时会把 <section style=...> 当明文打出来）。
// Obsidian/Electron 里 ClipboardItem 经常调不动，需可靠的降级。
export async function copyHTMLToClipboard(html: string): Promise<void> {
  const plainText = htmlToPlainText(html);

  // 优先用现代 Clipboard API：同时写入富文本与纯文本
  const ClipboardItemCtor = (window as any).ClipboardItem;
  const clip = (navigator as any).clipboard;
  if (typeof ClipboardItemCtor !== "undefined" && clip && typeof clip.write === "function") {
    try {
      const item = new ClipboardItemCtor({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([plainText], { type: "text/plain" }),
      });
      await clip.write([item]);
      return;
    } catch {
      // 继续降级
    }
  }

  // 降级：用隐藏的 contenteditable + execCommand('copy')，
  // 在 Obsidian/Electron 环境里可靠地同时写入 text/html 与 text/plain。
  if (copyRichTextViaSelection(html)) return;

  // 最终兜底：仅纯文字（绝不把 HTML 源码当文本复制）
  await navigator.clipboard.writeText(plainText);
}

// 从 HTML 提取纯文字（用于剪贴板的 text/plain 通道）
function htmlToPlainText(html: string): string {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return (tmp.innerText || tmp.textContent || "").trim();
}

// 选中隐藏节点 + execCommand('copy') 复制富文本：浏览器会自动同时生成 text/html 与 text/plain
function copyRichTextViaSelection(html: string): boolean {
  try {
    const container = document.createElement("div");
    container.setAttribute("contenteditable", "true");
    container.style.position = "fixed";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.opacity = "0";
    container.innerHTML = html;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (!selection) {
      document.body.removeChild(container);
      return false;
    }
    selection.removeAllRanges();
    selection.addRange(range);
    const ok = document.execCommand("copy");
    selection.removeAllRanges();
    document.body.removeChild(container);
    return ok;
  } catch {
    return false;
  }
}

export function markdownToWechatHTML(
  markdown: string,
  theme: ThemeConfig,
  options?: ConvertOptions
): string {
  // 应用覆盖设置
  const t = { ...theme };
  // 标题居中（运行时挂到 theme，各标题 render 函数读取，避免改一堆函数签名）
  (t as any).centerHeading = options?.centerHeading ?? false;
  // Dia 系列一级标题装饰样式（bar/triangle/arrow）
  (t as any).diaH1Style = options?.diaH1Style ?? "bar";
  // 图片下方标注（默认不显示，读取图片 alt 作为标注文字）
  (t as any).imageCaption = options?.imageCaption ?? false;
  if (options?.fontSize) t.baseFontSize = options.fontSize;
  if (options?.fontFamily) t.fontFamily = options.fontFamily;
  // Dia 系列配色由所选渐变变体整体驱动，主题色选取器不覆盖（否则加粗/标题会被钉成旧色，切变体看不出变化）
  if (options?.accentColor && !isDiaTheme(theme)) {
    t.accent = options.accentColor;
    t.accentLight = options.accentColor + "15";
    t.numText = options.accentColor;
    t.numBg = options.accentColor + "15";
    t.quoteBorder = options.accentColor;
    t.highlightText = options.accentColor;
    t.bulletColor = options.accentColor;
    t.codeText = options.accentColor;
    t.headingColor = options.accentColor;
    t.headingBorder = options.accentColor;
    t.boldColor = options.accentColor;
  }
  const sideMargin = options?.sideMargin ?? 15;
  const resolveImage = options?.resolveImage;
  // 预处理
  let processedMd = stripFrontmatter(markdown);
  processedMd = preprocessWikiLinkImages(processedMd);

  // 用 marked 解析 Markdown 为 token 树
  const tokens = marked.lexer(processedMd);

  // 遍历 token 树生成微信 HTML
  const parts: string[] = [];
  const ri = resolveImage;

  for (const token of tokens) {
    switch (token.type) {
      case "heading":
        parts.push(
          renderHeading(renderInlineTokens(token.tokens, t, ri), token.depth, t)
        );
        break;
      case "paragraph": {
        const text = renderInlineTokens(token.tokens, t, ri);
        parts.push(renderParagraph(text, t));
        break;
      }
      case "image": {
        const src = ri ? ri(token.href || "") : (token.href || "");
        parts.push(renderImage(src, token.text || "", t));
        break;
      }
      case "list":
        if (token.ordered) {
          parts.push(
            renderOrderedList(
              token.items.map((item: any) =>
                item.tokens
                  .map((it: any) => renderInlineTokens(it.tokens, t, ri))
                  .join("<br>")
              ),
              t
            )
          );
        } else {
          const rawMdLines = processedMd.split("\n");
          parts.push(
            renderUnorderedList(
              token.items.map((item: any) =>
                item.tokens
                  .map((it: any) => renderInlineTokens(it.tokens, t, ri))
                  .join("<br>")
              ),
              t,
              rawMdLines
            )
          );
        }
        break;
      case "blockquote": {
        const calloutHtml = tryParseCalloutFromToken(token, t);
        if (calloutHtml) {
          parts.push(calloutHtml);
        } else {
          // 引用按行渲染：单段落内的 markdown 软换行（esc 保留的 \n）也拆成独立行
          const bqText = (token.tokens || [])
            .map((bt: any) => renderInlineTokens(bt.tokens, t, ri))
            .join("<br>")
            .split("\n")
            .map((s: string) => s.trim())
            .filter((s: string) => s !== "")
            .join("<br>");
          parts.push(renderBlockquote([bqText], t));
        }
        break;
      }
      case "code":
        if (token.lang && token.lang.startsWith("book:")) {
          parts.push(renderBookCard(token.lang, token.text));
          break;
        }
        parts.push(renderCodeBlock(token.text, t));
        break;
      case "hr":
        parts.push(renderHr(t));
        break;
      case "table":
        parts.push(renderTable(token, t));
        break;
    }
  }

  let html = parts.join("");

  // 盘古之白
  html = addPanGu(html);

  // 卡兹克专属：取消文章顶部间距，让首个块紧贴顶部
  if (t.name === "卡兹克") {
    html = html.replace(
      /^<(section|blockquote) style="([^"]*)"/,
      (_m, tag, style) => {
        let s = style;
        s = s.replace(/margin-top:\s*[^;"']*/, "margin-top: 0");
        s = s.replace(/(margin:)\s*([^;"']*)/, (_mm: string, kw: string, val: string) => {
          const arr = val.trim().split(/\s+/);
          if (arr.length) arr[0] = "0";
          return kw + " " + arr.join(" ");
        });
        return `<${tag} style="${s}"`;
      }
    );
  }

  // 外层包裹
  const isBauhaus = t.name === "包豪斯";
  const isClassical = t.name === "古典科技";
  if (isBauhaus) {
    html = `<section style="background-color: ${t.background}; border: 2px solid #1A1A1A; border-top: 8px solid #0055A4; box-shadow: 8px 8px 0px #1A1A1A; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: 1px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
  } else if (isClassical) {
    html = `<section style="background-color: ${t.background}; border: 1px solid #E0DCD1; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: 1px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
  } else {
    const topPad = t.name === "卡兹克" ? 0 : 1;
    html = `<section style="background-color: ${t.background}; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: ${topPad}px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
  }

  return html;
}

// ====== 内联 token 渲染 ======

function renderInlineTokens(
  tokens: any[] | undefined,
  theme: ThemeConfig,
  resolveImage?: (src: string) => string
): string {
  if (!tokens) return "";
  return tokens.map((tk: any) => renderInlineToken(tk, theme, resolveImage)).join("");
}

function renderInlineToken(token: any, theme: ThemeConfig, resolveImage?: (src: string) => string): string {
  if (token.type === "text") {
    return esc(token.raw || token.text || "");
  }
  if (token.type === "strong") {
    return renderBold(renderInlineTokens(token.tokens, theme, resolveImage), theme);
  }
  if (token.type === "em") {
    return renderItalic(renderInlineTokens(token.tokens, theme, resolveImage));
  }
  if (token.type === "codespan") {
    return renderInlineCode(esc(token.text), theme);
  }
  if (token.type === "image") {
    const src = resolveImage ? resolveImage(token.href || "") : (token.href || "");
    const alt = token.text || "";
    const isApple = theme.name === "苹果";
    const caption = alt && (theme as any).imageCaption
      ? `<span style="font-size: 13px; color: ${theme.textLight}; display: block; text-align: center; margin-top: 5px;">${esc(alt)}</span>`
      : "";
    const imgRadius = isApple ? "16px" : "4px";
    return `<section style="margin: 20px 0; text-align: center;"><img style="max-width: 100%; border-radius: ${imgRadius};" src="${src}" alt="${esc(alt)}" />${caption}</section>`;
  }
  if (token.type === "del") {
    return `<del style="text-decoration: line-through; color: ${theme.textLight};">${renderInlineTokens(token.tokens, theme, resolveImage)}</del>`;
  }
  if (token.type === "link") {
    const href = token.href || "";
    const text = renderInlineTokens(token.tokens, theme, resolveImage);
    return `<span style="color: ${theme.accent}; text-decoration: underline;">${text}</span>`;
  }
  // 兜底：递归处理子 token
  if (token.tokens) {
    return renderInlineTokens(token.tokens, theme, resolveImage);
  }
  return esc(token.raw || "");
}
