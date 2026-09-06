import { ItemView, Modal } from "obsidian";
import type WeChatPublishPlugin from "./main";
import { themes, fontFamilyOptions, fontSizeOptions, accentColorOptions, type ThemeConfig } from "./themes";
import { markdownToWechatHTML, buildConvertOptions, copyHTMLToClipboard } from "./converter";
import { pushToDraft } from "./push";

export const PREVIEW_VIEW_TYPE = "wechat-preview";

// 状态栏 SVG
const LOCATION_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="#1d1d1f"><path d="M21 3L3 10.5l7.5 3L14 21L21 3z"/></svg>`;
const SIGNAL_SVG = `<svg width="17" height="12" viewBox="0 0 17 12" fill="none"><rect x="0" y="9" width="3" height="3" rx="0.5" fill="#1d1d1f"/><rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="#1d1d1f"/><rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1d1d1f"/><rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1d1d1f"/></svg>`;
const WIFI_SVG = `<svg width="16" height="12" viewBox="0 0 16 12" fill="#1d1d1f"><path d="M8 9.6a1.6 1.6 0 100 3.2 1.6 1.6 0 000-3.2z"/><path d="M4.7 8.3a4.8 4.8 0 016.6 0" stroke="#1d1d1f" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M2.2 5.8a8 8 0 0111.6 0" stroke="#1d1d1f" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M0 3.2a11.2 11.2 0 0116 0" stroke="#1d1d1f" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>`;
const BATTERY_SVG = `<svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="2.5" stroke="#1d1d1f" stroke-opacity="0.35"/><rect x="2" y="2" width="20" height="9" rx="1.5" fill="#1d1d1f"/><path d="M25 4.5v4a2 2 0 000-4z" fill="#1d1d1f" fill-opacity="0.4"/></svg>`;

// 工具栏图标 SVG（16x16，currentColor）
const SLIDERS_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`;
const MONITOR_PHONE_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`;
const COPY_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`;
const SEND_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
const BOOK_SVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

export class PreviewView extends ItemView {
  plugin: WeChatPublishPlugin;
  previewContainer!: HTMLElement;
  settingsOverlay!: HTMLElement;
  toolbarTitle!: HTMLElement;
  private settingsBtn!: HTMLElement;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private settingsOpen = false;

  constructor(leaf: any, plugin: WeChatPublishPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() { return PREVIEW_VIEW_TYPE; }
  getDisplayText() { return "公众号预览"; }
  getIcon() { return "smartphone"; }

  async onOpen() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("wechat-preview-root");

    // 工具栏
    const toolbar = container.createEl("div", { cls: "wechat-toolbar" });
    this.createToolbar(toolbar);

    // 设置浮层（定位上下文在 wechat-preview-root）
    this.settingsOverlay = container.createEl("div", { cls: "wechat-settings-overlay" });

    // 预览外层
    const wrapper = container.createEl("div", { cls: "wechat-preview-wrapper" });
    wrapper.addClass(this.plugin.settings.usePhoneFrame ? "mode-phone" : "mode-classic");

    if (this.plugin.settings.usePhoneFrame) {
      const phoneFrame = wrapper.createEl("div", { cls: "wechat-phone-frame" });
      phoneFrame.createEl("div", { cls: "wechat-dynamic-island" });

      const header = phoneFrame.createEl("div", { cls: "wechat-phone-header" });
      header.createEl("span", { cls: "wechat-status-left", text: "9:41" });
      const statusRight = header.createEl("span", { cls: "wechat-status-right" });
      statusRight.innerHTML = LOCATION_SVG + SIGNAL_SVG + WIFI_SVG + BATTERY_SVG;

      const nav = phoneFrame.createEl("div", { cls: "wechat-phone-nav" });
      nav.createEl("span", { cls: "wechat-phone-nav-title", text: "公众号预览" });

      this.previewContainer = phoneFrame.createEl("div", { cls: "wechat-phone-content" });
      phoneFrame.createEl("div", { cls: "wechat-phone-home-indicator" });
    } else {
      this.previewContainer = wrapper.createEl("div", { cls: "wechat-classic-content" });
    }

    this.renderPreview();

    this.registerEvent(
      this.app.workspace.on("editor-change", () => this.scheduleRender())
    );
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => this.renderPreview())
    );

    // 点击空白处关闭设置面板
    this.registerDomEvent(container, "click", (evt) => {
      if (!this.settingsOpen) return;
      const target = evt.target as HTMLElement;
      if (this.settingsOverlay.contains(target)) return;
      // 点击的不是设置按钮本身（精确判断，避免被其他图标按钮干扰）
      if (this.settingsBtn && this.settingsBtn.contains(target)) return;
      this.settingsOpen = false;
      this.settingsOverlay.removeClass("visible");
    });
  }

  createToolbar(toolbar: HTMLElement) {
    // 左侧标题区
    this.toolbarTitle = toolbar.createEl("div", { cls: "wechat-toolbar-title" });
    this.toolbarTitle.createEl("span", { cls: "wechat-toolbar-plugin-name", text: "公众号排版" });
    const docName = this.toolbarTitle.createEl("span", { cls: "wechat-toolbar-doc-name", text: "未打开文件" });
    docName.setAttribute("data-doc-name", "true");

    // 右侧操作按钮
    const actions = toolbar.createEl("div", { cls: "wechat-toolbar-actions" });

    const cardBtn = this.createIconBtn(actions, BOOK_SVG, "插入书单卡片");
    cardBtn.addEventListener("click", () => this.plugin.openBookCardModal());

    const settingsBtn = this.createIconBtn(actions, SLIDERS_SVG, "设置");
    this.settingsBtn = settingsBtn;
    settingsBtn.addEventListener("click", () => this.toggleSettings());

    const modeBtn = this.createIconBtn(actions, MONITOR_PHONE_SVG, "切换预览模式");
    modeBtn.addEventListener("click", () => this.toggleMode());

    const copyBtn = this.createIconBtn(actions, COPY_SVG, "复制 HTML");
    copyBtn.addEventListener("click", () => this.copyHTML());

    const pushBtn = this.createIconBtn(actions, SEND_SVG, "推送草稿箱");
    pushBtn.addClass("wechat-push-btn");
    pushBtn.addEventListener("click", () => this.pushDraft());
  }

  createIconBtn(parent: HTMLElement, svg: string, label: string): HTMLElement {
    const btn = parent.createEl("button", {
      cls: "wechat-icon-btn",
      attr: { "aria-label": label, title: label },
    });
    btn.innerHTML = svg;
    return btn;
  }

  // ====== 浮动设置面板 ======

  toggleSettings() {
    this.settingsOpen = !this.settingsOpen;
    if (this.settingsOpen) {
      this.buildSettingsContent();
      this.settingsOverlay.addClass("visible");
    } else {
      this.settingsOverlay.removeClass("visible");
    }
  }

  buildSettingsContent() {
    const overlay = this.settingsOverlay;
    overlay.empty();

    const area = overlay.createEl("div", { cls: "wechat-settings-area" });

    // 主题选择
    this.createSettingSection(area, "主题", (content) => {
      const grid = content.createEl("div", { cls: "wechat-btn-grid" });
      Object.entries(themes).forEach(([key, theme]) => {
        const btn = grid.createEl("button", {
          cls: `wechat-btn-theme ${this.plugin.settings.theme === key ? "active" : ""}`,
          text: theme.name,
        });
        btn.addEventListener("click", () => {
          this.plugin.settings.theme = key;
          this.plugin.saveSettings();
          this.buildSettingsContent();
          this.renderPreview();
        });
      });
    });

    // Dia 一级标题装饰（仅 Dia 系列主题显示）
    if (this.plugin.settings.theme.startsWith("dia")) {
      this.createSettingSection(area, "Dia 一级标题", (content) => {
        const grid = content.createEl("div", { cls: "wechat-btn-grid" });
        const h1Opts: [string, string][] = [
          ["bar", "渐变竖条"],
          ["triangle", "播放三角 ▶"],
          ["arrow", "右向箭头 ⏏"],
          ["pill", "渐变方块"],
        ];
        h1Opts.forEach(([val, label]) => {
          const btn = grid.createEl("button", {
            cls: `wechat-btn-theme ${(this.plugin.settings.diaH1Style || "bar") === val ? "active" : ""}`,
            text: label,
          });
          btn.addEventListener("click", () => {
            this.plugin.settings.diaH1Style = val;
            this.plugin.saveSettings();
            this.buildSettingsContent();
            this.renderPreview();
          });
        });
      });
    }

    // 主题色（矩形色块 2×4 + 圆形自定义取色器，按设计图）
    this.createSettingSection(area, "主题色", (content) => {
      const colorGrid = content.createEl("div", { cls: "wechat-color-grid" });
      accentColorOptions.forEach((opt) => {
        const btn = colorGrid.createEl("button", {
          cls: `wechat-btn-color ${this.plugin.settings.accentColor === opt.color ? "active" : ""}`,
        });
        btn.style.setProperty("background-color", opt.color);
        btn.setAttribute("aria-label", opt.label);
        btn.addEventListener("click", () => {
          this.plugin.settings.accentColor = opt.color;
          this.plugin.saveSettings();
          this.buildSettingsContent();
          this.renderPreview();
        });
      });

      // 自定义行：圆形取色器 + 当前色码 + 默认
      const currentColor = this.plugin.settings.accentColor || "";
      const isCustom = currentColor !== "" && !accentColorOptions.some(o => o.color === currentColor);
      const customRow = content.createEl("div", { cls: "wechat-color-custom-row" });

      const customWrap = customRow.createEl("label", { cls: `wechat-color-custom ${isCustom ? "active" : ""}` });
      const customInput = customWrap.createEl("input", {
        attr: { type: "color", value: isCustom ? currentColor : "#536DEC" },
      });
      customInput.style.setProperty("opacity", "0");
      customInput.style.setProperty("position", "absolute");
      customInput.style.setProperty("width", "0");
      customInput.style.setProperty("height", "0");
      customInput.style.setProperty("padding", "0");
      const customPreview = customWrap.createEl("span", { cls: "wechat-color-custom-preview" });
      customPreview.style.setProperty("background-color", currentColor || "#d2d2d7");
      const codeText = customRow.createEl("span", {
        cls: "wechat-color-code",
        text: currentColor ? currentColor.toUpperCase() : "默认主题色",
      });

      customInput.addEventListener("input", () => {
        this.plugin.settings.accentColor = customInput.value;
        customPreview.style.setProperty("background-color", customInput.value);
        codeText.textContent = customInput.value.toUpperCase();
        customWrap.addClass("active");
        this.plugin.saveSettings();
        this.renderPreview();
      });
      customInput.addEventListener("change", () => {
        this.buildSettingsContent();
      });

      const resetBtn = customRow.createEl("button", {
        cls: `wechat-btn-custom-text ${!currentColor ? "active" : ""}`,
        text: "默认",
      });
      resetBtn.addEventListener("click", () => {
        this.plugin.settings.accentColor = "";
        this.plugin.saveSettings();
        this.buildSettingsContent();
        this.renderPreview();
      });
    });

    // 高级选项（字体 / 字号 / 标题居中 / 侧边距 / Mac 代码块 / 图片标注）
    const details = area.createEl("details", { cls: "wechat-settings-details" });
    details.createEl("summary", { cls: "wechat-settings-summary", text: "高级选项" });
    const detailsContent = details.createEl("div", { cls: "wechat-settings-area" });

    // 字体
    this.createSettingSection(detailsContent, "字体", (content) => {
      const grid = content.createEl("div", { cls: "wechat-btn-grid" });
      Object.entries(fontFamilyOptions).forEach(([key, opt]) => {
        const btn = grid.createEl("button", {
          cls: `wechat-btn-theme ${this.plugin.settings.fontFamily === key ? "active" : ""}`,
          text: opt.label,
        });
        btn.addEventListener("click", () => {
          this.plugin.settings.fontFamily = key;
          this.plugin.saveSettings();
          this.buildSettingsContent();
          this.renderPreview();
        });
      });
    });

    // 字号
    this.createSettingSection(detailsContent, "字号", (content) => {
      const row = content.createEl("div", { cls: "wechat-btn-row" });
      fontSizeOptions.forEach((opt) => {
        const btn = row.createEl("button", {
          cls: `wechat-btn-size ${this.plugin.settings.fontSize === opt.value ? "active" : ""}`,
          text: opt.label,
        });
        btn.addEventListener("click", () => {
          this.plugin.settings.fontSize = opt.value;
          this.plugin.saveSettings();
          this.buildSettingsContent();
          this.renderPreview();
        });
      });
    });

    // 标题居中
    this.createSettingSection(detailsContent, "标题居中", (content) => {
      const toggle = content.createEl("label", { cls: "wechat-toggle" });
      const input = toggle.createEl("input", {
        cls: "wechat-toggle-input",
        attr: { type: "checkbox" },
      });
      if (this.plugin.settings.centerHeading) input.checked = true;
      toggle.createEl("span", { cls: "wechat-toggle-slider" });
      input.addEventListener("change", () => {
        this.plugin.settings.centerHeading = input.checked;
        this.plugin.saveSettings();
        this.renderPreview();
      });
    });

    // 侧边距
    this.createSettingSection(detailsContent, "侧边距", (content) => {
      const sliderContainer = content.createEl("div", { cls: "wechat-slider-container" });
      const slider = sliderContainer.createEl("input", {
        cls: "wechat-slider",
        attr: { type: "range", min: "8", max: "30", step: "1", value: String(this.plugin.settings.sideMargin) },
      });
      const label = sliderContainer.createEl("span", { cls: "wechat-slider-label", text: `${this.plugin.settings.sideMargin}px` });
      slider.addEventListener("input", () => {
        const v = parseInt(slider.value);
        this.plugin.settings.sideMargin = v;
        label.textContent = `${v}px`;
        this.renderPreview();
      });
      slider.addEventListener("change", () => {
        this.plugin.saveSettings();
      });
    });

    // Mac 代码块
    this.createSettingSection(detailsContent, "Mac 代码块", (content) => {
      const toggle = content.createEl("label", { cls: "wechat-toggle" });
      const input = toggle.createEl("input", {
        cls: "wechat-toggle-input",
        attr: { type: "checkbox" },
      });
      if (this.plugin.settings.macCodeBlock) input.checked = true;
      toggle.createEl("span", { cls: "wechat-toggle-slider" });
      input.addEventListener("change", () => {
        this.plugin.settings.macCodeBlock = input.checked;
        this.plugin.saveSettings();
        this.renderPreview();
      });
    });

    // 图片标注
    this.createSettingSection(detailsContent, "图片标注", (content) => {
      const toggle = content.createEl("label", { cls: "wechat-toggle" });
      const input = toggle.createEl("input", {
        cls: "wechat-toggle-input",
        attr: { type: "checkbox" },
      });
      if (this.plugin.settings.imageCaption) input.checked = true;
      toggle.createEl("span", { cls: "wechat-toggle-slider" });
      input.addEventListener("change", () => {
        this.plugin.settings.imageCaption = input.checked;
        this.plugin.saveSettings();
        this.renderPreview();
      });
    });
  }

  createSettingSection(parent: HTMLElement, label: string, buildContent: (content: HTMLElement) => void) {
    const section = parent.createEl("div", { cls: "wechat-setting-section" });
    section.createEl("div", { cls: "wechat-setting-label", text: label });
    const content = section.createEl("div", { cls: "wechat-setting-content" });
    buildContent(content);
  }

  // ====== 双模式切换 ======

  toggleMode() {
    this.plugin.settings.usePhoneFrame = !this.plugin.settings.usePhoneFrame;
    this.plugin.saveSettings();
    this.onOpen();
  }

  // ====== 预览渲染 ======

  scheduleRender() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      this.renderPreview();
    }, 500);
  }

  resolveImage(src: string, sourcePath: string): string {
    if (/^(https?:\/\/|data:|app:|capacitor:)/i.test(src)) return src;
    try {
      const linkPath = decodeURI(src);
      const tFile = this.app.metadataCache.getFirstLinkpathDest(linkPath, sourcePath);
      if (tFile) return this.app.vault.getResourcePath(tFile);
    } catch (e) {
      console.error("Image resolution failed:", src, e);
    }
    return src;
  }

  getThemeWithOverrides(): ThemeConfig {
    const base = themes[this.plugin.settings.theme] || themes.chunmu;
    return { ...base };
  }

  async renderPreview() {
    // 更新文档名
    const docNameEl = this.toolbarTitle?.querySelector("[data-doc-name]");
    const file = this.app.workspace.getActiveFile();
    if (docNameEl) {
      docNameEl.textContent = file ? file.basename : "未打开文件";
    }

    if (!file || file.extension !== "md") {
      this.previewContainer.innerHTML =
        '<div class="wechat-placeholder"><div class="wechat-placeholder-icon">📝</div><h2>开始预览</h2><p>打开一篇 Markdown 文件</p></div>';
      return;
    }

    // 加载动画
    this.previewContainer.addClass("wechat-preview-loading");

    const md = await this.app.vault.read(file);
    const theme = this.getThemeWithOverrides();
    const s = this.plugin.settings;
    const fontFamily = fontFamilyOptions[s.fontFamily]?.value;

    const html = markdownToWechatHTML(md, theme, buildConvertOptions(s, fontFamilyOptions, (src) => this.resolveImage(src, file.path)));

    this.previewContainer.innerHTML = html;
    this.previewContainer.removeClass("wechat-preview-loading");
  }

  async copyHTML() {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") return;

    const md = await this.app.vault.read(file);
    const prepared = await this.plugin.prepareMdForExport(md, file);
    const theme = this.getThemeWithOverrides();
    const s = this.plugin.settings;
    const fontFamily = fontFamilyOptions[s.fontFamily]?.value;

    const html = markdownToWechatHTML(prepared, theme, buildConvertOptions(s, fontFamilyOptions));
    await copyHTMLToClipboard(html);
    this.showNotice("HTML 已复制");
  }

  async pushDraft() {
    const file = this.app.workspace.getActiveFile();
    if (!file || file.extension !== "md") return;

    const md = await this.app.vault.read(file);
    const digest = md.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith(">"))[0]?.trim()?.slice(0, 120) || "";

    const modal = new SyncModal(this.app, this.plugin, file.basename, digest);
    modal.open();
  }

  showNotice(text: string) {
    const notice = document.createElement("div");
    notice.className = "wechat-notice";
    notice.textContent = text;
    document.body.appendChild(notice);
    setTimeout(() => notice.remove(), 2000);
  }
}

// ====== 同步弹窗 Modal ======

class SyncModal extends Modal {
  plugin: WeChatPublishPlugin;
  title: string;
  digest: string;
  coverUrl: string = "";

  constructor(app: any, plugin: WeChatPublishPlugin, title: string, digest: string) {
    super(app);
    this.plugin = plugin;
    this.title = title;
    this.digest = digest;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("wechat-sync-modal");

    contentEl.createEl("h2", { text: "同步到微信草稿箱" });

    // 标题
    this.createField(contentEl, "文章标题", this.title);

    // 作者
    this.createField(contentEl, "作者", this.plugin.settings.author);

    // 摘要
    const digestSection = contentEl.createEl("div", { cls: "wechat-modal-section" });
    digestSection.createEl("label", { cls: "wechat-modal-label", text: "摘要" });
    const textarea = digestSection.createEl("textarea", {
      cls: "wechat-digest-textarea",
      attr: { maxlength: "120", rows: "3", placeholder: "选填，留空自动截取" },
    });
    textarea.value = this.digest;
    const counter = digestSection.createEl("span", { cls: "wechat-digest-counter", text: `${this.digest.length}/120` });
    textarea.addEventListener("input", () => {
      this.digest = textarea.value;
      counter.textContent = `${textarea.value.length}/120`;
    });

    // API 地址
    this.createField(contentEl, "API 地址", this.plugin.settings.apiUrl);

    // 按钮区
    const buttons = contentEl.createEl("div", { cls: "wechat-modal-buttons" });
    const cancelBtn = buttons.createEl("button", { text: "取消" });
    cancelBtn.addEventListener("click", () => this.close());

    const syncBtn = buttons.createEl("button", { cls: "mod-cta", text: "开始同步" });
    syncBtn.addEventListener("click", async () => {
      syncBtn.textContent = "同步中...";
      syncBtn.setAttribute("disabled", "true");

      const file = this.app.workspace.getActiveFile();
      if (!file) return;
      const md = await this.app.vault.read(file);
      const prepared = await this.plugin.prepareMdForExport(md, file);
      const theme = themes[this.plugin.settings.theme] || themes.chunmu;
      const s = this.plugin.settings;
      const fontFamily = fontFamilyOptions[s.fontFamily]?.value;

      const html = markdownToWechatHTML(prepared, theme, buildConvertOptions(s, fontFamilyOptions));

      const result = await pushToDraft({
        title: this.title,
        author: this.plugin.settings.author,
        digest: this.digest,
        content: html,
        apiUrl: this.plugin.settings.apiUrl,
      });

      if (result.success) {
        this.close();
        const notice = document.createElement("div");
        notice.className = "wechat-notice wechat-notice-success";
        notice.textContent = result.message;
        document.body.appendChild(notice);
        setTimeout(() => notice.remove(), 3000);
      } else {
        syncBtn.textContent = "开始同步";
        syncBtn.removeAttribute("disabled");
        const errorEl = contentEl.createEl("div", { cls: "wechat-sync-error", text: result.message });
        setTimeout(() => errorEl.remove(), 5000);
      }
    });
  }

  createField(parent: HTMLElement, label: string, value: string) {
    const section = parent.createEl("div", { cls: "wechat-modal-section" });
    section.createEl("label", { cls: "wechat-modal-label", text: label });
    section.createEl("div", { cls: "wechat-modal-value", text: value });
  }

  onClose() {
    this.contentEl.empty();
  }
}
