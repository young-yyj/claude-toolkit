---
name: sk-pre-commit-doc-sync
description: |
  当用户表达 git 提交意图时自动触发。对本次待提交文件进行敏感信息扫描和文档同步检查，
  全部无误后询问用户确认提交。
  触发：用户说 "提交"、"commit"、"git commit"、"提交代码"、"帮我提交" 等。
effort: medium
context: fork
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Git 提交守护

用户表达 git 提交意图时自动触发。流程：获取变更 → 提交前检查 → 文档同步 → 确认提交。

## 功能说明

拦截每一次 git commit 意图，对即将提交的文件执行敏感信息扫描和项目文档同步检查。全部通过后，询问用户确认并执行 `git add` + `git commit`。

---

## When to Use

- 用户说"提交"、"commit"、"git commit"、"提交代码"、"帮我提交"、"提交一下" 等任何表达 git commit 意图的话

## When NOT to Use

- 用户只是询问 git 概念性问题
- 用户明确要求只做文档同步不提交 → 走单独的文档同步流程

---

## Constraints

**安全红线：**
- 绝不跳过 git hooks（`--no-verify`、`--no-gpg-sign`）
- 敏感信息必须先报告后处理，不得静默跳过

**流程约束：**
- 文档更新计划必须等待用户明确确认后才能执行
- 修改文档前必须先完整读取目标文件
- git commit 执行前必须获得用户最终确认

**内容质量：**
- 新内容格式（缩进、术语、代码块语言标记）必须与现有内容完全一致
- 仅修改技术信息，不覆盖用户手写的描述性文字

---

## 适用范围

本 skill 处理以下文档（按存在性检查，缺失则跳过）：

| 文件 | 性质 | 受众 |
|------|------|------|
| `CLAUDE.md` | AI 入口指令 + 技术速查 | AI Agent |
| `README.md` | 功能说明 + 使用指南 | 人类用户 |
| `README_CN.md` | 中文使用说明 | 人类用户 |
| `docs/ai-context/architecture.md` | 架构设计 + 数据流 | AI Agent |
| `docs/ai-context/files.md` | 源文件清单 + 职责 | AI Agent |
| `docs/ai-context/conventions.md` | 编码规范 + 约定 | AI Agent |

---

## 执行流程

### Step 1: 获取待提交变更

```bash
# 最近一次提交（参考基线）
git log --oneline -1

# 暂存区 + 工作区 + 未跟踪文件 全部变更
git status --porcelain

# 暂存区变更详情
git diff --cached --name-status
git diff --cached --stat

# 未暂存变更详情
git diff --name-status
git diff --stat

# 未跟踪文件列表
git ls-files --others --exclude-standard
```

- 如果以上均无输出，提示"没有待提交的变更"，退出

### 变更文件清单

将 `git status --porcelain` 输出解析为统一的变更文件列表（暂存 + 未暂存 + 未跟踪），后续所有扫描均基于此列表。

汇总呈现变更文件清单及统计。

---

### Step 2: 提交前检查

对本次变更的文件执行以下扫描。

#### 2.1 Co-Authored-By 尾缀提醒

提醒用户：本次 commit message 中不要添加 `Co-Authored-By` 尾缀行。

#### 2.2 敏感信息扫描

**扫描范围**：Step 1 产出的变更文件清单（暂存 + 未暂存 + 未跟踪），不扫描项目其余文件。

对清单中每个文件，使用 Grep 匹配以下正则：

| 编号 | 类型 | 正则 |
|------|------|------|
| S1 | OpenAI Key | `sk-(proj-)?[A-Za-z0-9_-]{20,}` |
| S2 | GitHub Token | `ghp_[A-Za-z0-9]{36}` |
| S3 | GitHub PAT | `github_pat_[A-Za-z0-9_]{36,}` |
| S4 | Slack Token | `xox[bprs]-[A-Za-z0-9-]+` |
| S5 | AWS Access Key | `AKIA[0-9A-Z]{16}` |
| S6 | Generic password | `password\s*[:=]\s*["\'][^"\']+["\']` |
| S7 | Generic secret | `secret\s*[:=]\s*["\'][^"\']+["\']` |
| S8 | Private key header | `-----BEGIN (RSA \|EC \|DSA \|OPENSSH )?PRIVATE KEY-----` |
| S9 | Database URI with creds | `(mongodb\|mysql\|postgres\|postgresql)://[^@]+:[^@]+@` |
| S10 | JWT Token | `eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` |

**结果处理**：

若无命中，输出 `✅ 未发现敏感信息`。

若发现命中：

```
⚠️ 敏感信息扫描 — 发现 N 项：

  🔴 S1 OpenAI Key — src/config.ts:15
     sk-proj-abc123def456ghi789...

  🔴 S6 明文密码 — config/db.ts:8
     password: "admin123"
```

逐项询问用户：

> 第 N 项：`S1 OpenAI Key` — `src/config.ts:15`
> 如何处理？(替换为占位符 / 忽略 / 查看上下文)

- **替换为占位符**：将敏感值替换为 `YOUR_KEY_HERE` 或 `YOUR_PASSWORD_HERE`
- **忽略**：用户确认风险，跳过
- **查看上下文**：读取相关行，展示上下文后再次询问

全部处理完毕后汇总：

```
📊 敏感信息处理报告
✅ S1 OpenAI Key — 已替换为占位符
⏭ S6 明文密码 — 用户选择忽略
```

若存在未处理的忽略项，最终确认前再次提醒。

---

### Step 3: 文档同步

扫描项目根目录和 `docs/ai-context/`，列出存在的文档文件。不存在的标注为"不存在 — 跳过"。

根据 Step 1 产出的变更文件清单逐文件分析，判断需要更新哪些文档。完整映射规则、分析提示、跳过信号见 `references/mapping-rules.md`。

以表格形式呈现更新计划：

```
## 文档同步计划

| # | 文档 | 更新类型 | 变更说明 | 依据 |
|---|------|----------|----------|------|
| 1 | files.md | 修改 | App.xaml.cs: 补充 StartPipeServer 方法 | 新增 public method |
| 2 | README.md | 无需更新 | — | 无用户可见变更 |

是否按此计划执行？(yes / 跳过某项 / 补充)
```

**必须等待用户明确确认后才能执行任何修改。**

逐项执行确认后的更新：

1. **先完整读取目标文件** — 了解现有结构和上下文
2. **最小化修改** — 使用 Edit 工具精确替换，只改需要改的部分
3. **保持一致性** — 新内容格式必须与现有内容完全一致
4. **不覆盖用户内容** — 仅在技术信息需要更新的位置进行修改

---

### Step 4: 确认提交

所有检查通过、文档同步完成后，展示最终汇总：

```
📦 提交前检查汇总

变更文件：3 个
  M src/config.ts
  A src/NewService.cs
  M docs/ai-context/files.md

安全检查：✅ 通过
文档同步：✅ 已完成

是否执行 git commit？
```

**若用户确认**：

- 若暂存区为空（用户未 `git add`），先询问 commit message，执行：
```bash
git add -A
git commit -m "<用户提供的 message>"
```

- 若暂存区已有内容，询问 commit message（或使用 `--no-edit` 沿用上次），执行：
```bash
git commit -m "<message>"
```

- 不执行 `git push`，push 由用户亲自操作

> 绝不使用 `--no-verify` 跳过 hooks。

---

## 参考资源

- **映射规则详情**：`references/mapping-rules.md` — 变更类型→文档映射规则表、分析提示、跳过信号
