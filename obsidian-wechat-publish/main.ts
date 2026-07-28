import { Notice, Plugin } from "obsidian";
import { DEFAULT_SETTINGS, WeChatSettingTab, type WeChatSettings } from "./settings";
import { themes, fontFamilyOptions } from "./themes";
import { markdownToWechatHTML, buildConvertOptions } from "./converter";
import { pushToDraft } from "./push";
import { PreviewView, PREVIEW_VIEW_TYPE } from "./preview";

export default class WeChatPublishPlugin extends Plugin {
  settings: WeChatSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();

    this.registerView(PREVIEW_VIEW_TYPE, (leaf) => new PreviewView(leaf, this));

    this.addCommand({
      id: "publish-to-wechat",
      name: "发布到公众号草稿箱",
      callback: () => this.publish(),
    });

    this.addCommand({
      id: "copy-wechat-html",
      name: "复制微信排版 HTML",
      callback: () => this.copyHTML(),
    });

    this.addCommand({
      id: "open-wechat-preview",
      name: "打开公众号预览",
      callback: () => this.openPreview(),
    });

    this.addSettingTab(new WeChatSettingTab(this.app, this));
    this.addRibbonIcon("smartphone", "公众号预览", () => this.openPreview());
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(PREVIEW_VIEW_TYPE);
  }

  async openPreview() {
    const existing = this.app.workspace.getLeavesOfType(PREVIEW_VIEW_TYPE);
    if (existing.length > 0) {
      this.app.workspace.revealLeaf(existing[0]);
      return;
    }
    const rightLeaf = this.app.workspace.getRightLeaf(false);
    if (rightLeaf) {
      await rightLeaf.setViewState({ type: PREVIEW_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(rightLeaf);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async getActiveMd(): Promise<string | null> {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") {
      new Notice("请先打开一个 Markdown 文件");
      return null;
    }
    return this.app.vault.read(file);
  }

  async publish() {
    const md = await this.getActiveMd();
    if (!md) return;

    const theme = themes[this.settings.theme];
    if (!theme) {
      new Notice("未知主题，请检查设置");
      return;
    }

    new Notice("正在推送...");

    const html = markdownToWechatHTML(md, theme, buildConvertOptions(this.settings, fontFamilyOptions));

    const title = this.app.workspace.getActiveFile()?.basename || "无标题";
    const digest = extractDigest(md);

    const result = await pushToDraft({
      title,
      author: this.settings.author,
      digest,
      content: html,
      apiUrl: this.settings.apiUrl,
    });

    new Notice(result.message);
  }

  async copyHTML() {
    const md = await this.getActiveMd();
    if (!md) return;

    const theme = themes[this.settings.theme];
    if (!theme) {
      new Notice("未知主题");
      return;
    }

    const html = markdownToWechatHTML(md, theme, buildConvertOptions(this.settings, fontFamilyOptions));
    await navigator.clipboard.writeText(html);
    new Notice("微信 HTML 已复制到剪贴板");
  }
}

function extractDigest(md: string): string {
  const lines = md.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("---"));
  const first = lines[0]?.trim() || "";
  return first.length > 120 ? first.slice(0, 120) + "..." : first;
}
