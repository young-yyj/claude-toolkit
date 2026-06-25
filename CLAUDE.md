# CLAUDE.md

本项目是 claude-toolkit — Claude Code 自定义扩展集，当前包含 9 个 skills、2 个 command、1 个 git hook 模板、1 个 mcp 工具文档集。

## 项目性质

这是一个**静态扩展仓库**，不是可运行软件项目。内容可按类别分发到不同位置：
- skills → `.claude/skills/`
- commands → `.claude/commands/`
- hooks → 复制到任意项目的 `.git/hooks/` 或通过 `hooks/setup.sh` 全局安装
- settings 配置 → `.claude/settings.json`
- agent-instructions → 用户级 AI 协作规范，按平台放入对应配置目录（Claude Code `~/.claude/CLAUDE.md`、Codex `~/.codex/AGENTS.md`、OpenCode `~/.config/opencode/AGENTS.md`）

## 目录规范

```
claude-toolkit/
├── skills/
│   └── sk-<skill-name>/      # 每个 skill 一个目录，前缀 sk-
│       ├── SKILL.md          # 技能定义（frontmatter + 执行流程）
│       ├── README_CN.md      # 中文使用说明
│       ├── references/       # 参考资源（模板、规则等，按需）
│       └── scripts/          # bundled 辅助脚本（按需）
├── commands/                 # 自定义 Slash 命令
├── hooks/                    # git hooks 模板（可分发）
├── mcp/                      # MCP/Skill 工具介绍与配置文档
├── settings/                 # （待扩展）settings.json 配置片段
└── agent-instructions/       # 用户级 AI 协作规范（按平台分发）
    ├── claude-code/          # Claude Code 版
    ├── codex/                # Codex (CLI / Desktop) 版
    └── opencode/             # OpenCode 版
```

## 技能清单

| 技能 | 类型 | 触发词 |
|------|------|--------|
| `sk-git-history-clean` | git 历史重写 | "整理 git 历史"、"去除提交尾缀" 等 |
| `sk-github-audit` | 仪表盘审计 | `YY本地项目初次提交github` |
| `sk-github-launch` | 线性向导 | `本地项目初次提交github` |
| `sk-project-structure` | 结构规范器 | `整理项目结构` 等 |
| `sk-ai-context-docs` | AI 上下文文档生成器 | `生成 AI 上下文文档`、`docs/ai-context`、`AI context` 等 |
| `sk-tutorial-builder` | 教程生成器 | `生成教程` 等 |
| `sk-ts-translate` | Qt TS 翻译 | `TS 文件翻译`、`Qt Linguist`、`unfinished 翻译` 等 |
| `sk-prd-writer` | PRD 生成器 | `写PRD`、`产品需求文档` 等 |
| `sk-commit-guard` | 提交守护 | `准备提交` |

## 命令清单

| 命令 | 用途 |
|------|------|
| `cmd-save-summary` | 以知识优先方式总结对话并保存为结构化 Markdown，自动维护索引 |
| `cmd-audit-files` | 将上一轮对话中的文件操作记录整理为表格展示 |

## 文档约定

- 所有面向用户的说明文档使用中文
- `SKILL.md` 为技能执行定义（中文），`README_CN.md` 为用户向使用说明
- 项目根 `README.md` 为总览

## 开发注意事项

- 新建 skill 遵循 `sk-<name>/SKILL.md` + `README_CN.md` + `references/` 结构
- SKILL.md 必须包含 frontmatter（name、description、allowed-tools 等）
- 触发词设计避免冲突：audit 用 `YY` 前缀，launch 无前缀
- 新建 command 命名为 `cmd-<name>.md`（与 skill 目录前缀 `sk-` 对应，统一个人扩展标识）
- commands/hooks/settings 扩展内容放入对应顶层目录
