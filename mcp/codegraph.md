# CodeGraph

## 一、基本信息

> **一句话定位**：在大型代码库中理解代码逻辑和调用关系时，这是最优解。它比内置的 grep/Read 强在一次调用即可获取源码+调用链+影响范围，无需数十次手动查找。

| 项目 | 详情 |
|------|------|
| **名称** | CodeGraph |
| **类型** | 代码图谱分析 |
| **协议** | MCP |
| **命令** | `codegraph serve --mcp` |
| **包管理** | npm（全局安装 `codegraph`） |
| **维护者** | Colby McHenry |
| **许可证** | MIT |
| **GitHub Stars** | 54k+ |

### 相关地址

| 地址 | 链接 |
|------|------|
| GitHub | https://github.com/colbymchenry/codegraph |
| 官方文档 | https://colbymchenry.github.io/codegraph |
| MCP 协议 | https://spec.modelcontextprotocol.io |

## 二、功能介绍

- **`codegraph_explore`（核心工具）**：用自然语言提问或传入符号名，返回带行号的原始源码 + 调用路径（包括回调、React 重渲染、JSX 子组件等 grep 无法追踪的动态派发）+ 影响范围分析。一次调用通常就能回答整个问题，无需读取文件
- **`codegraph_node`**：获取单个符号的源码及调用者/被调用者链路，或读取整个文件（等价于 Read 工具）
- **`codegraph_search`**：按名称在代码库中搜索符号（仅返回位置）
- **`codegraph_callers`**：查找哪些地方调用了某个函数
- **`codegraph_callees`**：查找某个函数调用了哪些函数
- **`codegraph_impact`**：分析修改某个符号会影响哪些代码
- **`codegraph_files`**：获取已索引的文件结构（比扫描文件系统更快）
- **`codegraph_status`**：检查索引健康状态和统计信息

> 官方设计说明：默认只暴露 `codegraph_explore` 一个工具。实测表明，一个精准的工具比多个窄工具更能让 AI 直接给出答案，减少误选。其他 7 个工具默认隐藏但功能完整，可通过环境变量 `CODEGRAPH_MCP_TOOLS` 重新启用。

## 三、适用场景

| 场景 | 示例 |
|------|------|
| 追问代码逻辑 | "这段代码是怎么工作的？" |
| 架构理解 | "这个项目的整体架构是怎样的？" |
| 调用链追踪 | "X 函数是怎么调用到 Y 的？" |
| 修改影响分析 | "改了这个接口会影响哪些地方？" |
| 快速定位 | "auth 模块在哪里？" |
| 代码审查 | "这个模块的依赖关系合理吗？" |

## 四、优势与劣势

### 同类对比

| 对比维度 | CodeGraph | Claude Code 内置（Grep/Read） | Codex 内置 | Cursor 内置 |
|---------|-----------|------------------------------|------------|-------------|
| 搜索方式 | 语义级 AST 图谱 | 文本匹配 | 文本匹配 | 文本+语义混合 |
| 调用链追踪 | ✅ 含动态派发 | ❌ | ❌ | 部分支持 |
| 影响范围分析 | ✅ blast-radius | ❌ | ❌ | ❌ |
| 一次调用完成 | ✅ 通常 1 次 | ❌ 需数十次 grep+Read | ❌ | ❌ |
| 费用/License | MIT 免费 | 内置（免费） | 内置（免费） | 内置 |
| 离线使用 | ✅ | ✅ | ✅ | ✅ |

> **内置 vs 外挂**：Claude Code / Codex / Cursor 自带的代码搜索基于文本匹配（grep/ripgrep），无法追踪函数调用链和动态派发。CodeGraph 的核心优势是**一次调用替代数十次 grep+Read**，特别适合大型复杂项目的代码理解和影响分析。

#### 选型结论

| 情况 | 推荐 |
|------|------|
| 只是简单搜索关键字 | 内置 grep 足够，无需额外安装 |
| 需要理解代码逻辑、调用链、影响范围 | **选用 CodeGraph**，这是该场景下的最优解 |
| 需要跨 AI 工具共享代码索引 | 选用 CodeGraph（MCP 协议，所有 MCP 客户端通用） |

### 优势

- **一次调用替代数十次文件读取**：`codegraph_explore` 返回源码+调用链+影响范围，通常一个问题只需一次调用
- **追踪动态派发**：能追踪回调、React 重渲染、JSX 子组件等 grep 无法跟随的调用路径
- **社区认可度高**：54k+ Star，维护活跃
- **零配置启动**：安装后 `codegraph build` 即可使用
- **完全开源**：MIT 协议，可自由部署，无云端依赖

### 劣势

- 需要预构建索引，首次使用需运行 `codegraph build`，代码变更后需重新构建
- 大型项目首次索引可能需要较长时间
- 需要 Node.js 18+
- 大型项目索引文件可能占用较多磁盘空间

## 五、部署配置

### 运行环境要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows / macOS / Linux |
| 运行环境 | Node.js 18+ |
| 权限要求 | 无需特殊权限 |
| 架构要求 | 无限制 |

### 安装清单

| 组件 | 类型 | 安装方式 | 下载地址 | 大小 |
|------|------|---------|---------|------|
| Node.js 18+ | 运行环境 | 官网下载安装 | https://nodejs.org | 约 30MB |
| codegraph | CLI 工具 | `npm install -g codegraph` | https://github.com/colbymchenry/codegraph | 约 5MB |

### 各平台配置

#### Claude Code

```json
{
  "mcpServers": {
    "codegraph": {
      "command": ["codegraph", "serve", "--mcp"],
      "enabled": true
    }
  }
}
```

验证：`claude mcp list` 检查 codegraph 是否在列表中。

#### OpenCode

```json
{
  "mcp": {
    "codegraph": {
      "command": ["codegraph", "serve", "--mcp"],
      "enabled": true,
      "type": "local"
    }
  }
}
```

验证：重启 OpenCode 后，在对话中询问 "有哪些可用的 MCP tools" 检查是否出现 CodeGraph 相关工具。

#### Codex

```json
{
  "mcpServers": {
    "codegraph": {
      "command": ["codegraph", "serve", "--mcp"],
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
    "codegraph": {
      "command": ["codegraph", "serve", "--mcp"],
      "enabled": true
    }
  }
}
```

验证：在 Cursor/Windsurf 的设置中打开 MCP 页面，检查状态是否为绿色 "Connected"。

### 卸载

删除对应 MCP 配置块即可。全局安装的 `codegraph` CLI 可执行 `npm uninstall -g codegraph`。

### 更新

`npm update -g codegraph`，然后在项目目录重新执行 `codegraph build` 更新索引。
