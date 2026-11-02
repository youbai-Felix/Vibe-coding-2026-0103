(() => {
  // 站点与维度配置：每个维度一组已知选择器 + html 类 + storage/localStorage 键
  // 选择器来源：zsxq 左栏/右栏为 Greasyfork 2025-07 #541540、2026-02 #565137 交叉验证的类名；
  // 小报童右栏为 2026-11-02 在 xiaobot.net/p/* 实测（.sidebar-sticky > .info-wrapper > .paper-info）
  const SITES = {
    zsxq: {
      left: {
        selectors: ['.group-list-container', 'app-group-list'],
        htmlClass: 'zsxq-no-left',
        storageKey: 'zsxqLeft',
        lsKey: 'zsxqLeftHidden',
      },
      right: {
        selectors: ['.group-preview-wrapper', 'app-group-info'],
        htmlClass: 'zsxq-no-right',
        storageKey: 'zsxqRight',
        lsKey: 'zsxqRightHidden',
      },
    },
    xiaobot: {
      right: {
        selectors: ['.sidebar-sticky', '.info-wrapper', '.paper-info'],
        htmlClass: 'xbt-no-right',
        storageKey: 'xbtRight',
        lsKey: 'xbtRightHidden',
      },
    },
  };

  const host = location.hostname;
  const site = host.includes('zsxq') ? 'zsxq' : host.includes('xiaobot') ? 'xiaobot' : null;
  if (!site) return;
  const dims = SITES[site]; // { left?: cfg, right?: cfg }

  const state = {};
  const fabs = { left: null, right: null };
  const isTop = window === window.top;

  // document_start 阶段 documentElement 已存在，抢在首帧渲染前把类挂上，避免侧栏闪现
  for (const [dim, cfg] of Object.entries(dims)) {
    const v = localStorage.getItem(cfg.lsKey);
    const on = v === null ? true : v === '1'; // 各维度默认隐藏
    state[dim] = on;
    document.documentElement.classList.toggle(cfg.htmlClass, on);
  }

  // ---- 状态：chrome.storage.local 为唯一事实源，localStorage 只是首帧缓存 ----

  chrome.storage.local.get(null).then((stored) => {
    for (const [dim, cfg] of Object.entries(dims)) {
      const val = stored[cfg.storageKey];
      const on = val === undefined ? true : !!val;
      if (on !== state[dim]) apply(dim, on);
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const [dim, cfg] of Object.entries(dims)) {
      if (changes[cfg.storageKey]) apply(dim, !!changes[cfg.storageKey].newValue);
    }
  });

  function apply(dim, on) {
    const cfg = dims[dim];
    if (!cfg) return;
    state[dim] = !!on;
    document.documentElement.classList.toggle(cfg.htmlClass, state[dim]);
    localStorage.setItem(cfg.lsKey, state[dim] ? '1' : '0');
    if (state[dim]) detectAndTag(dim);
    updateFabs();
  }

  function toggle(dim) {
    const cfg = dims[dim];
    if (!cfg) return;
    chrome.storage.local.get({ [cfg.storageKey]: true }).then((s) => {
      chrome.storage.local.set({ [cfg.storageKey]: !s[cfg.storageKey] });
    });
  }

  // 工具栏图标 / chrome.commands 走消息路由到这里（background 拿不到无 host 权限页面的 URL）
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type !== 'toggle') return;
    const dim = msg.dim === 'auto' ? (dims.left ? 'left' : 'right') : msg.dim;
    toggle(dim);
  });

  // ---- 找侧栏：先按已知类名，找不到再按几何特征启发式兜底 ----

  function curatedExists(dim) {
    for (const sel of dims[dim].selectors) {
      const el = document.querySelector(sel);
      if (el && el.getBoundingClientRect().height > 100) return true;
    }
    return false;
  }

  // 类名漂移时的兜底：贴左/右屏幕边缘、固定窄宽、占大半屏高、含若干链接的列
  function detectAndTag(dim) {
    if (curatedExists(dim)) return;
    if (!document.body || innerHeight === 0) return;
    const isLeft = dim === 'left';
    let best = null;
    let bestScore = 0;
    for (const el of document.querySelectorAll('#app > *, #app > * > *, body > *, .app-container > *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.classList.contains('zsxq-fab')) continue;
      const r = el.getBoundingClientRect();
      const wMax = isLeft ? 340 : 400; // 右栏（专栏信息卡）普遍比左栏稍宽
      if (r.width < 160 || r.width > wMax || r.height < innerHeight * 0.5) continue;
      if (isLeft ? r.left > 40 : r.right < innerWidth - 40) continue; // 必须贴对应边缘
      const links = el.querySelectorAll('a, li, button').length;
      if (links < (isLeft ? 3 : 1)) continue;
      const score = r.height + links * 10;
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }
    if (best) best.classList.add(isLeft ? 'zsxq-sidebar-detected' : 'zsxq-rightbar-detected');
  }

  // 两站都是 SPA，路由切换会重建节点：持续补打标 + 补挂悬浮按钮
  let moTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(moTimer);
    moTimer = setTimeout(() => {
      for (const dim of Object.keys(dims)) {
        if (state[dim]) detectAndTag(dim);
      }
      mountFabs();
    }, 300);
  });

  // ---- 屏幕左右两缘的悬浮切换按钮 ----

  function mountFabs() {
    if (!isTop) return; // 只在顶层页面挂悬浮按钮，iframe 里不重复出现
    if (!document.body) return;
    for (const [dim, cfg] of Object.entries(dims)) {
      if (fabs[dim] && document.contains(fabs[dim])) continue;
      const fab = document.createElement('button');
      fab.type = 'button';
      fab.className = 'zsxq-fab' + (dim === 'right' ? ' right' : '');
      fab.title =
        `显示/隐藏右侧栏（⌥ Option + ⇧ Shift + X）`;
      if (dim === 'left') fab.title = '显示/隐藏左侧栏（⌥ Option + ⇧ Shift + Z）';
      fab.addEventListener('click', () => toggle(dim));
      document.body.appendChild(fab);
      fabs[dim] = fab;
    }
    updateFabs();
  }

  function updateFabs() {
    if (fabs.left) fabs.left.textContent = state.left ? '›' : '‹'; // 隐藏时朝右（点开），显示时朝左（点收）
    if (fabs.right) fabs.right.textContent = state.right ? '‹' : '›'; // 镜像：隐藏时朝左，显示时朝右
  }

  function boot() {
    for (const dim of Object.keys(dims)) apply(dim, state[dim]);
    mountFabs();
    // 页面内直接监听快捷键：Dia 等浏览器对 chrome.commands 注册支持不全，这里不依赖它
    document.addEventListener(
      'keydown',
      (e) => {
        if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
        if (e.code === 'KeyZ' && dims.left) {
          e.preventDefault();
          e.stopPropagation();
          toggle('left');
        } else if (e.code === 'KeyX' && dims.right) {
          e.preventDefault();
          e.stopPropagation();
          toggle('right');
        }
      },
      true
    );
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
