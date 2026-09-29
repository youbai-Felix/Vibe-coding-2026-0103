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
  headingStyle: "underline" | "left-bar" | "plain" | "classic" | "bauhaus" | "top-bar";
  // 正文字间距（可选，未设则不添加）
  letterSpacing?: string;
  // 标题字重（可选，默认 600）
  headingWeight?: string;
  // Dia 系列配色：品牌渐变三停（标题竖条/圆点/序号/分隔线）与引用块浅底渐变三停
  diaGradient?: [string, string, string];
  diaQuoteTints?: [string, string, string];
}

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
    "'PingFang SC NEW', 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Microsoft YaHei', sans-serif",
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
    "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei', sans-serif",
  baseFontSize: "16px",
  lineHeight: "1.75",
  paragraphMargin: "20px",
  cardRadius: "4px",
  codeBlockRadius: "4px",
  macCodeBlock: false,
  headingStyle: "plain",
  headingWeight: "800",
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
    "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Microsoft YaHei', sans-serif",
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

// 陶笺：拆解自用户提供的样式稿——暖象牙白纸面 + 陶土 #BD5D3A 克重点缀，
// 正文无衬线、标题/引用/序号衬线；引用 = 2px 陶土竖线 + 18px 缩进 + 15px 宋体柔灰，
// 末行 —— 开头自动转出处小字（cite）。
// H1 自动眉题：首个 = PART ONE · 开篇，末个 = PART END · 终章，中间按顺序轮换
// PART TWO · 拂晓 / PART THREE · 日升 / PART FOUR · 亭午 / PART FIVE · 斜阳 /
// PART SIX · 灯下（中间词组用尽只留 PART N）；
// 手写 <span class="kicker">文字</span> 覆盖该节，空 span 抑制。
// 细节渲染在 converter.ts 的「陶笺」分支。
export const taojian: ThemeConfig = {
  name: "陶笺",
  background: "#FAF9F5",
  text: "#33312D",
  textLight: "#6B6862",
  accent: "#BD5D3A",
  accentLight: "#F7E9E1",
  numText: "#BD5D3A",
  numBg: "#F3F1EA",
  border: "#E7E4DB",
  listBorder: "#E7E4DB",
  codeBg: "#F3F1EA",
  codeText: "#BD5D3A",
  codeBlockText: "#44413B",
  quoteBorder: "#BD5D3A",
  headingColor: "#1F1E1C",
  headingBorder: "#BD5D3A",
  headingBorderWidth: "2px",
  boldColor: "#1F1E1C",
  highlightText: "#BD5D3A",
  bulletChar: "●",
  bulletColor: "#BD5D3A",
  fontFamily:
    "'PingFang SC', 'Hiragino Sans GB', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Microsoft YaHei', sans-serif",
  baseFontSize: "16px",
  lineHeight: "1.9",
  paragraphMargin: "22px",
  cardRadius: "8px",
  codeBlockRadius: "8px",
  macCodeBlock: false,
  headingStyle: "top-bar",
  letterSpacing: "0.1px",
  // 700 而非 600：安卓衬线/无衬线常缺 600 档导致标题回退变细，700 跨端稳定
  // （iOS Songti 700=Bold，安卓 Noto Serif 700=Bold，观感统一）
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
    "'PingFang SC', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Microsoft YaHei', sans-serif",
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
// 莫兰迪族：低饱和三色标（引用卡浅底取各停点 ~16% 淡色，底色本身淡需加浓才可感知）
export const diaMorandiRose: ThemeConfig = makeDia(
  "Dia 莫兰迪玫瑰",
  ["#C99AA0", "#CBB1A6", "#D0C2AD"],
  "#9C6A70",
  ["#F6EFF0", "#F7F3F1", "#F7F5F2"]
);
export const diaMorandiBlue: ThemeConfig = makeDia(
  "Dia 莫兰迪雾蓝",
  ["#94A7B3", "#A6B4B8", "#B8C2BB"],
  "#5C7885",
  ["#EEF1F3", "#F1F3F4", "#F4F5F4"]
);
export const diaMorandiSage: ThemeConfig = makeDia(
  "Dia 莫兰迪鼠尾草",
  ["#A6B598", "#B4BFA6", "#C3CAB2"],
  "#6D8459",
  ["#F1F3EF", "#F3F5F1", "#F5F7F3"]
);
// 单色族：同色系由浅到深渐变
export const diaMonoIndigo: ThemeConfig = makeDia(
  "Dia 单色靛蓝",
  ["#7FB0FF", "#4A86EF", "#2C62CF"],
  "#2C62CF",
  ["#F2F7FF", "#EDF3FD", "#EAEFFA"]
);
export const diaMonoRose: ThemeConfig = makeDia(
  "Dia 单色玫紫",
  ["#D79BD6", "#B96FC0", "#944BA0"],
  "#944BA0",
  ["#FBF5FB", "#F8F1F9", "#F4EDF6"]
);
export const diaMonoInk: ThemeConfig = makeDia(
  "Dia 单色墨黑",
  ["#9AA0A8", "#6B7079", "#40454E"],
  "#40454E",
  ["#F5F6F6", "#F0F1F2", "#ECECED"]
);

export const themes: Record<string, ThemeConfig> = {
  kazike,
  lonely,
  zhusha,
  taojian,
  dia,
  diaAurora,
  diaJade,
  diaSunset,
  diaOcean,
  diaGrape,
  diaMorandiRose,
  diaMorandiBlue,
  diaMorandiSage,
  diaMonoIndigo,
  diaMonoRose,
  diaMonoInk,
};

// 字体族选项
export const fontFamilyOptions: Record<string, { label: string; value: string }> = {
  sans: {
    label: "无衬线",
    value:
      "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', sans-serif",
  },
  serif: {
    label: "衬线体",
    value: "Georgia, 'Songti SC', 'STSong', 'SimSun', serif",
  },
  mono: {
    label: "等宽体",
    value: "'SF Mono', Menlo, Monaco, Consolas, 'Courier New', monospace",
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
