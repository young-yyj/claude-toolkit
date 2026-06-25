# Playwright MCP

## 一、基本信息

> **一句话定位**：在需要完整的浏览器自动化能力（网络拦截、多标签、JS 执行、跨浏览器测试）时，这是最优解。它比 AI 工具内置的网页操作强在支持持久登录态、无障碍树驱动、50+ 配置参数。

| 项目 | 详情 |
|------|------|
| **名称** | Playwright MCP |
| **类型** | 浏览器自动化 |
| **协议** | MCP |
| **命令** | `npx @playwright/mcp@latest` |
| **包管理** | npm（`@playwright/mcp`） |
| **维护者** | Microsoft |
| **许可证** | Apache-2.0 |
| **GitHub Stars** | 34.3k+ |

### 相关地址

| 地址 | 链接 |
|------|------|
| GitHub | https://github.com/microsoft/playwright-mcp |
| npm | https://www.npmjs.com/package/@playwright/mcp |
| Playwright 官网 | https://playwright.dev |
| MCP 协议 | https://spec.modelcontextprotocol.io |

## 二、功能介绍

- **基于无障碍树的页面交互（核心特色）**：使用 accessibility snapshot 理解页面结构，而非截图或像素识别。LLM 无需视觉模型，纯结构化数据操作，确定性强，无歧义
- **页面导航**：打开 URL、前进/后退、等待加载
- **元素交互**：点击、填写表单、选择下拉框、拖拽、悬停
- **内容提取**：获取页面快照、截图、DOM 内容
- **网络监控**：捕获网络请求和响应详情
- **多标签管理**：创建、切换、关闭标签页
- **JavaScript 执行**：在页面上下文中执行 JS 代码
- **文件操作**：上传文件、下载文件
- **对话框处理**：处理 alert、confirm、prompt
- **持久用户配置**：支持持久化浏览器 profile，保留登录态

> 官方说明："Fast and lightweight. Uses Playwright's accessibility tree, not pixel-based input. LLM-friendly. No vision models needed, operates purely on structured data. Deterministic tool application. Avoids ambiguity common with screenshot-based approaches."

## 三、适用场景

| 场景 | 示例 |
|------|------|
| 网页测试 | "打开 localhost:3000，检查登录按钮是否可点击" |
| 数据抓取 | "提取这个页面上所有商品的标题和价格" |
| 截图生成 | "对这个页面截图并保存" |
| 表单自动填写 | "在搜索框输入 'hello' 并点击搜索" |
| 网络请求监控 | "监听这个页面的所有 API 请求" |
| UI 回归测试 | "对比这两个页面的视觉差异" |
| 持久登录态 | "用已登录的浏览器 profile 操作" |

## 四、优势与劣势

### 同类对比

| 对比维度 | Playwright MCP | Claude Code 内置（Snapshot） | Codex 内置 | Puppeteer MCP |
|---------|---------------|-----------------------------|------------|---------------|
| 页面理解方式 | accessibility tree（结构化） | 基础 snapshot | 基础 snapshot | 截图/pixel |
| 浏览器支持 | Chromium/FF/WebKit | Chromium | Chromium | 仅 Chromium |
| 网络拦截 | ✅ | ❌ | ❌ | ✅ |
| 多标签管理 | ✅ | ❌ | ❌ | ✅ |
| JS 执行 | ✅ | ❌ | ❌ | ✅ |
| 持久登录态 | ✅ user-data-dir | ❌ | ❌ | ❌ |
| 费用/License | Apache-2.0 免费 | 内置（免费） | 内置（免费） | Apache-2.0 免费 |

> **内置 vs 外挂**：Claude Code 和 Codex 自带的网页操作工具能完成基础的页面访问和快照，但不支持网络拦截、多标签、JS 执行、持久登录态等高级功能。需要完整浏览器自动化时才需要 Playwright MCP。

#### 选型结论

| 情况 | 推荐 |
|------|------|
| 只是简单页面访问和截图 | AI 工具内置功能足够，无需额外安装 |
| 需要完整浏览器自动化（网络拦截、多标签、JS、持久登录） | **选用 Playwright MCP**，这是该场景下的最优解 |
| 需要反爬检测、验证码处理、人工接管 | 选用 BrowserAct（专为反封锁场景设计） |

### 优势

- **无障碍树驱动**：无需视觉模型，纯结构化数据，LLM 友好，确定性强
- **Microsoft 官方维护**：质量有保障，34k+ Star
- **跨浏览器**：支持 Chromium、Firefox、WebKit
- **配置丰富**：50+ 配置参数，支持代理、视口、设备模拟等
- **支持持久 profile**：保留登录态和浏览器数据
- **Docker 支持**：提供官方 Docker 镜像

### 劣势

- 首次启动需下载浏览器二进制文件（约 200MB）
- 需要 Node.js 18+
- 无头模式下难以调试
- 浏览器实例占用内存较多

## 五、部署配置

### 运行环境要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows / macOS / Linux |
| 运行环境 | Node.js 18+ |
| 权限要求 | Docker 模式下需 Docker 运行环境 |
| 架构要求 | x64（ARM 需确认 Chromium 兼容性） |

### 安装清单

| 组件 | 类型 | 安装方式 | 下载地址 | 大小 |
|------|------|---------|---------|------|
| Node.js 18+ | 运行环境 | 官网下载安装 | https://nodejs.org | 约 30MB |
| @playwright/mcp | npm 包 | npx 自动安装 | https://www.npmjs.com/package/@playwright/mcp | 约 1MB |
| Playwright 浏览器 | 二进制文件 | 首次运行自动下载 | https://playwright.dev/docs/browsers | 约 200MB |

### 各平台配置

#### Claude Code

```json
{
  "mcpServers": {
    "playwright": {
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

验证：`claude mcp list` 检查 playwright 是否在列表中。

#### OpenCode

```json
{
  "mcp": {
    "playwright": {
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true,
      "type": "local"
    }
  }
}
```

验证：重启 OpenCode 后，在对话中询问 "有哪些可用的 MCP tools" 检查是否出现 Playwright 相关工具。

#### Codex

```json
{
  "mcpServers": {
    "playwright": {
      "command": ["npx", "@playwright/mcp@latest"],
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
    "playwright": {
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

验证：在 Cursor/Windsurf 的设置中打开 MCP 页面，检查状态是否为绿色 "Connected"。

### 卸载

删除对应 MCP 配置块即可。如需清除浏览器缓存数据，手动删除 `%USERPROFILE%\AppData\Local\ms-playwright\mcp-*`（Windows）或 `~/Library/Caches/ms-playwright/mcp-*`（macOS）。

### 更新

将 `@latest` 保留即可，npx 会自动使用最新版本。
