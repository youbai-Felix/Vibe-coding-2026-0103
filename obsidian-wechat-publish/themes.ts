// 主题配置

export interface ThemeConfig {
  name: string;
  background: string;
  text: string;
  textLight: string;
  accent: string;
  accentLight: string;
  numText: string;
  numBg: string;
  border: string;
  listBorder: string;
  codeBg: string;
  codeText: string;
  codeBlockText: string;
  quoteBorder: string;
  headingColor: string;
  headingBorder: string;
  headingBorderWidth: string;
  boldColor: string;
  highlightText: string;
  bulletChar: string;
  bulletColor: string;
  fontFamily: string;
  baseFontSize: string;
  lineHeight: string;
  paragraphMargin: string;
  cardRadius: string;
  codeBlockRadius: string;
  // Mac 风格代码块
  macCodeBlock: boolean;
  // 标题装饰风格
  headingStyle: "underline" | "left-bar" | "plain" | "classic" | "bauhaus";
  // 正文字间距（可选，未设则不添加）
  letterSpacing?: string;
  // 标题字重（可选，默认 600）
  headingWeight?: string;
  // Dia 系列配色：品牌渐变三停（标题竖条/圆点/序号/分隔线）与引用块浅底渐变三停
  diaGradient?: [string, string, string];
  diaQuoteTints?: [string, string, string];
}

export const chunmu: ThemeConfig = {
  name: "春木培土",
  background: "#FDFBF7",
  text: "#3A332F",
  textLight: "#4A3B32",
  accent: "#1F6E43",
  accentLight: "#F0F7F2",
  numText: "#1F6E43",
  numBg: "#F0F7F2",
  border: "#D6D0C4",
  listBorder: "#EBE6DE",
  codeBg: "#EAE7E1",
  codeText: "#1F6E43",
  codeBlockText: "#3A332F",
  quoteBorder: "#1F6E43",
  headingColor: "#4A3B32",
  headingBorder: "#4A3B32",
  headingBorderWidth: "2px",
  boldColor: "#2D1F1A",
  highlightText: "#1F6E43",
  bulletChar: "■",
  bulletColor: "#1F6E43",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  baseFontSize: "15px",
  lineHeight: "1.7",
  paragraphMargin: "15px",
  cardRadius: "6px",
  codeBlockRadius: "6px",
  macCodeBlock: false,
  headingStyle: "underline",
};

export const dacongming: ThemeConfig = {
  name: "大聪明",
  background: "#F9F9F9",
  text: "#4B5563",
  textLight: "#555555",
  accent: "#C94F4F",
  accentLight: "#FFF4F4",
  numText: "#C94F4F",
  numBg: "#FEF2F2",
  border: "#D1D5DB",
  listBorder: "#E5E7EB",
  codeBg: "#FBF8F1",
  codeText: "#C94F4F",
  codeBlockText: "#374151",
  quoteBorder: "#C94F4F",
  headingColor: "#111827",
  headingBorder: "#D1D5DB",
  headingBorderWidth: "1px",
  boldColor: "#111827",
  highlightText: "#C94F4F",
  bulletChar: "•",
  bulletColor: "#C94F4F",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", Arial, sans-serif',
  baseFontSize: "15px",
  lineHeight: "1.7",
  paragraphMargin: "25px",
  cardRadius: "6px",
  codeBlockRadius: "6px",
  macCodeBlock: true,
  headingStyle: "plain",
};

export const jianyue: ThemeConfig = {
  name: "简约",
  background: "#FFFFFF",
  text: "#333333",
  textLight: "#666666",
  accent: "#0071E3",
  accentLight: "#F0F7FF",
  numText: "#0071E3",
  numBg: "#F0F7FF",
  border: "#E8E8ED",
  listBorder: "#F0F0F0",
  codeBg: "#F5F5F7",
  codeText: "#C7254E",
  codeBlockText: "#333333",
  quoteBorder: "#0071E3",
  headingColor: "#1D1D1F",
  headingBorder: "#E8E8ED",
  headingBorderWidth: "1px",
  boldColor: "#1D1D1F",
  highlightText: "#0071E3",
  bulletChar: "●",
  bulletColor: "#0071E3",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", Arial, sans-serif',
  baseFontSize: "15px",
  lineHeight: "1.75",
  paragraphMargin: "20px",
  cardRadius: "8px",
  codeBlockRadius: "8px",
  macCodeBlock: true,
  headingStyle: "classic",
};

export const youya: ThemeConfig = {
  name: "优雅",
  background: "#FBF9F6",
  text: "#2C2C2C",
  textLight: "#5A5A5A",
  accent: "#8B5E3C",
  accentLight: "#F5EDE6",
  numText: "#8B5E3C",
  numBg: "#F5EDE6",
  border: "#E5DDD5",
  listBorder: "#EDE7E0",
  codeBg: "#F0EBE4",
  codeText: "#8B5E3C",
  codeBlockText: "#2C2C2C",
  quoteBorder: "#8B5E3C",
  headingColor: "#2C2C2C",
  headingBorder: "#C4A882",
  headingBorderWidth: "2px",
  boldColor: "#1A1A1A",
  highlightText: "#8B5E3C",
  bulletChar: "◆",
  bulletColor: "#8B5E3C",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", -apple-system, serif',
  baseFontSize: "16px",
  lineHeight: "1.8",
  paragraphMargin: "20px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "left-bar",
};

export const pingguo: ThemeConfig = {
  name: "苹果",
  background: "#FFFFFF",
  text: "#424245",
  textLight: "#86868B",
  accent: "#1D1D1F",
  accentLight: "#F5F5F7",
  numText: "#1D1D1F",
  numBg: "#F5F5F7",
  border: "#D2D2D7",
  listBorder: "#E5E5E5",
  codeBg: "#F5F5F7",
  codeText: "#1D1D1F",
  codeBlockText: "#F5F5F7",
  quoteBorder: "#D2D2D7",
  headingColor: "#1D1D1F",
  headingBorder: "#1D1D1F",
  headingBorderWidth: "3px",
  boldColor: "#1D1D1F",
  highlightText: "#1D1D1F",
  bulletChar: "●",
  bulletColor: "#86868B",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", "PingFang SC", Arial, sans-serif',
  baseFontSize: "15px",
  lineHeight: "1.75",
  paragraphMargin: "24px",
  cardRadius: "16px",
  codeBlockRadius: "16px",
  macCodeBlock: true,
  headingStyle: "left-bar",
};

export const baohausi: ThemeConfig = {
  name: "包豪斯",
  background: "#F4F4F0",
  text: "#333333",
  textLight: "#555555",
  accent: "#0055A4",
  accentLight: "#FFFFFF",
  numText: "#FFFFFF",
  numBg: "#1A1A1A",
  border: "#1A1A1A",
  listBorder: "#1A1A1A",
  codeBg: "#FFFFFF",
  codeText: "#1A1A1A",
  codeBlockText: "#F4F4F0",
  quoteBorder: "#0055A4",
  headingColor: "#1A1A1A",
  headingBorder: "#1A1A1A",
  headingBorderWidth: "4px",
  boldColor: "#1A1A1A",
  highlightText: "#1A1A1A",
  bulletChar: "■",
  bulletColor: "#1A1A1A",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", Arial, sans-serif',
  baseFontSize: "15px",
  lineHeight: "1.75",
  paragraphMargin: "24px",
  cardRadius: "0px",
  codeBlockRadius: "0px",
  macCodeBlock: true,
  headingStyle: "bauhaus",
};

export const gudiankeji: ThemeConfig = {
  name: "古典科技",
  background: "#F2EFE9",
  text: "#262624",
  textLight: "#666663",
  accent: "#262624",
  accentLight: "#EBE7DF",
  numText: "#262624",
  numBg: "#EBE7DF",
  border: "#262624",
  listBorder: "#D5D1C6",
  codeBg: "#262624",
  codeText: "#F2EFE9",
  codeBlockText: "#262624",
  quoteBorder: "#262624",
  headingColor: "#262624",
  headingBorder: "#666663",
  headingBorderWidth: "0.5px",
  boldColor: "#262624",
  highlightText: "#262624",
  bulletChar: "·",
  bulletColor: "#666663",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", -apple-system, serif',
  baseFontSize: "15px",
  lineHeight: "1.85",
  paragraphMargin: "24px",
  cardRadius: "0px",
  codeBlockRadius: "0px",
  macCodeBlock: false,
  headingStyle: "plain",
};

export const kazike: ThemeConfig = {
  name: "卡兹克",
  background: "#FFFFFF",
  text: "rgba(0, 0, 0, 0.9)",
  textLight: "rgba(0, 0, 0, 0.55)",
  accent: "#000000",
  accentLight: "#F5F5F5",
  numText: "#000000",
  numBg: "#F5F5F5",
  border: "#E5E5E5",
  listBorder: "#EEEEEE",
  codeBg: "#F5F5F5",
  codeText: "#000000",
  codeBlockText: "rgba(0, 0, 0, 0.9)",
  quoteBorder: "#000000",
  headingColor: "rgba(0, 0, 0, 0.9)",
  headingBorder: "#E5E5E5",
  headingBorderWidth: "1px",
  boldColor: "rgba(0, 0, 0, 0.9)",
  highlightText: "#000000",
  bulletChar: "•",
  bulletColor: "rgba(0, 0, 0, 0.9)",
  fontFamily:
    '"PingFang SC NEW", "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "17px",
  lineHeight: "1.6",
  paragraphMargin: "24px",
  cardRadius: "8px",
  codeBlockRadius: "8px",
  macCodeBlock: false,
  headingStyle: "left-bar",
  letterSpacing: "0.544px",
  headingWeight: "500",
};

// ====== 书单系列（段间距/呼吸感参考卡兹克，着重打磨标题/加粗/引用）======

// 素墨书摘：白底墨黑，卡兹克式克制现代，标题衬线点缀书卷感
export const sumo: ThemeConfig = {
  name: "素墨书摘",
  background: "#FFFFFF",
  text: "rgba(0, 0, 0, 0.9)",
  textLight: "rgba(0, 0, 0, 0.55)",
  accent: "#000000",
  accentLight: "#F5F5F5",
  numText: "#000000",
  numBg: "#F5F5F5",
  border: "#E5E5E5",
  listBorder: "#EEEEEE",
  codeBg: "#F5F5F5",
  codeText: "#000000",
  codeBlockText: "rgba(0, 0, 0, 0.9)",
  quoteBorder: "#000000",
  headingColor: "rgba(0, 0, 0, 0.9)",
  headingBorder: "#E5E5E5",
  headingBorderWidth: "1px",
  boldColor: "rgba(0, 0, 0, 0.9)",
  highlightText: "#000000",
  bulletChar: "•",
  bulletColor: "rgba(0, 0, 0, 0.9)",
  fontFamily:
    '"PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "17px",
  lineHeight: "1.7",
  paragraphMargin: "24px",
  cardRadius: "8px",
  codeBlockRadius: "8px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.544px",
  headingWeight: "600",
};

// 暖纸书房：米黄纸感 + 茶褐，全衬线，复古温暖像翻一本旧书
export const nuanZhi: ThemeConfig = {
  name: "暖纸书房",
  background: "#FBF8F2",
  text: "#3B3530",
  textLight: "#6B5F54",
  accent: "#9C6B3F",
  accentLight: "#F2E9DC",
  numText: "#9C6B3F",
  numBg: "#F2E9DC",
  border: "#E5DBC9",
  listBorder: "#EDE4D2",
  codeBg: "#F2E9DC",
  codeText: "#9C6B3F",
  codeBlockText: "#3B3530",
  quoteBorder: "#9C6B3F",
  headingColor: "#3B3530",
  headingBorder: "#C9A87C",
  headingBorderWidth: "1px",
  boldColor: "#9C6B3F",
  highlightText: "#9C6B3F",
  bulletChar: "◆",
  bulletColor: "#9C6B3F",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", serif',
  baseFontSize: "16px",
  lineHeight: "1.8",
  paragraphMargin: "24px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.5px",
  headingWeight: "600",
};

// 青简藏书：淡青米底 + 墨绿，全衬线，文人气雅致不张扬
export const qingJian: ThemeConfig = {
  name: "青简藏书",
  background: "#F7F8F4",
  text: "#2F3330",
  textLight: "#5C6360",
  accent: "#2E5C4E",
  accentLight: "#E8EFE7",
  numText: "#2E5C4E",
  numBg: "#E8EFE7",
  border: "#D8DED2",
  listBorder: "#E2E8DC",
  codeBg: "#E8EFE7",
  codeText: "#2E5C4E",
  codeBlockText: "#2F3330",
  quoteBorder: "#2E5C4E",
  headingColor: "#2E5C4E",
  headingBorder: "#9CB5A0",
  headingBorderWidth: "1px",
  boldColor: "#2E5C4E",
  highlightText: "#2E5C4E",
  bulletChar: "❖",
  bulletColor: "#2E5C4E",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", serif',
  baseFontSize: "16px",
  lineHeight: "1.8",
  paragraphMargin: "24px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.5px",
  headingWeight: "600",
};

// ====== 全文主题系列（基于卡片风格适配成整篇排版）======

// 极简留白：白底墨黑，克制现代，标题细线点缀
export const minimal: ThemeConfig = {
  name: "极简留白",
  background: "#FFFFFF",
  text: "rgba(0, 0, 0, 0.9)",
  textLight: "rgba(0, 0, 0, 0.55)",
  accent: "#1F2937",
  accentLight: "#F3F4F6",
  numText: "#1F2937",
  numBg: "#F3F4F6",
  border: "#E5E5E5",
  listBorder: "#EEEEEE",
  codeBg: "#F5F5F5",
  codeText: "#1F2937",
  codeBlockText: "rgba(0, 0, 0, 0.9)",
  quoteBorder: "#1F2937",
  headingColor: "rgba(0, 0, 0, 0.9)",
  headingBorder: "#E5E5E5",
  headingBorderWidth: "1px",
  boldColor: "rgba(0, 0, 0, 0.9)",
  highlightText: "#1F2937",
  bulletChar: "•",
  bulletColor: "rgba(0, 0, 0, 0.9)",
  fontFamily:
    '"PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "17px",
  lineHeight: "1.7",
  paragraphMargin: "24px",
  cardRadius: "8px",
  codeBlockRadius: "8px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.544px",
  headingWeight: "600",
};

// 古典水墨：米色纸感 + 朱砂红，全衬线，中式书卷
export const ink: ThemeConfig = {
  name: "古典水墨",
  background: "#f9f6f0",
  text: "#444444",
  textLight: "#8a7f72",
  accent: "#8b2626",
  accentLight: "#f3ece0",
  numText: "#8b2626",
  numBg: "#f3ece0",
  border: "#e2d5c3",
  listBorder: "#ece0cc",
  codeBg: "#f3ece0",
  codeText: "#8b2626",
  codeBlockText: "#444444",
  quoteBorder: "#8b2626",
  headingColor: "#8b2626",
  headingBorder: "#8b2626",
  headingBorderWidth: "2px",
  boldColor: "#8b2626",
  highlightText: "#8b2626",
  bulletChar: "·",
  bulletColor: "#8b2626",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", serif',
  baseFontSize: "16px",
  lineHeight: "1.9",
  paragraphMargin: "22px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.5px",
  headingWeight: "600",
};

// 圆润治愈：浅橙暖底，大圆角，柔和
export const healing: ThemeConfig = {
  name: "圆润治愈",
  background: "#fff7ed",
  text: "#7c2d12",
  textLight: "#9a3412",
  accent: "#ea580c",
  accentLight: "#ffedd5",
  numText: "#ea580c",
  numBg: "#ffedd5",
  border: "#fed7aa",
  listBorder: "#ffe4c4",
  codeBg: "#ffedd5",
  codeText: "#c2410c",
  codeBlockText: "#7c2d12",
  quoteBorder: "#ea580c",
  headingColor: "#7c2d12",
  headingBorder: "#fdba74",
  headingBorderWidth: "2px",
  boldColor: "#ea580c",
  highlightText: "#ea580c",
  bulletChar: "●",
  bulletColor: "#ea580c",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "16px",
  lineHeight: "1.8",
  paragraphMargin: "22px",
  cardRadius: "16px",
  codeBlockRadius: "12px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.3px",
  headingWeight: "600",
};

// 装饰艺术（Art Deco 浅色版）：米白底 + 金棕，全衬线，几何直角
export const deco: ThemeConfig = {
  name: "装饰艺术",
  background: "#faf8f3",
  text: "#2a2a2a",
  textLight: "#6b6b6b",
  accent: "#b8941f",
  accentLight: "#f5efe0",
  numText: "#b8941f",
  numBg: "#f5efe0",
  border: "#e0d6b8",
  listBorder: "#ece4cc",
  codeBg: "#f5efe0",
  codeText: "#b8941f",
  codeBlockText: "#2a2a2a",
  quoteBorder: "#b8941f",
  headingColor: "#b8941f",
  headingBorder: "#b8941f",
  headingBorderWidth: "2px",
  boldColor: "#b8941f",
  highlightText: "#b8941f",
  bulletChar: "■",
  bulletColor: "#b8941f",
  fontFamily:
    'Georgia, "Songti SC", "STSong", "SimSun", serif',
  baseFontSize: "16px",
  lineHeight: "1.85",
  paragraphMargin: "22px",
  cardRadius: "0px",
  codeBlockRadius: "0px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.5px",
  headingWeight: "600",
};

// 杂志风：白底，超大衬线标题 + 顶部黑粗线，正文无衬线，利落
export const magazine: ThemeConfig = {
  name: "杂志风",
  background: "#FFFFFF",
  text: "#4b5563",
  textLight: "#9ca3af",
  accent: "#111827",
  accentLight: "#F3F4F6",
  numText: "#111827",
  numBg: "#F3F4F6",
  border: "#E5E7EB",
  listBorder: "#F3F4F6",
  codeBg: "#F3F4F6",
  codeText: "#111827",
  codeBlockText: "#4b5563",
  quoteBorder: "#111827",
  headingColor: "#111827",
  headingBorder: "#111827",
  headingBorderWidth: "4px",
  boldColor: "#111827",
  highlightText: "#111827",
  bulletChar: "■",
  bulletColor: "#111827",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
  baseFontSize: "17px",
  lineHeight: "1.8",
  paragraphMargin: "22px",
  cardRadius: "0px",
  codeBlockRadius: "0px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0px",
  headingWeight: "700",
};

// 百年孤独：拆解自一篇公众号读书文，单一暖橙 #F89A3A 撑全局，标题居中粗体
export const lonely: ThemeConfig = {
  name: "百年孤独",
  background: "#FFFFFF",
  text: "#2c2c2c",
  textLight: "rgba(49, 48, 46, 0.72)",
  accent: "#F89A3A",
  accentLight: "#FBEFD9",
  numText: "#F89A3A",
  numBg: "#FBEFD9",
  border: "#EAEAEA",
  listBorder: "#F0F0F0",
  codeBg: "#F7F7F7",
  codeText: "#F89A3A",
  codeBlockText: "#2c2c2c",
  quoteBorder: "#F89A3A",
  headingColor: "#F89A3A",
  headingBorder: "#F89A3A",
  headingBorderWidth: "0px",
  boldColor: "#F89A3A",
  highlightText: "#F89A3A",
  bulletChar: "·",
  bulletColor: "#F89A3A",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "16px",
  lineHeight: "1.75",
  paragraphMargin: "20px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "plain",
  headingWeight: "800",
};

// 飘：拆解自《飘》读书文，橙红 #E2561B + 墨绿 #075146 双色，标题左竖线，序号墨绿底白字
export const piao: ThemeConfig = {
  name: "飘",
  background: "#FFFFFF",
  text: "#3e3e3e",
  textLight: "#7a7a7a",
  accent: "#E2561B",
  accentLight: "#FCE9E2",
  numText: "#ffffff",
  numBg: "#075146",
  border: "#405746",
  listBorder: "#ececec",
  codeBg: "#FCE9E2",
  codeText: "#E2561B",
  codeBlockText: "#3e3e3e",
  quoteBorder: "#075146",
  headingColor: "#E2561B",
  headingBorder: "#E2561B",
  headingBorderWidth: "5px",
  boldColor: "#E2561B",
  highlightText: "#E2561B",
  bulletChar: "•",
  bulletColor: "#E2561B",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "17px",
  lineHeight: "1.75",
  paragraphMargin: "18px",
  cardRadius: "2px",
  codeBlockRadius: "2px",
  macCodeBlock: false,
  headingStyle: "plain",
  letterSpacing: "0.5px",
  headingWeight: "700",
};

// 朱砂笺：拆解自《公众号排版样式规范》PDF——米白纸感 + 朱红 #B8452F 点缀 + 宋体衬线标题
export const zhusha: ThemeConfig = {
  name: "朱砂笺",
  background: "#FDFBF3",
  text: "#3D3A35",
  textLight: "#57534D",
  accent: "#B8452F",
  accentLight: "#F7E9E3",
  numText: "#FFFFFF",
  numBg: "#B8452F",
  border: "#E7DDCD",
  listBorder: "#EFE7D8",
  codeBg: "#F0EADD",
  codeText: "#2C2A27",
  codeBlockText: "#E9E2D4",
  quoteBorder: "#B8452F",
  headingColor: "#2B2926",
  headingBorder: "#B8452F",
  headingBorderWidth: "5px",
  boldColor: "#963521",
  highlightText: "#B8452F",
  bulletChar: "◆",
  bulletColor: "#B8452F",
  fontFamily:
    '"PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "16px",
  lineHeight: "1.8",
  paragraphMargin: "20px",
  cardRadius: "4px",
  codeBlockRadius: "12px",
  macCodeBlock: false,
  headingStyle: "left-bar",
  letterSpacing: "0.4px",
  headingWeight: "700",
};

// Dia：拆解自《公众号排版样式 · Dia 风格》PDF——干净白底 + 三段品牌渐变，全篇无衬线大圆角。
// 六套可切换配色：品牌渐变驱动标题竖条/圆点/序号/分隔线，加粗与 H2 字色同套系，
// 引用块为整块浅底渐变（品牌渐变各停 ~8% 淡色）。
type DiaGrad = [string, string, string];

const diaBase = {
  background: "#FFFFFF",
  text: "#33333A",
  textLight: "#55505A",
  numText: "#FFFFFF",
  border: "#EBEBE5",
  listBorder: "#F2F2EF",
  codeBg: "#F2F2EF",
  codeText: "#3A3A40",
  codeBlockText: "#3A3A40",
  headingColor: "#1D1D1F",
  headingBorderWidth: "6px",
  bulletChar: "•",
  fontFamily:
    '"PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Microsoft YaHei", sans-serif',
  baseFontSize: "16px",
  lineHeight: "1.85",
  paragraphMargin: "20px",
  cardRadius: "12px",
  codeBlockRadius: "16px",
  macCodeBlock: false,
  headingStyle: "left-bar" as const,
  letterSpacing: "0.2px",
  headingWeight: "700",
};

function makeDia(name: string, grad: DiaGrad, bold: string, tints: DiaGrad): ThemeConfig {
  return {
    ...diaBase,
    name,
    accent: grad[0],
    accentLight: tints[0],
    numBg: grad[0],
    quoteBorder: grad[0],
    headingBorder: grad[0],
    boldColor: bold,
    highlightText: bold,
    bulletColor: grad[0],
    diaGradient: grad,
    diaQuoteTints: tints,
  };
}

export const dia: ThemeConfig = makeDia(
  "Dia 珊瑚粉",
  ["#F8567F", "#FF8A5B", "#FFC46B"],
  "#D63D63",
  ["#FFF0F3", "#FFF3EC", "#FFF8EC"]
);
export const diaAurora: ThemeConfig = makeDia(
  "Dia 极光蓝紫",
  ["#6A8BFF", "#8A6CFF", "#B06CFF"],
  "#5B5BD6",
  ["#F3F6FF", "#F6F3FF", "#F9F3FF"]
);
export const diaJade: ThemeConfig = makeDia(
  "Dia 青碧",
  ["#12B3A5", "#33C98C", "#86D96B"],
  "#0E9A86",
  ["#ECF9F8", "#EFFAF6", "#F5FCF3"]
);
export const diaSunset: ThemeConfig = makeDia(
  "Dia 落日橙",
  ["#FF9A3D", "#FF6B5C", "#FF4F81"],
  "#E0552E",
  ["#FFF7EF", "#FFF3F2", "#FFF1F5"]
);
export const diaOcean: ThemeConfig = makeDia(
  "Dia 海青",
  ["#2E9DF7", "#22C1C3", "#4FD1A5"],
  "#1F7FD6",
  ["#EEF7FE", "#EDFAFA", "#F1FBF8"]
);
export const diaGrape: ThemeConfig = makeDia(
  "Dia 葡萄紫",
  ["#A05EFF", "#D65CE0", "#FF6BA8"],
  "#9A3FD6",
  ["#F7F2FF", "#FCF2FC", "#FFF3F8"]
);

export const themes: Record<string, ThemeConfig> = {
  chunmu,
  dacongming,
  jianyue,
  youya,
  pingguo,
  baohausi,
  gudiankeji,
  kazike,
  sumo,
  nuanZhi,
  qingJian,
  minimal,
  ink,
  healing,
  deco,
  magazine,
  lonely,
  piao,
  zhusha,
  dia,
  diaAurora,
  diaJade,
  diaSunset,
  diaOcean,
  diaGrape,
};

// 字体族选项
export const fontFamilyOptions: Record<string, { label: string; value: string }> = {
  sans: {
    label: "无衬线",
    value:
      '-apple-system, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
  serif: {
    label: "衬线体",
    value: 'Georgia, "Songti SC", "STSong", "SimSun", serif',
  },
  mono: {
    label: "等宽体",
    value: '"SF Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
  },
};

// 字号选项
export const fontSizeOptions = [
  { label: "15px", value: "15px" },
  { label: "16px", value: "16px" },
  { label: "17px", value: "17px" },
];

// 主题色选项
export const accentColorOptions = [
  { label: "青绿", color: "#56AB87" },
  { label: "蓝", color: "#536DEC" },
  { label: "暖橙", color: "#EA9F4F" },
  { label: "砖红", color: "#E0655B" },
  { label: "墨蓝", color: "#2C4E85" },
  { label: "驼金", color: "#C1A16B" },
  { label: "灰蓝", color: "#505968" },
  { label: "亮蓝", color: "#4C7ECF" },
];
