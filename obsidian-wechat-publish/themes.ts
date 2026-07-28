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

export const themes: Record<string, ThemeConfig> = {
  chunmu,
  dacongming,
  jianyue,
  youya,
  pingguo,
  baohausi,
  gudiankeji,
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
  { label: "小", value: "13px" },
  { label: "较小", value: "14px" },
  { label: "推荐", value: "15px" },
  { label: "较大", value: "16px" },
  { label: "大", value: "17px" },
];

// 主题色选项
export const accentColorOptions = [
  { label: "绿", color: "#1F6E43" },
  { label: "红", color: "#C94F4F" },
  { label: "蓝", color: "#0071E3" },
  { label: "棕", color: "#8B5E3C" },
  { label: "紫", color: "#7C3AED" },
  { label: "橙", color: "#EA580C" },
  { label: "青", color: "#0891B2" },
  { label: "粉", color: "#DB2777" },
];
