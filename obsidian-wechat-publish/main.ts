import { Notice, Plugin, TFile } from "obsidian";
import { DEFAULT_SETTINGS, WeChatSettingTab, type WeChatSettings } from "./settings";
import { themes, fontFamilyOptions } from "./themes";
import { markdownToWechatHTML, buildConvertOptions, copyHTMLToClipboard } from "./converter";
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

  // 导出前预处理：把本地图片转 base64 data URI 内联进 markdown，
  // 这样复制到公众号编辑器时图片会自动上传显示（公众号访问不了本地路径）。
  async prepareMdForExport(md: string, file: TFile): Promise<string> {
    let out = md.replace(/!\[\[([^\[\]|]+)(?:\|[^\[\]]+)?\]\]/g, (_m, path) => {
      const p = (path as string).trim();
      const name = p.split("/").pop()?.replace(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i, "") || p;
      return `![${name}](${encodeURI(p)})`;
    });
    const resolved = new Map<string, string>();
    const pattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const tasks: Promise<void>[] = [];
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(out)) !== null) {
      const src = m[2];
      if (/^(https?:\/\/|data:|app:|capacitor:)/i.test(src) || resolved.has(src)) continue;
      resolved.set(src, src);
      tasks.push((async () => {
        try {
          const tFile = this.app.metadataCache.getFirstLinkpathDest(decodeURI(src), file.path);
          if (tFile) {
            const bytes = await this.app.vault.readBinary(tFile);
            resolved.set(src, `data:${extToMime(tFile.extension)};base64,${arrayBufferToBase64(bytes)}`);
          }
        } catch (e) {
          console.error("图片转 base64 失败:", src, e);
        }
      })());
    }
    await Promise.all(tasks);
    for (const [orig, val] of resolved) {
      if (val !== orig) out = out.split(`](${orig})`).join(`](${val})`);
    }
    return out;
  }

  async publish() {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { new Notice("请先打开一个 Markdown 文件"); return; }
    const md = await this.app.vault.read(file);

    const theme = themes[this.settings.theme];
    if (!theme) {
      new Notice("未知主题，请检查设置");
      return;
    }

    new Notice("正在推送...");

    const prepared = await this.prepareMdForExport(md, file);
    const html = markdownToWechatHTML(prepared, theme, buildConvertOptions(this.settings, fontFamilyOptions));

    const title = file.basename;
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
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") { new Notice("请先打开一个 Markdown 文件"); return; }
    const md = await this.app.vault.read(file);

    const theme = themes[this.settings.theme];
    if (!theme) {
      new Notice("未知主题");
      return;
    }

    const prepared = await this.prepareMdForExport(md, file);
    const html = markdownToWechatHTML(prepared, theme, buildConvertOptions(this.settings, fontFamilyOptions));
    await copyHTMLToClipboard(html);
    new Notice("微信 HTML 已复制到剪贴板");
  }
}

function extractDigest(md: string): string {
  const lines = md.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith(">") && !l.startsWith("---"));
  const first = lines[0]?.trim() || "";
  return first.length > 120 ? first.slice(0, 120) + "..." : first;
}

function arrayBufferToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < view.length; i += chunk) {
    const slice = Array.from(view.subarray(i, i + chunk));
    binary += String.fromCharCode.apply(null, slice);
  }
  return btoa(binary);
}

function extToMime(ext: string): string {
  switch (ext.toLowerCase()) {
    case "png": return "image/png";
    case "jpg": case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    case "bmp": return "image/bmp";
    default: return "image/png";
  }
}

