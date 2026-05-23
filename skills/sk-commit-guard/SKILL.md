---
name: sk-commit-guard
description: |
  当用户明确说出"准备提交"时触发。通过 git diff 获取本次变更，
  自动同步项目中所有说明文档（CLAUDE.md、README.md、README_CN.md、
  AGENTS.md、doc/、ai-context/、skills/*/ 等），
  确保文档全部最新后自动生成 commit message 并执行本地提交。
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

用户明确说出"准备提交"时触发。流程：获取变更 → 文档全量同步 → 提交前检查 → 自动生成提交信息并提交。

## 功能说明

拦截"准备提交"指令，通过 `git diff` 查看本次所有修改文件，自动更新项目中所有说明文档，全部确认最新后执行本地提交。

---

## When to Use

- 用户明确说"准备提交"

## When NOT to Use

- 用户只是表达 commit 意图但未说"准备提交"（如"提交"、"commit"、"帮我提交"等）→ 不触发
- 用户只是询问 git 概念性问题
- 用户明确要求只做文档同步不提交

---

## Constraints

**安全红线：**
- 绝不跳过 git hooks（`--no-verify`、`--no-gpg-sign`）
- 敏感信息必须先报告后处理，不得静默跳过
- 绝不执行 `git push`，push 由用户亲自操作

**流程约束：**
- 文档更新为强制性步骤，必须确保所有文档最新后才进入提交环节
- 修改文档前必须先完整读取目标文件
- git commit 执行前必须获得用户最终确认

**内容质量：**
- 新内容格式（缩进、术语、代码块语言标记）必须与现有内容完全一致
- 仅修改技术信息，不覆盖用户手写的描述性文字

---

## 执行流程

### Step 1: 获取本次变更

```bash
# 最近一次提交（参考基线）
git log --oneline -1

# 暂存区变更详情
git diff --cached --name-status
git diff --cached --stat

# 未暂存变更详情
git diff --name-status
git diff --stat

# 未跟踪文件
git status --porcelain
git ls-files --others --exclude-standard
```

- 如果以上均无输出，提示"没有待提交的变更"，退出
- 汇总呈现变更文件清单及统计（暂存 + 未暂存 + 未跟踪）

---

### Step 2: 文档全量同步

根据 Step 1 的变更文件清单，自动发现并更新项目中所有说明文档。**本步骤为强制性执行，不等待用户逐项确认。**

#### 2.1 文档发现

扫描项目目录，列出存在的所有说明文档：

| 类别 | 路径 | 说明 |
|------|------|------|
| AI 入口指令 | `CLAUDE.md`、`AGENTS.md`、`GEMINI.md`、`CODEBUDDY.md` | 项目根目录，存在即纳入 |
| 项目说明 | `README.md`、`README_CN.md` | 项目根目录 |
| 文档目录 | `doc/`、`docs/` 下所有 `*.md` | 递归扫描 |
| AI 上下文 | `ai-context/` 下所有 `*.md` | 递归扫描 |
| 技能文档 | `skills/*/SKILL.md` + 对应的 `skills/*/README_CN.md` | 每个技能目录 |

不存在的文档标注"跳过"，存在的全部纳入分析范围。

#### 2.2 变更分析与更新

使用 `git diff` 查看每个变更文件的具体改动内容，逐文档判断是否需要更新。

**判断原则（二选一）：**

- **需要更新**：变更影响了文档中已有的技术信息（文件路径、API 名称、配置项、版本号、功能列表、目录结构、触发词、技能清单等），或变更增加了文档中缺少对应说明的新内容（新增 skill、新增 command、新增 hook 等）
- **跳过**：内部实现重构、纯代码风格修改、注释修改，不影响文档已有描述

**各文档关注重点：**

- **CLAUDE.md / AGENTS.md / GEMINI.md**：项目性质描述、目录规范、技能清单、命令清单、开发注意事项、技术栈版本号
- **README.md**：功能列表、使用指南、目录结构树、安装步骤
- **README_CN.md**：中文功能说明、触发词、工作流程、注意事项；与 README.md 变更联动
- **doc/、docs/、ai-context/**：架构描述、文件清单、编码规范、数据流，与变更文件精确对齐
- **skills/*/SKILL.md**：触发词、流程步骤、约束、适用范围
- **skills/*/README_CN.md**：与对应 SKILL.md 的 frontmatter 描述、触发方式、工作流程同步

#### 2.3 执行更新

对需要更新的文档：

1. **先完整读取目标文件** — 了解现有结构和上下文
2. **最小化修改** — 使用 Edit 工具精确替换，只改需要改的部分
3. **保持一致性** — 新内容格式与现有内容完全对齐
4. **不覆盖用户内容** — 仅更新技术信息

执行完毕后汇报：

```
📄 文档同步完成

| # | 文件 | 状态 | 说明 |
|---|------|------|------|
| 1 | CLAUDE.md | ✅ 已更新 | 技能清单新增 sk-xxx |
| 2 | README.md | ⏭ 无需更新 | 无用户可见变更 |
| 3 | README_CN.md | ⏭ 跳过 | 文件不存在 |
| 4 | skills/sk-xxx/README_CN.md | ✅ 已更新 | 同步触发词变更 |
```

---

### Step 3: 提交前检查

#### 3.1 Co-Authored-By 提醒

提醒用户：本次 commit message 中不要添加 `Co-Authored-By` 尾缀行。

#### 3.2 敏感信息扫描

**扫描范围**：Step 1 产出的变更文件清单（暂存 + 未暂存 + 未跟踪）。

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

**结果处理：**

若无命中，输出 `✅ 未发现敏感信息`。

若发现命中，逐项询问用户处理方式（替换为占位符 / 忽略 / 查看上下文）。全部处理完毕后汇总。若存在未处理的忽略项，最终确认前再次提醒。

---

### Step 4: 确认提交

所有文档同步完成、检查通过后，展示最终汇总并生成 commit message。

#### 4.1 自动生成 commit message

根据 `git diff --stat` 和变更文件列表，综合分析后按 Conventional Commits 格式**用英文**生成：

| 前缀 | 适用场景 |
|------|----------|
| `feat:` | 新增文件、新功能、新 skill |
| `fix:` | 修复 bug |
| `refactor:` | 重构、重命名、结构调整 |
| `docs:` | 纯文档变更（仅 .md 文件） |
| `chore:` | 配置、hooks、依赖等杂项 |

**生成要求：**
- 使用英文描述，简洁概括本次变更的核心内容
- **不得在 message 中添加 `Co-Authored-By` 尾缀行**

#### 4.2 展示汇总并询问

```
📦 提交前检查汇总

变更文件：3 个
  M src/config.ts
  A src/NewService.cs
  M docs/files.md

文档同步：✅ 已完成（3/5 更新，2 跳过）
安全检查：✅ 通过

建议 commit message：
  feat: add NewService with pipe connection support

确认提交？(yes / 输入新 message / cancel)
```

- **yes**（或直接确认）：使用生成的 message，执行提交
- **输入新 message**：使用用户提供的 message 替换，执行提交
- **cancel**：终止，不做任何操作

#### 4.3 执行提交

```bash
git add -A
git commit -m "<message>"
```

> 绝不使用 `--no-verify` 跳过 hooks。不执行 `git push`。

提交完成后输出 commit hash 和分支名。
