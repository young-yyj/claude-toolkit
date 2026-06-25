# MCP / Skill 工具集

本目录收录常用 MCP Server 和 AI Agent Skill 的介绍、配置方法和部署指南。

## 目录

| 工具 | 类型 | 功能 | 文档 |
|------|------|------|------|
| [CodeGraph](./codegraph.md) | MCP | 代码图谱探索与语义搜索 | [→](./codegraph.md) |
| [Playwright](./playwright.md) | MCP | 浏览器自动化控制 | [→](./playwright.md) |
| [Tavily](./tavily.md) | MCP | 网络搜索与内容提取 | [→](./tavily.md) |
| [BrowserAct](./browseract.md) | Skill | 反检测浏览器自动化 + 人工接管 | [→](./browseract.md) |

## 什么是 MCP？

MCP (Model Context Protocol) 是一种开放协议，允许 AI 工具（如 Claude Code、OpenCode、Cursor 等）通过标准化接口与外部服务交互。每个 MCP Server 提供一组 tools，AI 可以在对话中调用这些工具来完成特定任务。

## 文档规范

新增工具请遵循 [TEMPLATE.md](./TEMPLATE.md) 模板，统一四段式结构：基本信息 → 功能介绍 → 适用场景 → 优势劣势（含同类对比）。

## 部署概览

| AI 工具 | 配置位置 | 格式 |
|---------|----------|------|
| **Claude Code** | `~/.claude/settings.json` → `mcpServers` | JSON |
| **OpenCode** | `~/.config/opencode/opencode.json` → `mcp` | JSON |
| **Codex** | `~/.codex/config.json` → `mcpServers` | JSON |
| **Hermes** | 项目根目录 `hermes.config.json` → `mcpServers` | JSON |
| **Cursor** | `.cursor/mcp.json` | JSON |
| **Windsurf** | `~/.windsurf/mcp_servers.json` | JSON |
