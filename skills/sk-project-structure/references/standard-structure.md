# Claude Code 项目目录结构规范

## 一、概念结构（完整参考）

这是一个成熟 Claude Code 项目的**理想状态**，包含所有可能的配置、工具链和文档层级。

```
project-root/
├── .claude/                      # Claude Code 专用配置（核心）
│   ├── settings.json             # 权限、工具、模型、hooks 配置
│   ├── settings.local.json       # 本地覆盖（.gitignore）
│   ├── commands/                 # 自定义 Slash 命令
│   │   ├── 01-dev.md            # 开发相关命令
│   │   ├── 02-test.md           # 测试相关命令
│   │   └── 03-deploy.md         # 部署相关命令
│   └── skills/                   # 项目技能（Markdown + frontmatter）
│       ├── my-skill.md           # 技能定义文件
│       └── another-skill.md      # 另一个技能
├── .mcp.json                     # MCP 服务器配置（项目级）
├── .github/                      # GitHub 集成
│   ├── workflows/               # CI/CD 工作流
│   │   ├── claude-review.yml    # Claude 自动审查
│   │   ├── test.yml             # 测试工作流
│   │   └── deploy.yml           # 部署工作流
│   └── CODEOWNERS               # 代码所有者
├── config/                       # 应用配置文件
│   ├── development.json         # 开发环境配置
│   ├── production.json          # 生产环境配置
│   └── shared.json              # 共享配置
├── docs/                         # 项目文档
│   ├── ai-context/              # AI 上下文文档（需从 CLAUDE.md 显式引用）
│   │   ├── project-structure.md # 项目结构说明
│   │   ├── coding-standards.md  # 编码规范
│   │   ├── architecture.md      # 架构设计
│   │   └── api-reference.md     # API 参考
│   ├── guides/                  # 使用指南
│   └── troubleshooting.md       # 故障排查
├── src/                          # 基础必备：源代码及项目工程文件
│   ├── components/              # 组件
│   ├── utils/                   # 工具函数
│   └── main.*                   # 入口文件（按语言：main.py / main.go / index.ts / App.xaml.cs / Program.cs ...）
├── tests/                        # 测试代码
│   ├── unit/                    # 单元测试
│   ├── integration/             # 集成测试
│   └── e2e/                     # 端到端测试
├── .env.example                  # 环境变量模板
├── .gitignore                    # Git 忽略规则
├── CLAUDE.md                     # Claude 项目指南
├── README.md                     # 项目说明
├── package.json                  # 项目元数据（示例：pyproject.toml / go.mod / Cargo.toml）
└── LICENSE                       # 许可证
```

---

## 二、实际落地结构（推荐起点）

根据项目规模和复杂度，选择对应的起点结构。

> **两类目录**：以下模板展示的是该规模的完整理想布局。实际应用中，目录分为两类——
> - **基础必备**（`CLAUDE.md`、`.claude/settings.json`、`.gitignore`、`.env.example`、`docs/ai-context/`、`src/`）：即使项目当前没有相关文件也应创建
> - **按需创建**（`tests/`、`config/`、`scripts/`、`.github/workflows/` 等）：仅当项目已有对应类型文件时才创建，不凭空造空目录

### 2.1 小型项目（个人/初创）

**特点**：功能单一，配置简化，快速迭代

```
project-root/
├── .claude/
│   └── settings.json             # 基础必备：权限配置
├── .mcp.json                     # 按需创建：MCP 配置
├── docs/
│   └── ai-context.md             # 基础必备：AI 上下文
├── src/                          # 基础必备：源代码及项目工程文件
├── tests/                        # 按需创建：仅当项目已有测试文件
├── .env.example                  # 基础必备：环境变量模板
├── CLAUDE.md                     # 基础必备：项目指南
├── README.md                     # 项目说明
└── .gitignore                    # 基础必备：版本控制
```

**何时升级**：当项目超过 5 个源文件时。

---

### 2.2 中型项目（团队/产品）

**特点**：多模块，配置分层，规范化流程

```
project-root/
├── .claude/
│   ├── settings.json             # 基础必备：权限、工具、hooks 配置
│   ├── settings.local.json       # 按需创建：本地覆盖
│   ├── commands/                 # 按需创建：自定义 Slash 命令
│   │   └── dev.md
│   └── skills/                   # 按需创建：项目技能
│       └── project-specific.md
├── .mcp.json                     # 按需创建：MCP 配置
├── .github/
│   └── workflows/                # 按需创建：CI/CD 工作流
│       └── test.yml
├── config/                       # 按需创建：应用配置
│   ├── development.json
│   └── production.json
├── docs/
│   ├── ai-context/               # 基础必备：AI 上下文文档
│   │   ├── project-structure.md
│   │   ├── coding-standards.md
│   │   └── architecture.md
│   └── guides/
├── src/                          # 基础必备：源代码及项目工程文件
│   ├── components/
│   ├── utils/
│   └── main.*
├── tests/                        # 按需创建：仅当项目已有测试文件
│   ├── unit/
│   └── integration/
├── .env.example                  # 基础必备：环境变量模板
├── CLAUDE.md                     # 基础必备：项目指南
├── README.md                     # 项目说明
└── .gitignore                    # 基础必备：版本控制
```

**何时升级**：当项目超过 15 个源文件或需要多工作流时。

---

### 2.3 大型项目（企业/复杂系统）

**特点**：完整工具链，多工作流，严格规范

```
project-root/
├── .claude/
│   ├── settings.json             # 基础必备：权限、工具、hooks 配置
│   ├── settings.local.json       # 按需创建：本地覆盖
│   ├── commands/                 # 按需创建：自定义 Slash 命令
│   │   ├── dev.md
│   │   ├── test.md
│   │   └── deploy.md
│   └── skills/                   # 按需创建：项目技能
│       ├── project-specific.md
│       └── shared.md
├── .mcp.json                     # 按需创建：MCP 配置
├── .github/
│   ├── workflows/                # 按需创建：CI/CD 工作流
│   │   ├── test.yml
│   │   ├── deploy.yml
│   │   └── security-scan.yml
│   └── CODEOWNERS                # 按需创建
├── config/                       # 按需创建：应用配置
│   ├── development.json
│   ├── staging.json
│   ├── production.json
│   └── shared.json
├── docs/
│   ├── ai-context/               # 基础必备：AI 上下文文档
│   │   ├── project-structure.md
│   │   ├── coding-standards.md
│   │   ├── architecture.md
│   │   └── api-reference.md
│   ├── guides/
│   ├── troubleshooting.md
│   └── CONTRIBUTING.md
├── src/                          # 基础必备：源代码及项目工程文件
│   ├── components/
│   ├── services/
│   ├── utils/
│   ├── middleware/
│   └── main.*
├── tests/                        # 按需创建：仅当项目已有测试文件
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── scripts/                      # 按需创建：自动化脚本
│   ├── setup.sh
│   ├── build.sh
│   └── deploy.sh
├── .env.example                  # 基础必备：环境变量模板
├── .gitignore                    # 基础必备：版本控制
├── CLAUDE.md                     # 基础必备：项目指南
├── README.md                     # 项目说明
├── CHANGELOG.md                  # 按需创建：版本记录
├── package.json                  # 项目元数据
└── LICENSE                       # 按需创建：许可证
```

---

## 三、关键配置文件说明

| 文件 | 位置 | 用途 | 分类 |
|---|---|---|---|
| `CLAUDE.md` | 项目根 | 项目指南和规范（子目录下可放局部 CLAUDE.md，提供作用域上下文） | 基础必备 |
| `settings.json` | `.claude/` | 权限、工具、模型、hooks 配置 | 基础必备 |
| `.gitignore` | 项目根 | Git 忽略规则 | 基础必备 |
| `.env.example` | 项目根 | 环境变量模板 | 基础必备 |
| `docs/ai-context/` | `docs/` | AI 上下文文档目录（需从 CLAUDE.md 显式引用） | 基础必备 |
| `src/` | 项目根 | 源代码及项目工程文件（含 `.csproj` 等） | 基础必备 |
| `settings.local.json` | `.claude/` | 本地覆盖（不入库，.gitignore 中排除） | 按需创建 |
| `.mcp.json` | 项目根 | MCP 服务器配置（也可在 `settings.json` 的 `mcpServers` 字段配置） | 按需创建 |
| `commands/` | `.claude/` | 自定义 Slash 命令 | 按需创建 |
| `skills/` | `.claude/` | 项目自定义技能 | 按需创建 |
| `.github/workflows/` | `.github/` | CI/CD 工作流 | 按需创建 |
| `config/` | 项目根 | 应用环境配置文件 | 按需创建 |
| `tests/` | 项目根 | 测试代码 | 按需创建 |
| `scripts/` | 项目根 | 自动化脚本 | 按需创建 |
| `CHANGELOG.md` | 项目根 | 版本发布记录 | 按需创建 |
| `LICENSE` | 项目根 | 许可证 | 按需创建 |

---

## 四、.gitignore 推荐规则

```gitignore
# Claude Code 本地配置
.claude/settings.local.json
.mcp.json

# 环境变量
.env
.env.local
.env.*.local

# 依赖和构建
node_modules/
vendor/          # Go
target/          # Rust
.venv/           # Python 虚拟环境
dist/
build/
bin/             # .NET
obj/             # .NET
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 测试覆盖率
coverage/
.nyc_output/      # Node.js (Istanbul)
__pycache__/      # Python
*.pyc
```

---

## 五、快速开始清单

- [ ] 创建 `.claude/` 目录和 `settings.json`
- [ ] 编写 `CLAUDE.md` 项目指南
- [ ] 创建 `docs/ai-context/` 和基础文档
- [ ] 添加 `.env.example`
- [ ] 配置 `.gitignore`
- [ ] 根据项目规模选择对应的目录结构
- [ ] 如需自动化，在 `settings.json` 中配置 hooks，添加 `.github/workflows/`

---

## 六、升级路径

```
小型项目 → 中型项目 → 大型项目
   ↓          ↓          ↓
 2.1        2.2        2.3
```

**升级触发条件**：
- 源文件数 > 5 → 升级到 2.2
- 源文件数 > 15 或需要多工作流 → 升级到 2.3
