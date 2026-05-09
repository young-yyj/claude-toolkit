# claude-toolkit — Claude Code 自定义扩展集

为 Claude Code 定制的 5 个技能与 2 个命令，覆盖 GitHub 发布、项目结构规范化、AI 教程生成、对话总结、文件审计、git 历史重写六大场景。

---

## 技能一览

| 技能 | 类型 | 触发方式 | 核心能力 |
|------|------|----------|----------|
| `sk-git-history-clean` | git 历史重写 | "整理 git 历史" / "去除提交尾缀" 等 | 重写全部 commit：去 Co-Authored-By / 统一作者 / 恢复标签，六步安全执行 |
| `sk-github-audit` | 仪表盘 | `YY本地项目初次提交github` | 13 项并行安全 + 工程扫描，分级报告，勾选批量修复 |
| `sk-github-launch` | 线性向导 | `本地项目初次提交github` | 7 步顺序引导：扫描 → 检查 → 审查 → 推送 → Release |
| `sk-project-structure` | 规范器 | `整理项目结构` / `标准化项目` 等 | 三阶流程：评估规模 → 差异分析 → 逐项确认执行 |
| `sk-tutorial-builder` | 生成器 | `生成教程` / `写一份 XX 教程` 等 | 多源并行搜集 → 交叉验证 → 生成 ≥20000 字教科书级教程 |

---

## 各技能详情

### sk-git-history-clean — git 历史清理

**触发词：** "整理 git 历史"、"去除提交尾缀"、"统一 git 作者" 等

**流程：**

| 步骤 | 内容 |
|------|------|
| 1. 审计 | 扫描全部 commit 尾缀行、记录 commit 总数、列出所有作者名及标签类型 |
| 2. 重写 | `git filter-branch` 清理 message（可选统一作者名），用户可选择目标名或"不做更改" |
| 3. 验证分支 | 校验 commit 数量不变、尾缀已清除、作者名与预期一致 |
| 4. 恢复标签 | 轻量标签直接迁移；附注标签从悬空对象抢救 tagger 信息 + annotation 内容并重建 |
| 5. 终验 | 标签指向、tagger 信息、annotation 内容、commit 作者全部核对 |
| 6. 记忆 | 保存 feedback memory 防止再次添加已清理的尾缀 |

**红线约束：** 禁止增删改任何 commit 中的项目文件；禁止增删 commit 记录；禁止修改时间信息。

**适用场景：** 需要批量清理 git 历史元数据、统一作者身份的项目维护者。

### sk-github-audit — 全维度审计

**触发词：** `YY本地项目初次提交github`

**流程：**

1. **并行扫描 13 项** — 安全（API Key、云凭证、.env 跟踪、私钥、邮箱暴露）×5 + 工程（.gitignore、技术栈、README 质量、分支、远程）×6 + 发布（版本号、可发布性）×2
2. **仪表盘汇总** — 🔴 严重 / 🟡 建议 / 🟢 正常 / 🎯 发布建议，四级分类展示
3. **交互式处理** — 用户勾选问题编号，按优先级批量修复
4. **执行汇报** — 逐项汇报结果，给出 Release 和 push 命令

**适用场景：** 只想诊断、自己挑选修复项的效率型用户；不一定要立刻 push。

### sk-github-launch — 首次上线向导

**触发词：** `本地项目初次提交github`

**流程：**

| 步骤 | 内容 |
|------|------|
| Step 1 | 获取并验证 GitHub 远程仓库地址 |
| Step 2 | 敏感信息扫描（密钥、私钥、.env、邮箱） |
| Step 3 | .gitignore 存在性与覆盖完整性检查 |
| Step 4 | README 质量审查，必要时自动生成双语 README |
| Step 5 | 汇总变更清单，等待用户确认 |
| Step 6 | 配置远程仓库，提供 push 命令 |
| Step 7 | 检测版本号，评估 Release 可行性 |

**适用场景：** 第一次推项目的用户，需要每步确认、按部就班的谨慎型体验。

### sk-github-audit vs sk-github-launch

| | launch | audit |
|------|--------|-------|
| 模式 | 线性向导，7 步顺序执行 | 一次性并行扫描，仪表盘汇总 |
| 体验 | 导游模式，每步一个决策点 | 体检报告模式，勾选后批量修复 |
| 范围 | 含远程配置 + push + Release | 纯本地诊断 + 修复，不配远程 |

### sk-project-structure — 项目结构标准化

**触发词：** `整理项目结构`、`规范化目录`、`标准化项目`、`项目结构优化`、`搭建 Claude 项目`、`setup project structure`、`organize project`

**流程：**

1. **项目评估** — 统计源文件、测试文件、工程文件，判定项目规模（小/中/大）
2. **差异分析** — 对照 Claude Code 标准结构，输出已有/需迁移/缺失/按需创建四类报告；对每条迁移建议扫描所有路径引用
3. **执行** — 基础必备项逐项确认创建；按需创建项仅当触发条件满足时创建；迁移在隔离副本中完成并验证后写回

**标准结构要素：** `CLAUDE.md`、`.claude/settings.json`、`.gitignore`、`.env.example`、`src/`、`docs/ai-context/` 等。

### sk-tutorial-builder — AI 教程生成器

**触发词：** `生成教程`、`写教程`、`从入门到精通`、`完整教程`、`详细教程`、`学习 XX`、`generate tutorial`、`write guide`

**流程：**

1. 分析知识点：确定类型（算法/框架/概念/MLOps）、受众层次、提取中英文搜索关键词
2. 并行多源搜集：官方文档 + 学术论文、中文技术博客、微信公众号（`site:mp.weixin.qq.com`）
3. 内容整合：多源交叉验证，按 S/A/B/C 四级可信度评级筛选，去重
4. 选择大纲模板：根据知识点类型微调通用模板
5. 顺序生成教程：基础篇 → 进阶篇 → 高级篇，含可运行代码示例
6. 输出前自检：`wc -m` 验证字数 ≥ 20000，检查占位符、来源标注、日期
7. 保存为 `{知识点}_从入门到精通.md`

**质量底线：** 至少 8 个有效来源（S/A 级 ≥ 3）、每个核心概念配可运行代码、专业术语标注英文原文、所有引用注明来源 URL。

---

## 命令

### cmd-save-summary — 对话总结保存

以知识优先的方式总结当前对话，保存为结构化 Markdown 文件并自动维护索引。输出包含：决策与结论、知识点、产物清单、待办事项。

使用方式：在 Claude Code 中输入 `/cmd-save-summary`。

### cmd-audit-files — 文件操作审计

扫描上一轮对话中的文件操作记录，按创建/修改/删除/移动分类整理为表格输出，附带统计汇总。

使用方式：在 Claude Code 中输入 `/cmd-audit-files`。

---

## 目录结构

```
claude-toolkit/
├── README.md                          # 本文件
├── CLAUDE.md                          # 项目指南（给 AI 看）
├── .gitignore                         # Git 忽略规则
├── commands/                          # 自定义 Slash 命令
│   ├── cmd-audit-files.md               # 上一轮文件操作审计
│   └── cmd-save-summary.md              # 会话总结保存
└── skills/                            # 自定义技能集
    ├── sk-git-history-clean/            # git 历史清理技能
    │   ├── SKILL.md                   # 技能定义
    │   └── README_CN.md               # 中文使用说明
    ├── sk-github-audit/                # 全维度审计技能
    │   ├── SKILL.md                   # 技能定义（流程、约束、触发条件）
    │   ├── README_CN.md               # 中文使用说明
    │   └── references/
    │       └── scan-rules.md          # 扫描规则详情
    ├── sk-github-launch/               # 首次上线向导技能
    │   ├── SKILL.md                   # 技能定义
    │   ├── README_CN.md               # 中文使用说明
    │   └── references/
    │       ├── gitignore-templates.md # 各技术栈 .gitignore 模板
    │       └── readme-template.md     # 双语 README 模板
    ├── sk-project-structure/           # 项目结构标准化技能
    │   ├── SKILL.md                   # 技能定义
    │   ├── README_CN.md               # 中文使用说明
    │   └── references/
    │       └── standard-structure.md  # Claude Code 标准目录结构规范
    └── sk-tutorial-builder/            # AI 教程生成技能
        ├── SKILL.md                   # 技能定义
        ├── README_CN.md               # 中文使用说明
        └── references/
            ├── outlines.md            # 四种知识点类型大纲模板
            └── quality_guide.md       # 来源评级、搜索策略、质量检查清单
```

---

## 使用方式

1. 将本仓库克隆到本地，或将所需内容复制到项目的 `.claude/` 对应子目录下
2. skills → `.claude/skills/`，commands → `.claude/commands/`，hooks 配置 → `.claude/settings.json`
3. 在 Claude Code 对话中输入对应触发词即可启动

各技能/命令的详细用法和约束条件见各自 `SKILL.md` 和 `README_CN.md`。

---

## License

[MIT](LICENSE) © 2026 young-yyj
