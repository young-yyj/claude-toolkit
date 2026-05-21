---
name: sk-github-launch
description: |
  线性向导式引导用户完成本地项目首次上线 GitHub 的全流程：敏感信息扫描、.gitignore 检查、README 质量审查、连接远程、推送、Release 创建。
  唯一触发：用户说出"本地项目初次提交github"（不区分大小写，允许中英文混合）。
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

# GitHub Launch — 本地项目首次上线 GitHub 向导

## 功能说明

按固定顺序逐步引导用户完成：
1. 获取并验证 GitHub 远程仓库地址
2. 扫描项目敏感信息（密钥、密码、私钥、邮箱暴露）
3. 检查 `.gitignore` 存在性与覆盖完整性
4. 审查 README.md 质量，必要时自动生成双语 README
5. 汇总确认变更清单
6. 连接远程仓库并推送
7. 评估 Release 可行性并创建

---

## When to Use

- 用户明确说出触发短语："本地项目初次提交github"（不区分大小写，允许中英文混合如"本地项目初次提交GitHub"）

## When NOT to Use

- 用户消息不包含上述触发短语
- 项目已配置远程仓库（`git remote -v` 显示已有 origin）
- 用户只是询问概念性问题（如"怎么推到 GitHub"）

---

## Constraints

**安全红线：**
- 发现敏感信息时必须先报告、等待用户决策，不得自动修改或静默跳过
- 绝不执行 `git push --force`
- 绝不执行 `git push`（含 `--tags`），push 操作由用户亲自执行

**流程约束：**
- 严格按 Step 1 → Step 7 顺序执行，上一步完成并确认后才进入下一步
- 每步完成后给出明确的状态汇报
- git 写操作（`commit`、`tag`）前必须给用户确认

**内容质量：**
- README 生成基于项目实际文件结构，不得虚构内容
- 敏感信息扫描使用保守策略，宁可多报不可漏报

---

## 执行流程

### Step 1 — 获取远程地址

1. 检查用户消息中是否已包含 GitHub 仓库 URL
2. 若已提供 → 验证格式：
   - 合法格式：`https://github.com/<owner>/<repo>.git` 或 `git@github.com:<owner>/<repo>.git`
   - 不合法 → 告知用户并提供正确格式示例，重新输入
3. 若未提供 → 询问："请输入 GitHub 空仓库地址（例如 https://github.com/user/repo.git）："
4. 验证通过后，记录 URL，进入 Step 2

执行命令：
```bash
# 先检查是否已配置远程
git remote -v
# 若已有 origin，告知用户并询问是否替换
```

### Step 2 — 敏感信息扫描

**执行以下所有检查（使用并行工具调用，各项无依赖）：**

#### 2.1 工程文件敏感信息（使用 Grep 工具）

正则模式列表（按类型逐个 Grep）：

| 类型 | 正则 |
|------|------|
| OpenAI API Key | `sk-(proj-)?[A-Za-z0-9_-]{20,}` |
| GitHub Token | `ghp_[A-Za-z0-9]{36}` |
| GitHub PAT | `github_pat_[A-Za-z0-9_]{36,}` |
| Slack Token | `xox[bprs]-[A-Za-z0-9-]+` |
| AWS Access Key | `AKIA[0-9A-Z]{16}` |
| AWS Secret | `aws_access_key_id\|aws_secret_access_key` |
| Generic password | `password\s*[:=]\s*["\'][^"\']+["\']` |
| Generic secret | `secret\s*[:=]\s*["\'][^"\']+["\']` |
| Database URL with creds | `(mongodb\|mysql\|postgres\|postgresql)://[^@]+@` |
| Private key header | `-----BEGIN (RSA \|EC \|DSA \|OPENSSH )?PRIVATE KEY-----` |

对每种正则使用 Grep 搜索整个项目目录，记录所有匹配（文件路径 + 行号 + 内容片段）。

#### 2.2 私钥文件检测

使用 Glob 搜索：
```
Glob pattern="**/*.pem"
Glob pattern="**/*.key"
Glob pattern="**/id_rsa*"
Glob pattern="**/*.pfx"
Glob pattern="**/*.p12"
Glob pattern="**/*.jks"
Glob pattern="**/*.keystore"
```

#### 2.3 .env 跟踪状态

```bash
for f in .env .env.local .env.development .env.production .env.staging .env.test; do
  git ls-files --error-unmatch "$f" 2>/dev/null && echo "$f: TRACKED"
done
```

#### 2.4 邮箱暴露检测（三方面同时执行）

```bash
# A. git config 邮箱
git config user.email

# B. git 提交记录中的邮箱（最近 50 条）
git log --format="%an <%ae> | %cn <%ce>" -n 50 | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'

# C. 文件内容中的邮箱
```

使用 Grep pattern: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` 搜索所有项目文件。

排除：`noreply@github.com`、`example@`、`test@`、占位符邮箱。

#### 2.5 汇总与处理

扫描完成后，汇总所有发现，分类展示：

```
🔍 敏感信息扫描结果

🔴 高危发现（共 N 项）：
  1. API Key 疑似 — src/config.ts:15
     匹配内容：sk-proj-abc123def456...
  2. .env 文件被 git 跟踪

🟡 邮箱暴露（共 N 项）：
  3. git config user.email = young@example.com
  4. git 提交记录中发现邮箱：young@company.com（出现在 12 条提交中）

✅ 未发现问题：私钥文件、云服务凭证
```

逐项询问用户处理方式，提供选项：
- **"替换为占位符"**：使用 Edit 工具将敏感值替换为对应占位符（如 `YOUR_API_KEY_HERE`）
- **"添加到 .gitignore"**：若 .env 被跟踪，添加到 .gitignore 并从 git 索引移除（`git rm --cached`）
- **"重写 git 历史"**：若邮件在历史提交中暴露，告知用户使用 GitHub 隐私邮箱或 `git filter-branch`
- **"跳过，手动处理"**：不对该项做任何操作

用户选择后执行对应操作，处理完毕后重新扫描确认干净。

### Step 3 — `.gitignore` 检查

1. 使用 Glob 检测项目根目录是否存在 `.gitignore`

2. **若不存在** → 询问用户："项目没有 .gitignore 文件，是否需要根据项目技术栈自动生成？"
   - 用户同意 → 执行技术栈检测（见 Step 4.1）→ 读取 `references/gitignore-templates.md` → 根据技术栈选择对应模板 → 生成 `.gitignore`
   - 用户拒绝 → 跳过，继续下一步

3. **若存在** → 读取内容。根据 Step 4.1 检测到的技术栈，检查关键忽略项是否覆盖：
   - Node.js: 检查是否含 `node_modules/`、`dist/`、`build/`、`.env*`
   - Python: 检查是否含 `__pycache__/`、`*.pyc`、`.venv/`、`dist/`
   - .NET: 检查是否含 `bin/`、`obj/`、`.vs/`、`*.user`
   - Go: 一般无需特殊忽略，检查 `.env*`
   - 通用项: 检查是否含 `.DS_Store`、`Thumbs.db`、`*.log`
   - 列出缺漏项并提示用户补充

4. 展示最终 `.gitignore` 内容（新增或修改后的），等用户确认

### Step 4 — README.md 质量审查

#### 4.1 检测技术栈（并行执行）

```bash
# 检测所有可能的标志文件
ls package.json 2>/dev/null && echo "PROJECT_TYPE=Node.js"
ls pyproject.toml setup.py requirements.txt 2>/dev/null && echo "PROJECT_TYPE=Python"
ls *.csproj *.sln 2>/dev/null && echo "PROJECT_TYPE=.NET"
ls go.mod 2>/dev/null && echo "PROJECT_TYPE=Go"
ls Cargo.toml 2>/dev/null && echo "PROJECT_TYPE=Rust"
ls pom.xml build.gradle build.gradle.kts 2>/dev/null && echo "PROJECT_TYPE=Java"
```

#### 4.2 评估现有 README

检查 README.md 是否存在。若存在，按以下维度评估：

| 维度 | 标准 |
|------|------|
| 长度 | >= 200 字为合格 |
| 项目描述 | 有项目名和一句话介绍 |
| 安装说明 | 有依赖安装步骤和命令 |
| 使用方式 | 有运行/构建/测试命令 |
| 项目结构 | 有目录说明 |
| 中英文双语 | 包含中英文两部分 |

#### 4.3 处理逻辑

- **无 README.md** → 读取 `references/readme-template.md`，根据检测到的项目实际文件结构填充模板，生成单文件双语 README（中文上半部分，英文下半部分，用 `---` 分隔）
- **有 README 但质量低**（如 < 200 字或缺少关键章节）→ 展示评估结果："当前 README.md 仅有 X 字，缺少 Y、Z 章节。是否需要补充/改进？"
  - 用户同意 → 读取现有 README，保留原有内容，补充缺失章节 + 英文翻译
  - 用户拒绝 → 保持原样
- **已有高质量 README** → "README.md 质量良好（X 字，结构完整），跳过此步。"

展示最终版本的 README.md 内容，等待用户确认后保存。

### Step 5 — 汇总确认

展示推送前完整清单：

```
📦 推送前确认清单

远程仓库：https://github.com/user/repo.git
当前分支：main
待推送提交数：5 个

本次操作涉及的文件变更：
  [新增] .gitignore
  [新增] README.md
  [修改] src/config.ts — 移除硬编码 API Key

确认推送到远程仓库？
```

用户确认后进入 Step 6。若用户拒绝，询问要修改哪项。

### Step 6 — 连接并推送

**注意：`git push` 操作由用户亲自执行，skill 只提供完整命令，不执行 push。**

1. 检测远程配置状态：
```bash
git remote -v
```

2. 若未配置 origin：
```bash
git remote add origin <用户提供的URL>
```

3. 若已配置 origin 但地址不同，告知用户差异并询问是否替换：
```bash
git remote set-url origin <新地址>
```

4. 检测远程是否有内容：
```bash
git ls-remote origin
```
若有输出 → 提示风险："⚠️ 远程仓库非空，推送可能存在冲突。建议使用空仓库。如果远程有内容且需要保留，请先 git pull 并解决冲突。"

5. 提供推送命令（告知用户自行执行，skill 不执行此命令）：
```bash
git push -u origin <current-branch>
```
明确告知用户："请在终端自行执行 push 命令，或在聊天中输入 `! git push -u origin <branch>`。"

### Step 7 — Release 评估

#### 7.1 检测项目可发布性

根据 Step 4.1 检测到的技术栈，查找版本信息：

| 项目类型 | 版本来源 | 检测方法 |
|----------|---------|---------|
| Node.js | `package.json` → `version` 字段 | Read + 解析 JSON |
| Python | `pyproject.toml` → `[project] version` 或 `setup.py` → `version=` | Read 或 Grep |
| .NET/WPF | `*.csproj` → `<Version>` 标签 | Grep `<Version>([^<]+)</Version>` |
| Go | `go.mod` → module 路径 | Read `go.mod` |
| Rust | `Cargo.toml` → `[package] version` | Read + 解析 |
| 无识别 | — | 询问用户手动指定 |

#### 7.2 处理逻辑

- **检测到版本号** → 提示："检测到版本号 v{X.X.X}（来源：{文件}）。建议创建 Release，是否执行？"
- **未检测到版本号** → 提示："项目无可识别版本号。{如为 WPF/.NET 项目，建议在 .csproj 中设置 `<Version>` 标签}。是否手动指定版本号创建 Release？"
- **用户确认创建** → 提供命令（告知用户自行执行，skill 不执行这些命令）：
```bash
git tag -a v{X.X.X} -m "Release v{X.X.X}"
git push origin v{X.X.X}
gh release create v{X.X.X} --generate-notes
```

---

## 参考资源

- **`.gitignore` 模板**：`references/gitignore-templates.md` — 各技术栈的 .gitignore 模板（Node.js / Python / .NET / Go / Java / Rust / 通用）
- **README 模板**：`references/readme-template.md` — 单文件双语 README 模板及质量检查清单
