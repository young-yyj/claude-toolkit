# Git 提交守护

用户说出"准备提交"时触发。通过 `git diff` 获取本次变更，自动同步项目中所有说明文档，确保文档全部最新后自动生成 commit message 并执行本地提交。

## 触发方式

**唯一触发词：`准备提交`**

不再拦截"提交"、"commit"、"git commit"等常规用语。只有用户明确说出"准备提交"时才会执行。

## 工作流程

1. **获取变更** — `git diff` 获取暂存区和工作区的全部变更文件
2. **文档全量同步** — 自动发现项目内所有说明文档（CLAUDE.md、README.md、README_CN.md、AGENTS.md、doc/、ai-context/、skills/*/ 等），根据变更内容自动更新并汇报结果
3. **提交前检查** — 提醒避免 `Co-Authored-By` 尾缀；对变更文件扫描敏感信息（API Key、密码、令牌等）
4. **确认提交** — 展示汇总，根据变更文件自动生成英文 commit message（Conventional Commits 格式），展示给用户确认/修改后执行 `git commit`

## 处理的文档

自动发现项目中存在的所有说明文档：

| 类别 | 路径 | 说明 |
|------|------|------|
| AI 入口指令 | `CLAUDE.md`、`AGENTS.md`、`GEMINI.md`、`CODEBUDDY.md` | 项目根目录 |
| 项目说明 | `README.md`、`README_CN.md` | 项目根目录 |
| 文档目录 | `doc/`、`docs/` 下所有 `*.md` | 递归扫描 |
| AI 上下文 | `ai-context/` 下所有 `*.md` | 递归扫描 |
| 技能文档 | `skills/*/SKILL.md` + `skills/*/README_CN.md` | 每个技能目录 |

不存在的文档会自动跳过。

## 自动生成 commit message

根据变更内容按 Conventional Commits 格式用英文自动生成：

| 前缀 | 适用场景 |
|------|----------|
| `feat:` | 新增文件、新功能、新 skill |
| `fix:` | 修复 bug |
| `refactor:` | 重构、重命名、结构调整 |
| `docs:` | 纯文档变更 |
| `chore:` | 配置、hooks、依赖等杂项 |

根据变更文件综合分析后按 Conventional Commits 格式用英文自动生成。生成后展示给用户，可选择直接使用、修改、或取消提交。**不会添加 `Co-Authored-By` 尾缀行。**

## 与其他 Skill 的区别

| 场景 | 使用 |
|------|------|
| 提交前自动检查 + 文档同步 + 提交 | `sk-commit-guard`（本 skill） |
| 全量审查（会话结束） | `neat-freak` |
| 项目结构规范化 | `sk-project-structure` |

## 注意事项

- 仅当用户明确说"准备提交"时触发，不拦截其他提交用语
- 文档同步为强制性步骤，确保所有文档最新后才进入提交
- 敏感信息扫描仅针对本次变更文件，不扫全项目
- git hooks 不会被跳过
- 最终 commit 执行前会再次确认
- 不会执行 `git push`
