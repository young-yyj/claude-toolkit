# AI Context Docs — AI 上下文文档生成器

## 这是什么？

`sk-ai-context-docs` 是一个用于生成 `docs/ai-context/` 的 Claude Code Skill。它会从项目真实文件中提取信息，整理成给后续 Claude、agent 或其他 AI 快速读取的上下文文档。

它的目标不是写一份泛泛的架构说明，而是让 AI 能快速回答：

- 这个项目是什么。
- 应该从哪些文件开始读。
- 关键源码、配置、构建文件在哪里。
- 常见修改任务需要关注哪些文件。
- 哪些区域风险较高。
- 修改后应如何验证。

## 触发方式

以下表达适合触发：

- “生成 AI 上下文文档”
- “生成 `docs/ai-context/`”
- “整理项目上下文给 AI 使用”
- “根据项目代码生成 AI 可读的架构文档”
- “为这个项目制作 Claude/agent 上下文索引”
- “把项目结构整理成 AI context”

普通 README、普通架构文档或代码注释请求不应触发，除非明确提到 AI、Claude、agent、上下文读取等目标。

## 输出位置

所有产物固定写入项目根目录：

```text
docs/ai-context/
```

项目规模只影响该目录内生成哪些文件，不改变输出根目录。

## 流程概览

| 阶段 | 做什么 | 产物 |
|---|---|---|
| Phase 1 — 项目扫描 | 读取项目说明、构建文件、入口文件、配置、源码和已有 `docs/ai-context/` | 项目事实清单 |
| Phase 2 — 结构提案 | 判断规模，列出计划生成/更新/跳过的文档及来源 | 文档结构提案 |
| Phase 3 — 用户确认 | 等用户确认结构后再写入 | 确认结果 |
| Phase 4 — 文档生成 | 按顺序生成入口、概览、目录地图、构建验证、架构、模块/流程等文档 | `docs/ai-context/` |
| Phase 5 — 质量自检 | 检查路径、命令、模块、流程、风险是否有来源，删除空模板和占位内容 | 自检通过的文档 |
| Phase 6 — 输出总结 | 列出生成文件、信息来源、跳过项和限制 | 完成报告 |

## 可能生成的结构

### 小型项目

```text
docs/ai-context/
  README.md
  00-quick-start.md
  directory-map.md
```

### 中型项目

```text
docs/ai-context/
  README.md
  00-quick-start.md
  project-overview.md
  architecture.md
  directory-map.md
  build-run-test.md
  risk-areas.md
```

### 大型项目

```text
docs/ai-context/
  README.md
  00-quick-start.md
  project-overview.md
  architecture.md
  directory-map.md
  build-run-test.md
  risk-areas.md
  glossary.md
  modules/
    README.md
  flows/
    README.md
  decisions/
    README.md
  checklists/
    before-editing.md
```

只有项目中存在可确认来源时，才会生成对应文件或目录。

## 核心约束

- 所有事实必须来自项目文件或用户明确确认。
- 项目中没有的信息不写。
- 不编造路径、命令、模块、依赖、业务背景或外部系统。
- 不生成空模板、`TODO`、`TBD` 或占位段落。
- 默认中文输出；代码、路径、命令、类名、函数名、配置键保持原文。
- 写入前先给结构提案，确认后再生成。

## 参考资源

- `references/document-rules.md`：文档结构、内容规范、确认点、质量门禁与失败处理规则。
