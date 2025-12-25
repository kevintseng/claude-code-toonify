# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2025-12-25

### Fixed
- **Critical: Cross-platform compatibility fix for hooks and plugin installation**
  - Removed hardcoded Node.js path (`/opt/homebrew/bin/node`) from hooks configuration
  - Changed hook scripts to use shebang (`#!/usr/bin/env node`) for universal compatibility
  - Fixed plugin installation failure on non-macOS systems (Linux, Windows, nvm users)
  - Removed wildcard patterns in middle of commands from `settings.local.json` (Claude Code doesn't support `cmd *arg* rest:*` format)
  - Updated all permission rules to use prefix matching (`cmd:*`) or exact commands only

### Changed
- Hook scripts now use shebang for platform-agnostic execution
- Settings template now uses Claude Code-compatible command patterns
- Improved documentation for cross-platform setup

### Technical Details
**Root Cause**:
- Hardcoded `/opt/homebrew/bin/node` in hooks.json only works on macOS with Homebrew
- Wildcard in middle of command (`Bash(cmd *arg* rest:*)`) causes entire settings file to be skipped
- Claude Code requires either prefix wildcards (`:*`) or exact commands

**Impact**:
- Users on Linux, Windows, or using nvm couldn't install or use hooks
- Settings validation errors prevented hooks, plugins, and MCP servers from loading

**Solution**:
- All hook scripts made executable with proper shebang
- hooks.json updated to use direct script paths without hardcoded interpreter
- settings.local.json updated to use only supported wildcard patterns

## [0.2.2] - 2025-12-24

### Added
- Initial hook system for post-tool-use optimization
- MCP tools for token optimization

## [0.2.0] - 2025-12-23

### Added
- Initial release with basic TOON format optimization
- Support for JSON, CSV, and YAML optimization
