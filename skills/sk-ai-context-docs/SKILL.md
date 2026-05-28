---
name: sk-ai-context-docs
description: |
  当用户要求生成、整理或更新 AI 上下文文档时使用，固定输出到 `docs/ai-context/`，帮助后续 Claude、agent 或 AI 快速理解项目。用户提到为 Claude/agent 准备项目阅读入口、AI 项目索引、项目知识地图、上下文索引、项目快速理解资料时也应使用。
  触发词：生成 AI 上下文文档、生成 docs/ai-context、整理项目上下文给 AI 使用、AI context、Claude 上下文、Claude 快速理解项目、agent 上下文索引、agent 项目阅读入口、AI 项目索引、项目知识地图、根据项目代码生成 AI 可读架构文档。
  不要因普通 README、普通架构说明或代码注释请求触发，除非用户明确提到 AI/Claude/agent/上下文读取目标。
effort: high
context: fork
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

# AI Context Docs Generator

基于项目内真实来源生成 `docs/ai-context/` 上下文文档，帮助后续 AI 快速理解项目、定位文件、评估风险并执行验证。

## 核心原则

- 所有正文事实必须来自项目文件或用户在当前任务中明确确认的信息。
- 项目中没有来源的信息不写，不用模型常识、行业经验或猜测补全。
- 不生成空模板、`TODO`、`TBD`、占位段落或泛泛清单。
- 默认使用中文；代码、路径、命令、类名、函数名、配置键和固定术语保持原文。
- 输出根目录始终是项目根目录下的 `docs/ai-context/`。
- 不移动目录、不重构源码、不替代 `CLAUDE.md`、`README.md` 或人类架构文档。

## 开始前

先读取 `references/document-rules.md`，再执行本流程。该引用文件定义规模判定、文档结构、各文档内容规范、确认点与质量门禁。

## 工作流程

### Phase 1：项目扫描

按优先级读取当前项目中实际存在的信息：

1. 已有 AI 指南：`CLAUDE.md`、`AGENTS.md`、现有 `docs/ai-context/`。
2. 项目入口文档：`README.md`、中文说明、架构说明。
3. 构建与工程文件：如 `.pro`、`.sln`、`.csproj`、`package.json`、`CMakeLists.txt`、`Makefile`。
4. 启动入口：如 `main.*`、`App.*`、服务入口文件。
5. 配置与资源清单：如 `.qrc`、`.env.example`、配置目录、平台配置文件。
6. 主要源码目录、测试目录、脚本目录、CI/CD 工作流。

如果已存在 `docs/ai-context/`，必须先读取既有文档，再结合当前项目实际状态决定保留、改写、合并、拆分或跳过。

扫描后形成事实清单：项目名称、主要语言、框架/运行时、构建系统、主源码目录、启动入口、配置入口、资源入口、测试/验证入口、多模块/多服务/多平台特征。无法追溯到项目文件的项不写入正文。

### Phase 2：规模判定与结构提案

根据 `references/document-rules.md` 判定小型/中型/大型，并提出 `docs/ai-context/` 内计划生成或优化的文档结构。

写文件前必须向用户展示结构提案，至少包含：

| 文档 | 操作 | 项目来源 | 原因 |
|---|---|---|---|
| `README.md` | 生成/更新/跳过 | `README.md`、`CLAUDE.md` | 入口索引 |

若存在既有 `docs/ai-context/`，结构提案还要说明每个既有文档的处理方式：保留、改写、合并、拆分或跳过，以及对应原因。

### Phase 3：用户确认

等待用户确认结构提案后再写入文件。若用户明确要求跳过确认，可以继续执行，但仍必须遵守项目来源约束和禁止编造规则。

需要确认的问题必须具体，例如：

- “项目中发现两个构建入口 `A` 和 `B`，`build-run-test.md` 应记录哪个作为主入口？”
- “源码与 README 对启动入口描述冲突，是否以当前源码入口 `main.ts` 为准？”

不要泛泛询问“是否继续”。

### Phase 4：生成或更新文档

按以下顺序写入被确认且有来源支撑的文档：

1. `docs/ai-context/README.md`
2. `00-quick-start.md`
3. `project-overview.md`
4. `directory-map.md`
5. `build-run-test.md`
6. `architecture.md`
7. `modules/*.md`
8. `flows/*.md`
9. `risk-areas.md`
10. `glossary.md`
11. `checklists/*.md`

先生成入口和地图，再生成模块和流程。每个文档顶部列出“信息来源”，正文中的路径、命令、模块职责和流程必须能追溯到这些来源。

### Phase 5：质量自检

写入后逐项执行 `references/document-rules.md` 的质量门禁，重点检查：

- 路径是否真实存在，或是本次刚创建的文档路径。
- 命令是否来自项目文件、项目文档或用户确认。
- 模块职责、流程和风险是否可追溯。
- 既有 `docs/ai-context/` 是否已核对当前项目实际状态。
- 是否存在空模板、占位符、`TODO`、`TBD` 或泛泛内容。
- 文档之间的引用是否一致，默认语言是否为中文。

发现不满足门禁的内容，直接删除或改写为有来源支撑的表达；不要用“待补充”保留。

### Phase 6：输出总结

最终总结必须包含：

```md
## 完成情况

- 已生成/修改：
  - `docs/ai-context/...`

## 信息来源

- `CLAUDE.md`
- `README.md`

## 跳过项

- `decisions/`：项目中未发现架构决策记录来源。

## 限制

- 未写入项目中无法确认的信息。
- 未编造运行命令、外部系统或业务背景。
```

如果信息不足，只生成最小且有来源支撑的文档集合，并在总结中说明跳过原因。
