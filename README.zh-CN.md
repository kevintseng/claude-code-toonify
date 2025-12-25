# 🎯 Toonify MCP

**[English](README.md) | [繁體中文](README.zh-TW.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Español](README.es.md) | [Tiếng Việt](README.vi.md) | [Bahasa Indonesia](README.id.md)**

MCP 服务器 + Claude Code 插件，提供结构化数据的自动 token 优化。
通过透明的 TOON 格式转换，**根据数据结构减少 30-65% 的 Claude API token 使用量**，结构化数据的典型节省率为 **50-55%**。

## v0.3.0 新功能

✨ **多语言 Token 优化！**
- ✅ 精确计算 15+ 种语言的 token（中文、日文、韩文、西班牙文、阿拉伯文等）
- ✅ 语言感知的 token 倍数（中文 2 倍、日文 2.5 倍、阿拉伯文 3 倍）
- ✅ 支持混合语言文本的自动检测
- ✅ 基于真实基准测试改进优化准确性
- ✅ 数据支持的 token 节省声明（30-65% 范围，通常 50-55%）

## 功能特色

- **30-65% Token 减少**（通常 50-55%）适用于 JSON、CSV、YAML 数据
- **多语言支持** - 精确计算 15+ 种语言的 token
- **完全自动** - PostToolUse hook 拦截工具结果
- **零配置** - 开箱即用，采用合理预设值
- **双模式** - 作为插件（自动）或 MCP 服务器（手动）
- **内建指标** - 在本地追踪 token 节省
- **静默回退** - 永不中断您的工作流程

## 安装

### 选项 A：Claude Code 插件（推荐）⭐

**零手动调用的自动 token 优化：**

```bash
# 1. 全局安装
npm install -g toonify-mcp

# 2. 添加为插件（自动模式）
claude plugin add toonify-mcp

# 3. 验证安装
claude plugin list
# 应显示：toonify-mcp ✓
```

**完成！** PostToolUse hook 现在会自动拦截并优化来自 Read、Grep 和其他文件工具的结构化数据。

### 选项 B：MCP 服务器（手动模式）

**用于明确控制或非 Claude Code MCP 客户端：**

```bash
# 1. 全局安装
npm install -g toonify-mcp

# 2. 注册为 MCP 服务器
claude mcp add toonify -- toonify-mcp

# 3. 验证
claude mcp list
# 应显示：toonify: toonify-mcp - ✓ Connected
```

然后明确调用工具：
```bash
claude mcp call toonify optimize_content '{"content": "..."}'
claude mcp call toonify get_stats '{}'
```

## 运作原理

### 插件模式（自动）

```
用户：读取大型 JSON 文件
  ↓
Claude Code 调用 Read 工具
  ↓
PostToolUse hook 拦截结果
  ↓
Hook 检测 JSON，转换为 TOON
  ↓
优化后的内容发送到 Claude API
  ↓
达成 50-55% 典型 token 减少 ✨
```

### MCP 服务器模式（手动）

```
用户：明确调用 mcp__toonify__optimize_content
  ↓
内容转换为 TOON 格式
  ↓
返回优化结果
```

## 配置

创建 `~/.claude/toonify-config.json`（可选）：

```json
{
  "enabled": true,
  "minTokensThreshold": 50,
  "minSavingsThreshold": 30,
  "skipToolPatterns": ["Bash", "Write", "Edit"]
}
```

### 选项

- **enabled**：启用/停用自动优化（预设：`true`）
- **minTokensThreshold**：优化前的最小 token 数（预设：`50`）
- **minSavingsThreshold**：所需的最小节省百分比（预设：`30%`）
- **skipToolPatterns**：永不优化的工具（预设：`["Bash", "Write", "Edit"]`）

### 环境变量

```bash
export TOONIFY_ENABLED=true
export TOONIFY_MIN_TOKENS=50
export TOONIFY_MIN_SAVINGS=30
export TOONIFY_SKIP_TOOLS="Bash,Write"
export TOONIFY_SHOW_STATS=true  # 在输出中显示优化统计
```

## 示例

### 优化前（142 tokens）

```json
{
  "products": [
    {"id": 101, "name": "Laptop Pro", "price": 1299},
    {"id": 102, "name": "Magic Mouse", "price": 79}
  ]
}
```

### 优化后（57 tokens，-60%）

```
[TOON-JSON]
products[2]{id,name,price}:
  101,Laptop Pro,1299
  102,Magic Mouse,79
```

**在插件模式下自动应用 - 无需手动调用！**

## 使用技巧

### 何时触发自动优化？

PostToolUse hook 在以下情况下自动优化：
- ✅ 内容是有效的 JSON、CSV 或 YAML
- ✅ 内容大小 ≥ `minTokensThreshold`（预设：50 tokens）
- ✅ 预估节省 ≥ `minSavingsThreshold`（预设：30%）
- ✅ 工具不在 `skipToolPatterns` 中（例如，不是 Bash/Write/Edit）

### 查看优化统计

```bash
# 在插件模式下
claude mcp call toonify get_stats '{}'

# 或检查 Claude Code 输出的统计（如果 TOONIFY_SHOW_STATS=true）
```

## 故障排除

### Hook 未触发

```bash
# 1. 检查插件是否已安装
claude plugin list | grep toonify

# 2. 检查配置
cat ~/.claude/toonify-config.json

# 3. 启用统计以查看优化尝试
export TOONIFY_SHOW_STATS=true
```

### 未应用优化

- 检查 `minTokensThreshold` - 内容可能太小
- 检查 `minSavingsThreshold` - 节省可能 < 30%
- 检查 `skipToolPatterns` - 工具可能在跳过列表中
- 验证内容是有效的 JSON/CSV/YAML

### 性能问题

- 降低 `minTokensThreshold` 以更积极地优化
- 提高 `minSavingsThreshold` 以跳过边际优化
- 如需要，将更多工具添加到 `skipToolPatterns`

## 比较：插件 vs MCP 服务器

| 功能 | 插件模式 | MCP 服务器模式 |
|------|---------|--------------|
| **激活** | 自动（PostToolUse） | 手动（调用工具） |
| **兼容性** | 仅 Claude Code | 任何 MCP 客户端 |
| **配置** | 插件配置文件 | MCP 工具 |
| **性能** | 零开销 | 调用开销 |
| **使用情境** | 日常工作流程 | 明确控制 |

**建议**：使用插件模式进行自动优化。使用 MCP 服务器模式进行明确控制或其他 MCP 客户端。

## 卸载

### 插件模式
```bash
claude plugin remove toonify-mcp
rm ~/.claude/toonify-config.json
```

### MCP 服务器模式
```bash
claude mcp remove toonify
```

### 包
```bash
npm uninstall -g toonify-mcp
```

## 链接

- **GitHub**：https://github.com/kevintseng/toonify-mcp
- **Issues**：https://github.com/kevintseng/toonify-mcp/issues
- **NPM**：https://www.npmjs.com/package/toonify-mcp
- **MCP 文档**：https://code.claude.com/docs/mcp
- **TOON 格式**：https://github.com/toon-format/toon

## 贡献

欢迎贡献！请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 授权

MIT 授权 - 请参阅 [LICENSE](LICENSE)

## 更新日志

### v0.3.0（2025-12-26）
- ✨ **多语言 token 优化** - 精确计算 15+ 种语言
- ✨ 语言感知的 token 倍数（中文 2 倍、日文 2.5 倍、阿拉伯文 3 倍等）
- ✨ 混合语言文本检测和优化
- ✨ 使用真实统计数据进行全面基准测试
- 📊 数据支持的 token 节省声明（30-65% 范围，通常 50-55%）
- ✅ 75+ 测试通过，包括多语言边缘情况
- 📝 多语言 README 版本

### v0.2.0 (2025-12-25)
- ✨ 添加 Claude Code 插件支持和 PostToolUse hook
- ✨ 自动 token 优化（无需手动调用）
- ✨ 插件配置系统
- ✨ 双模式：插件（自动）+ MCP 服务器（手动）
- 📝 全面文档更新

### v0.1.1 (2024-12-24)
- 🐛 错误修复和改进
- 📝 文档更新

### v0.1.0 (2024-12-24)
- 🎉 初始发布
- ✨ MCP 服务器实现
- ✨ TOON 格式优化
- ✨ 内建指标追踪
