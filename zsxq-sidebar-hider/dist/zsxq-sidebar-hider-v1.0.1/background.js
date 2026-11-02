// 工具栏图标点击 / 快捷键 → 翻转全局开关（存 chrome.storage，各标签页内容脚本监听同步）
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ hidden: true }, (s) => {
    chrome.storage.local.set({ hidden: s.hidden });
  });
});

async function toggle() {
  const s = await chrome.storage.local.get({ hidden: true });
  await chrome.storage.local.set({ hidden: !s.hidden });
}

chrome.action.onClicked.addListener(toggle);
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd === 'toggle-sidebar') toggle();
});
