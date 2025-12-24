# 🎯 Toonify MCP

**[English](README.md) | [繁體中文](README.zh-TW.md)**

MCP 伺服器提供 Token 優化工具，將結構化資料轉換為 TOON 格式。
平均降低 Claude API Token 使用量達 60% 以上。

## 功能特色

- **60%+ Token 削減** - 支援 JSON、CSV、YAML 資料
- **MCP 整合** - 適用於 Claude Code、Claude Desktop
- **內建指標** - 本地追蹤 Token 節省量
- **靜默降級** - 絕不中斷工作流程

## 安裝步驟

### 1. 安裝套件

```bash
npm install -g toonify-mcp
```

### 2. 註冊至 Claude Code

```bash
# User scope（所有專案可用）
claude mcp add --scope user --transport stdio toonify -- /opt/homebrew/bin/toonify-mcp

# 或 Project scope
claude mcp add --scope project --transport stdio toonify -- /opt/homebrew/bin/toonify-mcp
```

### 3. 驗證安裝

```bash
claude mcp list
# 應顯示：toonify: /opt/homebrew/bin/toonify-mcp - ✓ Connected
```

## 使用方式

### 選項 A：MCP 工具（手動）

需要時明確呼叫工具：

```bash
# 優化內容
claude mcp call toonify optimize_content '{"content": "..."}'

# 查看統計
claude mcp call toonify get_stats '{}'
```

### 選項 B：Claude Code Hook（自動）⭐ 推薦

Claude Code 使用者適用的自動攔截：

```bash
cd hooks/
npm install
npm run build
npm run install-hook

# 驗證
claude hooks list  # 應顯示：PostToolUse
```

詳見 `hooks/README.md`。

## 設定選項

```bash
# 環境變數
export TOONIFY_ENABLED=true
export TOONIFY_MIN_TOKENS=50
export TOONIFY_MIN_SAVINGS=30
export TOONIFY_SKIP_TOOLS="Bash,Write"

# 或 ~/.claude/toonify-config.json
{
  "enabled": true,
  "minTokensThreshold": 50,
  "minSavingsThreshold": 30,
  "skipToolPatterns": ["Bash", "Write"]
}
```

## 連結

- **GitHub**：https://github.com/kevintseng/toonify-mcp
- **問題回報**：https://github.com/kevintseng/toonify-mcp/issues
- **MCP 文件**：https://code.claude.com/docs/mcp

## 授權

MIT License - 詳見 [LICENSE](LICENSE)
