#!/usr/bin/env bash
# 一键部署：编译 + 复制到 Obsidian vault 插件目录
# 用法：npm run deploy
set -e

# Obsidian vault 插件目录（自我进化系统）
VAULT_PLUGIN="/Users/wangxinyu/Obsidian/自我进化系统/.obsidian/plugins/wechat-publish"

if [ ! -d "$VAULT_PLUGIN" ]; then
  echo "❌ 找不到插件目录：$VAULT_PLUGIN"
  exit 1
fi

echo "📦 编译中..."
rollup -c

echo "📤 复制到 vault..."
cp -v main.js manifest.json styles.css "$VAULT_PLUGIN/"

echo ""
echo "✅ 已部署到 vault「自我进化系统」"
echo "⚠️  请在 Obsidian 设置 → 第三方插件里，关闭再开启「公众号发布」，或重启 Obsidian 使其生效。"
