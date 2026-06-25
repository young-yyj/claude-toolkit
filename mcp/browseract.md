# BrowserAct Skills

## 一、基本信息

> **一句话定位**：在需要突破反爬封锁、自动过验证码、多账号并行操作、人工远程接管时，这是最优解。它比 Playwright MCP 或 AI 工具内置的浏览器操作强在特有的三层反检测机制和 Agent 原生交互设计。

| 项目 | 详情 |
|------|------|
| **名称** | BrowserAct Skills |
| **类型** | 浏览器自动化（AI Agent 专用，反检测方向） |
| **协议** | Skill（基于 CLI + Skills 架构） |
| **命令** | `browser-act` CLI |
| **包管理** | Python |
| **维护者** | BrowserAct Team |
| **许可证** | MIT |
| **GitHub Stars** | 3k+ |

### 相关地址

| 地址 | 链接 |
|------|------|
| GitHub | https://github.com/browser-act/skills |
| 官网 | https://www.browseract.com |
| 官方文档 | https://docs.browseract.com |
| Discord | https://discord.com/invite/UpnCKd7GaU |

## 二、功能介绍

- **反检测突破（核心能力）**：三层递进式反封锁机制——环境层（指纹伪装、TLS 轮换、代理切换）、执行层（自动解验证码、受保护页面一键提取）、人工层（生成远程链接，用户接管后 Agent 无缝继续）
- **三种浏览器模式**：`chrome`（复用本地登录态）、`stealth` 隐私模式（每次新指纹+代理轮换，零残留）、`stealth` 固定身份模式（稳定指纹+IP，多账号并行不被标记）
- **零干扰并发**：跨浏览器并行（独立 cookie/指纹/代理）、同浏览器多会话（共享登录态+独立执行）、隐私模式（每次新指纹，用完即弃）
- **为 Agent 推理设计**：紧凑文本输出（比 JSON/HTML 节省数倍 token）、索引式交互（`click 3` 直接操作，无需 DOM 解析）、语义记忆（每个浏览器带 `desc` 描述）
- **跨平台远程接管**：生成实时 URL，任何设备打开即可接管，Agent 无缝继续
- **Skill Forge**：自动生成网站爬取 Skill，探索一次网站即可生成可复用的部署包
- **安全确认机制**：敏感操作（创建/删除浏览器、导入配置、代理变更）需用户明确批准

## 三、适用场景

| 场景 | 示例 |
|------|------|
| 受保护页面抓取 | "提取这个有反爬的页面内容" |
| 多账号并行操作 | "同时登录 3 个账号分别执行任务" |
| 验证码处理 | "自动过验证码后继续操作" |
| 人工接管协作 | "我卡住了，生成链接让我来操作" |
| 批量数据采集 | "用 Skill Forge 从 LinkedIn 批量抓职位" |
| 隐私浏览 | "用临时指纹访问，不留痕迹" |
| 复用登录态 | "用我已登录的 Chrome 继续操作" |

## 四、优势与劣势

### 同类对比

| 对比维度 | BrowserAct | Playwright MCP | Claude Code 内置 | Puppeteer MCP |
|---------|-----------|---------------|-----------------|---------------|
| 反检测能力 | ✅ 三层反封锁 | ❌ 无 | ❌ 无 | ❌ 无 |
| 验证码处理 | ✅ 自动解 | ❌ | ❌ | ❌ |
| 人工接管 | ✅ 跨平台远程 | ❌ | ❌ | ❌ |
| 多账号并行 | ✅ 隔离浏览器 | ❌ 单实例 | ❌ | ❌ |
| 复用登录态 | ✅ Chrome profile | ✅ user-data-dir | ❌ | ✅ |
| 为 Agent 设计 | ✅ 索引交互+语义记忆 | ❌ 传统 API | ❌ | ❌ |
| 费用/License | MIT，基础免费 | Apache-2.0 免费 | 内置（免费） | Apache-2.0 免费 |

> **内置 vs 外挂**：Claude Code 和 Playwright MCP 能完成基础的浏览器操作，但面对反爬检测、验证码、多账号隔离、人工接管等场景时无能为力。BrowserAct 的核心价值在于**让 Agent 能到达标准工具到不了的地方**。

#### 选型结论

| 情况 | 推荐 |
|------|------|
| 只需基础页面访问和截图 | AI 工具内置或 Playwright MCP 足够 |
| 需要反爬突破、验证码、多账号并行、人工接管 | **选用 BrowserAct**，这是该场景下的唯一选择 |
| 需要跨浏览器兼容性测试（多引擎） | 选用 Playwright MCP |

### 优势

- **反检测突破**：三层递进机制，能绕过绝大多数反爬封锁
- **Agent 原生设计**：索引式交互、语义记忆、紧凑输出，专为 LLM 推理优化
- **零干扰并发**：多浏览器完全隔离，站点无法关联
- **人工接管**：生成远程链接，跨平台无缝切换
- **Skill Forge**：一次探索生成可复用爬取 Skill，无需手写代码
- **基础功能免费**：浏览器自动化、Chrome 模式、前 5 个隐身浏览器均免费

### 劣势

- 需要注册账号才能使用隐身浏览器和高级功能
- 代理和超过 5 个隐身浏览器需付费
- 不是 MCP 协议，部分 AI 工具需要通过 CLI 调用
- Python 环境依赖
- 相比 Playwright MCP 社区生态较新

## 五、部署配置

### 运行环境要求

| 要求 | 详情 |
|------|------|
| 操作系统 | Windows / macOS / Linux |
| 运行环境 | Python 3.8+ |
| 权限要求 | 无需特殊权限 |
| 架构要求 | 无限制 |

### 安装清单

| 组件 | 类型 | 安装方式 | 下载地址 | 大小 |
|------|------|---------|---------|------|
| Python 3.8+ | 运行环境 | 官网下载安装 | https://python.org | 约 50MB |
| browser-act | CLI 工具 | 通过 AI Agent Skill 系统安装 | https://github.com/browser-act/skills/tree/main/browser-act | - |
| browser-act-skill-forge | Skill（可选） | 通过 AI Agent Skill 系统安装 | https://github.com/browser-act/skills/tree/main/browser-act-skill-forge | - |

### 各平台配置

BrowserAct 使用 Skill 系统而非 MCP，安装方式为告诉 AI Agent 执行安装命令。

#### Claude Code

在对话中告诉 Claude：

```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act . Verify it works after installation.
```

或使用 CLI：

```bash
claude skill add browser-act https://github.com/browser-act/skills/tree/main/browser-act
```

验证：`browser-act get-skills core --skill-version 2.0.2` 返回正常。

#### OpenCode

在对话中告诉 OpenCode：

```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act . Verify it works after installation.
```

验证：在对话中调用 `browser-act` 命令，确认可正常执行。

#### Codex

```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act . Verify it works after installation.
```

验证：在对话中尝试调用该工具的某个命令。

#### Cursor / Windsurf

```
Install browser-act. Skill source: https://github.com/browser-act/skills/tree/main/browser-act . Verify it works after installation.
```

验证：在对话中尝试调用该工具的某个命令。

### 卸载

根据工具文档执行卸载命令，或删除对应 Skill 配置。

### 更新

重新执行安装命令，覆盖旧版本。
