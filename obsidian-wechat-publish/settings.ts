import { App, PluginSettingTab, Setting } from "obsidian";
import type WeChatPublishPlugin from "./main";

export interface WeChatSettings {
  theme: string;
  author: string;
  apiUrl: string;
  fontFamily: string;
  fontSize: string;
  accentColor: string;
  usePhoneFrame: boolean;
  macCodeBlock: boolean;
  sideMargin: number;
  centerHeading: boolean;
  imageCaption: boolean;
  // Dia 系列一级标题装饰：bar 渐变竖条 / triangle 播放三角 / arrow 右向箭头
  diaH1Style: string;
  // Dia 系列引用样式：card 渐变卡片 / quote 大引号极简 / bar 极简左粗边
  diaQuoteStyle: string;
  // Dia 系列分割线：capsule 渐变短条 / dots 三点渐变 / fade 全宽渐隐线
  diaHrStyle: string;
  // AI 排版：OpenAI 兼容 /chat/completions 端点；为空时点 AI 排版按钮会提示先配置
  aiApiUrl: string;
  aiApiKey: string;
  aiModel: string;
}

export const DEFAULT_SETTINGS: WeChatSettings = {
  theme: "dia",
  author: "游白",
  // 自部署推送服务的地址（见 README 服务端部署说明）；为空时推送会提示先配置
  apiUrl: "",
  fontFamily: "sans",
  fontSize: "17px",
  accentColor: "",
  usePhoneFrame: true,
  macCodeBlock: false,
  sideMargin: 10,
  centerHeading: false,
  imageCaption: false,
  diaH1Style: "bar",
  diaQuoteStyle: "card",
  diaHrStyle: "capsule",
  aiApiUrl: "",
  aiApiKey: "",
  aiModel: "glm-4.6",
};

export class WeChatSettingTab extends PluginSettingTab {
  plugin: WeChatPublishPlugin;

  constructor(app: App, plugin: WeChatPublishPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "公众号发布设置" });

    containerEl.createEl("p", {
      text: "排版设置（主题/字体/字号等）在公众号预览面板的浮动设置里实时调整；这里放需要填一次的配置。",
      cls: "setting-item-description",
    });

    new Setting(containerEl)
      .setName("AI 排版 · API 地址")
      .setDesc("GLM Coding Plan 订阅 Key 填 https://open.bigmodel.cn/api/anthropic/v1/messages（走订阅额度）；按量付费 Key 填 https://open.bigmodel.cn/api/paas/v4/chat/completions")
      .addText((text) =>
        text
          .setPlaceholder("https://…/v1/messages 或 …/chat/completions")
          .setValue(this.plugin.settings.aiApiUrl)
          .onChange(async (v) => {
            this.plugin.settings.aiApiUrl = v.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("AI 排版 · API Key")
      .addText((text) => {
        text.inputEl.type = "password";
        return text
          .setPlaceholder("sk-…")
          .setValue(this.plugin.settings.aiApiKey)
          .onChange(async (v) => {
            this.plugin.settings.aiApiKey = v.trim();
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("AI 排版 · 模型")
      .setDesc("该端点支持的模型名，默认 glm-4.6")
      .addText((text) =>
        text
          .setPlaceholder("glm-4.6")
          .setValue(this.plugin.settings.aiModel)
          .onChange(async (v) => {
            this.plugin.settings.aiModel = v.trim();
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("推送服务地址")
      .setDesc("自部署推送服务（见 README 服务端部署说明）；推送弹窗里也可以临时修改")
      .addText((text) =>
        text
          .setPlaceholder("http://host:3000/api/wechat/draft")
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (v) => {
            this.plugin.settings.apiUrl = v.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
