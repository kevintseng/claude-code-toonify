# 🎯 Toonify MCP

**[English](README.md) | [繁體中文](README.zh-TW.md)**

MCP server providing token optimization tools for converting structured data to TOON format.
Reduces Claude API token usage by 60%+ on average.

## Features

- **60%+ Token Reduction** for JSON, CSV, YAML data
- **MCP Integration** - Works with Claude Code, Claude Desktop
- **Built-in Metrics** - Track token savings locally
- **Silent Fallback** - Never breaks your workflow

## Installation

### 1. Install the package

```bash
npm install -g toonify-mcp
```

### 2. Register with Claude Code

```bash
# User scope (available in all projects)
claude mcp add --scope user --transport stdio toonify -- /opt/homebrew/bin/toonify-mcp

# Or project scope
claude mcp add --scope project --transport stdio toonify -- /opt/homebrew/bin/toonify-mcp
```

### 3. Verify installation

```bash
claude mcp list
# Should show: toonify: /opt/homebrew/bin/toonify-mcp - ✓ Connected
```

## Usage

### Option A: MCP Tools (Manual)

Call tools explicitly when needed:

```bash
# Optimize content
claude mcp call toonify optimize_content '{"content": "..."}'

# View stats
claude mcp call toonify get_stats '{}'
```

### Option B: Claude Code Hook (Automatic) ⭐ RECOMMENDED

Automatic interception for Claude Code users:

```bash
cd hooks/
npm install
npm run build
npm run install-hook

# Verify
claude hooks list  # Should show: PostToolUse
```

See `hooks/README.md` for details.

## Configuration

```bash
# Environment variables
export TOONIFY_ENABLED=true
export TOONIFY_MIN_TOKENS=50
export TOONIFY_MIN_SAVINGS=30
export TOONIFY_SKIP_TOOLS="Bash,Write"

# Or ~/.claude/toonify-config.json
{
  "enabled": true,
  "minTokensThreshold": 50,
  "minSavingsThreshold": 30,
  "skipToolPatterns": ["Bash", "Write"]
}
```

## Links

- **GitHub**: https://github.com/kevintseng/toonify-mcp
- **Issues**: https://github.com/kevintseng/toonify-mcp/issues
- **MCP Docs**: https://code.claude.com/docs/mcp

## License

MIT License - see [LICENSE](LICENSE)
