# Git 提交守护

用户表达 git 提交意图时自动触发。对本次待提交文件进行敏感信息扫描和文档同步检查，全部无误后询问用户确认并执行提交。

## 触发方式

在 Claude Code 对话中表达 commit 意图即可自动触发，包括但不限于：

- `提交`
- `commit`
- `git commit`
- `提交代码`
- `帮我提交`
- `提交一下`

也可以说"准备提交了"、"该 commit 了"等自然语言。

## 工作流程

1. **获取变更** — 列出暂存区和工作区的全部变更文件
2. **提交前检查** — 提醒避免 `Co-Authored-By` 尾缀；对变更文件扫描敏感信息（API Key、密码、令牌等），命中逐项处理
3. **文档同步** — 根据变更类型映射判断 CLAUDE.md / README.md / docs/ai-context/ 是否需要更新，用户确认后执行
4. **确认提交** — 展示检查汇总，询问是否执行 `git commit`

## 处理的文档

| 文件 | 性质 | 受众 |
|------|------|------|
| `CLAUDE.md` | AI 入口指令 + 技术速查 | AI Agent |
| `README.md` | 功能说明 + 使用指南 | 人类用户 |
| `README_CN.md` | 中文使用说明 | 人类用户 |
| `docs/ai-context/architecture.md` | 架构设计 + 数据流 | AI Agent |
| `docs/ai-context/files.md` | 源文件清单 + 职责 | AI Agent |
| `docs/ai-context/conventions.md` | 编码规范 + 约定 | AI Agent |

不存在的文档会自动跳过。

## 与其他 Skill 的区别

| 场景 | 使用 |
|------|------|
| 提交前自动检查 + 提交 | `sk-pre-commit-doc-sync`（本 skill） |
| 全量审查（会话结束） | `neat-freak` |
| 项目结构规范化 | `sk-project-structure` |

## 注意事项

- 敏感信息扫描仅针对本次变更文件，不扫全项目
- 所有文档修改都在你确认后才执行
- git hooks 不会被跳过
- 最终 commit 执行前会再次确认
- 不会执行 `git push`
