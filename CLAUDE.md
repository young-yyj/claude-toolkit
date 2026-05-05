# CLAUDE.md

本项目是 claude-toolkit — Claude Code 自定义扩展集，当前包含 4 个 skills、1 个 command，后续将扩展 hooks 等配置。

## 项目性质

这是一个**静态扩展仓库**，不是可运行软件项目。内容可复制到任意项目的 `.claude/` 对应子目录下使用：
- skills → `.claude/skills/`
- commands → `.claude/commands/`
- hooks 配置 → `.claude/settings.json`

## 目录规范

```
claude-toolkit/
├── skills/
│   └── y-<skill-name>/      # 每个 skill 一个目录，前缀 y-
│       ├── SKILL.md          # 技能定义（frontmatter + 执行流程）
│       ├── README_CN.md      # 中文使用说明
│       └── references/       # 参考资源（模板、规则等）
├── commands/                 # 自定义 Slash 命令
├── hooks/                    # （待扩展）hooks 配置片段
└── settings/                 # （待扩展）settings.json 配置片段
```

## 技能清单

| 技能 | 类型 | 触发词 |
|------|------|--------|
| `y-github-audit` | 仪表盘审计 | `YY本地项目初次提交github` |
| `y-github-launch` | 线性向导 | `本地项目初次提交github` |
| `y-project-structure` | 结构规范器 | `整理项目结构` 等 |
| `y-tutorial-builder` | 教程生成器 | `生成教程` 等 |

## 命令清单

| 命令 | 用途 |
|------|------|
| `y_save_summary` | 以知识优先方式总结对话并保存为结构化 Markdown，自动维护索引 |

## 文档约定

- 所有面向用户的说明文档使用中文
- `SKILL.md` 为技能执行定义（中文），`README_CN.md` 为用户向使用说明
- 项目根 `README.md` 为总览

## 开发注意事项

- 新建 skill 遵循 `y-<name>/SKILL.md` + `README_CN.md` + `references/` 结构
- SKILL.md 必须包含 frontmatter（name、description、allowed-tools 等）
- 触发词设计避免冲突：audit 用 `YY` 前缀，launch 无前缀
- 新建 command 命名为 `y_<name>.md`（与 skill 目录前缀 `y-` 对应，统一个人扩展标识）
- commands/hooks/settings 扩展内容放入对应顶层目录
