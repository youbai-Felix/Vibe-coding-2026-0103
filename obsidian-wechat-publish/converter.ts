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

// ====== 各元素渲染 ======

function renderHeading(text: string, level: number, theme: ThemeConfig): string {
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  const sizes: Record<number, { size: string; weight: string; color: string }> = {
    1: { size: "22px", weight: "600", color: theme.headingColor },
    2: { size: "19px", weight: "600", color: theme.headingColor },
    3: { size: "16px", weight: "600", color: theme.headingColor },
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
  const mt = level === 1 ? "25px" : (isBauhaus ? "48px" : "40px");
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
    if (isApple) {
      decoration = "";
      text = `<span style="display: inline-block; width: 4px; height: 20px; background-color: ${theme.accent}; border-radius: 2px; margin-right: 8px; vertical-align: middle;"></span>${text}`;
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

  return `<section style="margin-top: ${mt}; ${borderTop} margin-bottom: 15px;"><section style="font-size: ${s.size}; font-weight: ${s.weight}; color: ${s.color}; line-height: 1.4; letter-spacing: ${isApple ? "-0.3px" : (isBauhaus ? "-0.5px" : "0")};${serif} ${decoration} ${extraStyle}">${text}</section></section>`;
}

function renderParagraph(text: string, theme: ThemeConfig): string {
  if (!text) return "";
  const isApple = theme.name === "苹果";
  const isBauhaus = theme.name === "包豪斯";
  const isClassical = theme.name === "古典科技";
  let extra = "";
  if (isApple) extra = " letter-spacing: 0.3px;";
  else if (isBauhaus) extra = " letter-spacing: 0.3px; font-weight: 500;";
  return `<section style="margin: ${theme.paragraphMargin} 0 0 0;"><span style="font-size: ${theme.baseFontSize}; line-height: ${theme.lineHeight}; color: ${theme.text}; text-align: justify; font-family: ${theme.fontFamily}; display: block;${extra}">${text}</span></section>`;
}

function renderBold(text: string, theme: ThemeConfig): string {
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
  const rendered = items.map((content, i) => {
    const num = String(i + 1);
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
  const bg = isChunmu ? "#F5F0E6" : theme.codeBg;
  const border = isChunmu ? "1px solid #EBE3D5" : "none";
  const escaped = esc(code).replace(/\n/g, "<br>");

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
  if (isBauhaus) {
    return `<section style="margin: 40px 0;"><section style="border-top: 4px solid #1A1A1A;"></section></section>`;
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
  if (alt) {
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
}

export function buildConvertOptions(s: { fontSize: string; fontFamily: string; accentColor: string; sideMargin: number }, fontFamilyMap: Record<string, { label: string; value: string }>, resolveImage?: (src: string) => string): ConvertOptions {
  return {
    resolveImage,
    fontSize: s.fontSize,
    fontFamily: fontFamilyMap[s.fontFamily]?.value,
    accentColor: s.accentColor || undefined,
    sideMargin: s.sideMargin,
  };
}

export function markdownToWechatHTML(
  markdown: string,
  theme: ThemeConfig,
  options?: ConvertOptions
): string {
  // 应用覆盖设置
  const t = { ...theme };
  if (options?.fontSize) t.baseFontSize = options.fontSize;
  if (options?.fontFamily) t.fontFamily = options.fontFamily;
  if (options?.accentColor) {
    t.accent = options.accentColor;
    t.accentLight = options.accentColor + "15";
    t.numText = options.accentColor;
    t.numBg = options.accentColor + "15";
    t.quoteBorder = options.accentColor;
    t.highlightText = options.accentColor;
    t.bulletColor = options.accentColor;
    t.codeText = options.accentColor;
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
          const bqText = (token.tokens || [])
            .map((bt: any) => renderInlineTokens(bt.tokens, t, ri))
            .join("<br>");
          parts.push(renderBlockquote([bqText], t));
        }
        break;
      }
      case "code":
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

  // 外层包裹
  const isBauhaus = t.name === "包豪斯";
  const isClassical = t.name === "古典科技";
  if (isBauhaus) {
    html = `<section style="background-color: ${t.background}; border: 2px solid #1A1A1A; border-top: 8px solid #0055A4; box-shadow: 8px 8px 0px #1A1A1A; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: 1px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
  } else if (isClassical) {
    html = `<section style="background-color: ${t.background}; border: 1px solid #E0DCD1; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: 1px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
  } else {
    html = `<section style="background-color: ${t.background}; padding: 0;"><section style="font-family: ${t.fontFamily}; font-size: ${t.baseFontSize}; line-height: ${t.lineHeight}; color: ${t.text};"><section style="padding: 1px ${sideMargin}px 0 ${sideMargin}px;">${html}</section></section></section>`;
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
    const caption = alt
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
