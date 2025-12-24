# Claude Code Toonify Hook

Automatic TOON format optimization hook for Claude Code CLI.

## What This Does

This hook **automatically intercepts** tool results from Read, Grep, and other file operations, detects structured data (JSON/CSV/YAML), and applies TOON format optimization when token savings > 30%.

**No manual calls required** - optimization happens transparently.

## Installation

### 1. Build the hook

```bash
cd hooks/
npm install
npm run build
```

### 2. Register with Claude Code

```bash
# From hooks/ directory
npm run install-hook

# Or manually:
claude hooks add PostToolUse -- node /Users/ktseng/Developer/Projects/toonify-mcp/hooks/post-tool-use.js
```

### 3. Verify installation

```bash
claude hooks list
# Should show: PostToolUse: node .../post-tool-use.js
```

## Configuration

Create `~/.claude/toonify-hook-config.json`:

```json
{
  "enabled": true,
  "minTokensThreshold": 50,
  "minSavingsThreshold": 30,
  "skipToolPatterns": ["Bash", "Write", "Edit"]
}
```

### Options

- `enabled`: Enable/disable automatic optimization (default: true)
- `minTokensThreshold`: Minimum tokens before optimization (default: 50)
- `minSavingsThreshold`: Minimum savings percentage required (default: 30%)
- `skipToolPatterns`: Tools to never optimize (default: ["Bash", "Write", "Edit"])

### Environment Variables

- `TOONIFY_SHOW_STATS=true` - Show optimization stats in output

## How It Works

```
User: Read large JSON file
  ↓
Claude Code calls Read tool
  ↓
PostToolUse hook intercepts result
  ↓
Hook detects JSON, converts to TOON
  ↓
Optimized content sent to Claude API
  ↓
60% token reduction achieved
```

## vs MCP Server

| Feature | MCP Server | PostToolUse Hook |
|---------|-----------|------------------|
| **Activation** | Manual (call tool) | Automatic (intercept) |
| **Compatibility** | Any MCP client | Claude Code only |
| **Configuration** | MCP tools | Hook config file |
| **Performance** | Call overhead | Zero overhead |

**Recommendation**: Use PostToolUse hook for automatic optimization in Claude Code. Use MCP server for explicit control or other MCP clients.

## Uninstall

```bash
claude hooks remove PostToolUse
rm ~/.claude/toonify-hook-config.json
```

## Troubleshooting

### Hook not triggering

```bash
# Check if hook is registered
claude hooks list

# Check configuration
cat ~/.claude/toonify-hook-config.json

# Test manually
echo '{"toolName":"Read","toolResult":{"content":[{"type":"text","text":"{\"test\":123}"}]}}' | node post-tool-use.js
```

### Optimization not applied

- Check `minTokensThreshold` - content might be too small
- Check `minSavingsThreshold` - savings might be < 30%
- Check `skipToolPatterns` - tool might be in skip list
- Verify content is valid JSON/CSV/YAML

## Examples

**Before (142 tokens)**:
```json
{
  "products": [
    {"id": 101, "name": "Laptop Pro", "price": 1299},
    {"id": 102, "name": "Magic Mouse", "price": 79}
  ]
}
```

**After (57 tokens, -60%)**:
```
[TOON-JSON]
products[2]{id,name,price}:
  101,Laptop Pro,1299
  102,Magic Mouse,79
```

**Automatically applied** - no manual calls needed!
