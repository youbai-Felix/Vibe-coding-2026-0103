import { App, PluginSettingTab } from "obsidian";
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
}

export const DEFAULT_SETTINGS: WeChatSettings = {
  theme: "chunmu",
  author: "游白",
  apiUrl: "http://123.207.219.251:3000/api/wechat/draft",
  fontFamily: "sans",
  fontSize: "17px",
  accentColor: "",
  usePhoneFrame: true,
  macCodeBlock: false,
  sideMargin: 15,
  centerHeading: false,
  imageCaption: false,
  diaH1Style: "bar",
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
      text: "大部分排版设置可在预览面板的浮动设置中实时调整。",
      cls: "setting-item-description",
    });
  }
}
