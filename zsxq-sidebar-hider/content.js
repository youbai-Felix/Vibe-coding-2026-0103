(() => {
  const LS_KEY = 'zsxqLeftHidden'; // localStorage 镜像，只为 document_start 同步读，防侧栏闪现
  const CURATED = ['.group-list-container', 'app-group-list'];

  let hidden = readSyncState();
  let fab = null;
  const isTop = window === window.top;

  // document_start 阶段 documentElement 已存在，抢在首帧渲染前把类挂上，避免侧栏闪现
  document.documentElement.classList.toggle('zsxq-no-left', hidden);

  // ---- 状态：chrome.storage.local 为唯一事实源，localStorage 只是首帧缓存 ----

  function readSyncState() {
    const v = localStorage.getItem(LS_KEY);
    return v === null ? true : v === '1'; // 默认隐藏
  }

  chrome.storage.local.get({ hidden: true }).then(({ hidden: stored }) => {
    if (stored !== hidden) apply(stored);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.hidden) apply(changes.hidden.newValue);
  });

  function apply(v) {
    hidden = !!v;
    document.documentElement.classList.toggle('zsxq-no-left', hidden);
    localStorage.setItem(LS_KEY, hidden ? '1' : '0');
    if (hidden) detectAndTag();
    updateFab();
  }

  function toggle() {
    chrome.storage.local.get({ hidden: true }).then((s) => {
      chrome.storage.local.set({ hidden: !s.hidden });
    });
  }

  // ---- 找左侧栏：先按已知类名，找不到再按几何特征启发式兜底 ----

  function curatedExists() {
    for (const sel of CURATED) {
      const el = document.querySelector(sel);
      if (el && el.getBoundingClientRect().height > 100) return true;
    }
    return false;
  }

  // 类名漂移时的兜底：贴左边缘、固定窄宽（160–340px）、占大半屏高、含多个链接的列
  function detectAndTag() {
    if (curatedExists()) return;
    if (!document.body || innerHeight === 0) return;
    let best = null;
    let bestScore = 0;
    for (const el of document.querySelectorAll('#app > *, #app > * > *, body > *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (el.classList.contains('zsxq-fab')) continue;
      const r = el.getBoundingClientRect();
      if (r.left > 40 || r.width < 160 || r.width > 340 || r.height < innerHeight * 0.5) continue;
      const links = el.querySelectorAll('a, li').length;
      if (links < 3) continue;
      const score = r.height + links * 10;
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }
    if (best) best.classList.add('zsxq-sidebar-detected');
  }

  // 知识星球是 SPA，路由切换会重建节点：持续补打标 + 补挂悬浮按钮
  let moTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(moTimer);
    moTimer = setTimeout(() => {
      if (hidden) detectAndTag();
      mountFab();
    }, 300);
  });

  // ---- 左缘悬浮切换按钮 ----

  function mountFab() {
    if (!isTop) return; // 只在顶层页面挂悬浮按钮，iframe 里不重复出现
    if (fab && document.contains(fab)) return;
    if (!document.body) return;
    fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'zsxq-fab';
    fab.title = '显示/隐藏左侧栏（⌥ Option + ⇧ Shift + Z）';
    fab.addEventListener('click', toggle);
    document.body.appendChild(fab);
    updateFab();
  }

  function updateFab() {
    if (!fab) return;
    // 隐藏时箭头朝右（点开），显示时朝左（点收）
    fab.textContent = hidden ? '›' : '‹';
  }

  function boot() {
    apply(hidden);
    mountFab();
    // 页面内直接监听快捷键：Dia 等浏览器对 chrome.commands 注册支持不全，这里不依赖它
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyZ') {
          e.preventDefault();
          e.stopPropagation();
          toggle();
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
