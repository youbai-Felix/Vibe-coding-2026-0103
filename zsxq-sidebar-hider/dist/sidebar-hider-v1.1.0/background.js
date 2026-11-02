// 工具栏图标点击 / 快捷键 → 转发给当前标签页的内容脚本去翻转对应维度
// （扩展没有 host 权限，background 的 tabs.query 读不到 URL，站点判断只能在 content 侧做）
chrome.runtime.onInstalled.addListener(() => {
  // 迁移旧版单开关 hidden → zsxqLeft；首次安装各维度默认隐藏
  chrome.storage.local.get(null, (s) => {
    const updates = {};
    if (s.zsxqLeft === undefined) updates.zsxqLeft = s.hidden === undefined ? true : !!s.hidden;
    if (s.zsxqRight === undefined) updates.zsxqRight = true;
    if (s.xbtRight === undefined) updates.xbtRight = true;
    chrome.storage.local.set(updates);
  });
});

async function sendToActiveTab(dim) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'toggle', dim });
  } catch {
    // 当前页没有内容脚本（非目标站点），静默忽略
  }
}

chrome.action.onClicked.addListener(() => sendToActiveTab('auto'));
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === 'toggle-sidebar') sendToActiveTab('left');
  else if (cmd === 'toggle-right') sendToActiveTab('right');
});
