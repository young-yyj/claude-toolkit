# Tavily MCP

## 一、基本信息

> **一句话定位**：在需要从互联网主动搜索、提取、爬取信息时，这是最优解。它比 AI 工具内置的 WebFetch 强在支持搜索+提取+爬取+映射四合一，且支持远程 MCP 无需本地安装。

| 项目 | 详情 |
|------|------|
| **名称** | Tavily MCP |
| **类型** | 搜索与内容提取 |
| **协议** | MCP |
| **命令** | `npx -y tavily-mcp@latest` |
| **包管理** | npm（`tavily-mcp`） |
| **维护者** | Tavily AI |
| **许可证** | MIT |
| **GitHub Stars** | 2.1k+ |

### 相关地址

| 地址 | 链接 |
|------|------|
| GitHub | https://github.com/tavily-ai/tavily-mcp |
| npm | https://www.npmjs.com/package/tavily-mcp |
| 官网 | https://tavily.com |
| API 文档 | https://docs.tavily.com |
| MCP 协议 | https://spec.modelcontextprotocol.io |

## 二、功能介绍

- **实时网络搜索（核心功能）**：通过 Tavily 搜索 API 获取互联网最新信息，突破 LLM 训练数据截止日期。支持 basic 和 advanced 两种搜索深度，可指定域名过滤和结果数量
- **网页内容提取**：从 URL 提取网页正文内容，支持 basic/advanced 两种模式，advanced 模式可提取表格和嵌入内容
- **网站映射**：获取网站的结构化链接图，了解网站整体架构
- **网站爬取**：深度爬取网站内容，支持多层级探索
- **远程 MCP 服务器**：支持直接连接 Tavily 远程服务器（`https://mcp.tavily.com/mcp/`），无需本地安装
- **默认参数配置**：可通过 `DEFAULT_PARAMETERS` 环境变量设置搜索默认值

## 三、适用场景

| 场景 | 示例 |
|------|------|
| 实时信息查询 | "搜索最新的 AI 新闻" |
| 技术文档提取 | "提取这个 GitHub README 的内容" |
| 竞品调研 | "搜索竞品 X 的最新动态" |
| 深度研究 | "综合搜索结果回答：Rust 和 Go 哪个更适合系统编程？" |
| 网站结构分析 | "分析这个文档站的结构" |
| 批量内容爬取 | "爬取这个博客的所有文章标题" |

## 四、优势与劣势

### 同类对比

| 对比维度 | Tavily | Claude Code 内置（WebFetch） | Codex 内置 | Exa MCP |
|---------|--------|-----------------------------|------------|---------|
| 搜索能力 | ✅ 专业搜索 API | ❌ 仅抓取指定 URL | ❌ 仅抓取指定 URL | ✅ 语义搜索 |
| 内容提取 | ✅ basic/advanced | ✅ 基础提取 | ✅ 基础提取 | ❌ |
| 网站爬取 | ✅ 多层级 | ❌ | ❌ | ❌ |
| 网站映射 | ✅ | ❌ | ❌ | ❌ |
| 远程服务器 | ✅ 无需本地安装 | ❌ | ❌ | ❌ |
| 费用/License | MIT，1000次/月免费 | 内置（免费） | 内置（免费） | 有免费额度 |

> **内置 vs 外挂**：Claude Code 和 Codex 自带 WebFetch 工具可抓取指定 URL 的内容，但不支持主动搜索、深度爬取、网站映射。需要从互联网主动检索信息时才需要 Tavily MCP。

#### 选型结论

| 情况 | 推荐 |
|------|------|
| 只需要抓取单个已知 URL 的内容 | AI 工具内置 WebFetch 足够，无需额外安装 |
| 需要搜索、爬取、提取、映射一站式的信息获取 | **选用 Tavily MCP**，这是该场景下的最优解 |
| 需要以语义理解方式搜索（而非关键词） | 选用 Exa MCP |

### 优势

- **专为 AI 设计**：返回内容针对 LLM 优化，减少噪声
- **搜索+提取+爬取+映射**：四合一工具集，覆盖信息获取全场景
- **支持远程 MCP**：无需本地安装，直接连接 Tavily 云端
- **每月 1000 次免费调用**：适合日常使用
- **Markdown 输出**：结构化输出便于 AI 理解
- **OAuth 认证支持**：支持安全的 OAuth 认证流程

### 劣势

- 必须注册 Tavily 账号获取 API Key
- 免费版有月度调用上限（1000次/月）
- 需要网络连接
- 英文搜索质量优于中文
- 超出免费额度后按量付费

## 五、部署配置

### 运行环境要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows / macOS / Linux |
| 运行环境 | Node.js 20+ |
| 权限要求 | 无需特殊权限 |
| 架构要求 | 无限制 |

### 安装清单

| 组件 | 类型 | 安装方式 | 下载地址 | 大小 |
|------|------|---------|---------|------|
| Node.js 20+ | 运行环境 | 官网下载安装 | https://nodejs.org | 约 30MB |
| tavily-mcp | npm 包 | npx 自动安装 | https://www.npmjs.com/package/tavily-mcp | 约 1MB |
| Tavily API Key | 密钥 | 注册账号获取 | https://app.tavily.com | - |

获取 API Key 步骤：
1. 访问 https://tavily.com 注册账号
2. 进入 Dashboard 获取 API Key（格式：`tvly-dev-xxx`）
3. 将 API Key 填入下方配置的 `TAVILY_API_KEY` 字段

### 各平台配置

#### Claude Code

```json
{
  "mcpServers": {
    "tavily": {
      "command": ["npx", "-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "tvly-dev-YOUR_API_KEY"
      },
      "enabled": true
    }
  }
}
```

或使用远程 MCP（无需本地安装）：

```json
{
  "mcpServers": {
    "tavily": {
      "url": "https://mcp.tavily.com/mcp/?tavilyApiKey=YOUR_API_KEY"
    }
  }
}
```

验证：`claude mcp list` 检查 tavily 是否在列表中。

#### OpenCode

```json
{
  "mcp": {
    "tavily": {
      "command": ["npx", "-y", "tavily-mcp@latest"],
      "enabled": true,
      "type": "local",
      "environment": {
        "TAVILY_API_KEY": "tvly-dev-YOUR_API_KEY"
      }
    }
  }
}
```

验证：重启 OpenCode 后，在对话中询问 "有哪些可用的 MCP tools" 检查是否出现 Tavily 相关工具。

#### Codex

```json
{
  "mcpServers": {
    "tavily": {
      "command": ["npx", "-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "tvly-dev-YOUR_API_KEY"
      },
      "enabled": true
    }
  }
}
```

验证：`codex mcp list` 检查是否在列表中。

#### Cursor / Windsurf

```json
{
  "mcpServers": {
    "tavily": {
      "command": ["npx", "-y", "tavily-mcp@latest"],
      "env": {
        "TAVILY_API_KEY": "tvly-dev-YOUR_API_KEY"
      },
      "enabled": true
    }
  }
}
```

验证：在 Cursor/Windsurf 的设置中打开 MCP 页面，检查状态是否为绿色 "Connected"。

### 卸载

删除对应 MCP 配置块即可。npx 缓存由 npm 自动管理，无需手动删除。

### 更新

将 `@latest` 保留即可，npx 会自动使用最新版本。
