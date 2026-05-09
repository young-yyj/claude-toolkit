---
name: github-audit
description: |
  仪表盘式全局审计本地项目健康状态（敏感信息、.gitignore、README、Release 可行性），用户勾选处理项后批量修复。
  唯一触发：用户说出"YY本地项目初次提交github"（不区分大小写，允许中英文混合）。
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

# GitHub Audit — 本地项目首次提交全维度审计

## 功能说明

一次性并行扫描项目的所有发布前维度，以仪表盘形式汇总展示，用户按编号勾选要处理的问题，按优先级（严重 > 建议 > 发布）批量修复。

---

## When to Use

- 用户明确说出触发短语："YY本地项目初次提交github"（不区分大小写，允许中英文混合如"YY本地项目初次提交GitHub"）

## When NOT to Use

- 用户消息不包含上述触发短语
- 用户只是询问概念性问题

---

## Constraints

**安全红线：**
- 发现敏感信息时必须先报告、等待用户决策，不得自动修改
- 绝不执行 `git push --force`
- 绝不执行 `git push`（含 `--tags`），push 操作由用户亲自执行

**流程约束：**
- Step 1 的 13 项扫描必须并行执行（各检查间无依赖）
- Step 3 中按优先级顺序处理：严重问题 → 建议问题 → 发布操作
- git 写操作（`commit`、`tag`）前必须给用户确认

**内容质量：**
- 扫描使用保守策略，宁可多报不可漏报
- 所有发现必须标注文件路径和行号

---

## 执行流程

### Step 1 — 全维度并行扫描

同时执行以下 13 项检查（使用并行工具调用，各项无依赖），收集所有结果后汇总。

#### 安全扫描（S1-S5）

**S1 — API Key / Token 明文检测（Grep 正则）**

对以下每种正则，使用 Grep 搜索整个项目目录，记录所有匹配（文件路径 + 行号）：

| 编号 | 类型 | 正则 |
|------|------|------|
| S1a | OpenAI Key | `sk-(proj-)?[A-Za-z0-9_-]{20,}` |
| S1b | GitHub Token | `ghp_[A-Za-z0-9]{36}` |
| S1c | GitHub PAT | `github_pat_[A-Za-z0-9_]{36,}` |
| S1d | Slack Token | `xox[bprs]-[A-Za-z0-9-]+` |
| S1e | AWS Key | `AKIA[0-9A-Z]{16}` |
| S1f | Generic password | `password\s*[:=]\s*["\'][^"\']+["\']` |
| S1g | Generic secret | `secret\s*[:=]\s*["\'][^"\']+["\']` |
| S1h | JWT Token | `eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` |

**S2 — 云服务凭证检测（Grep）**

| 编号 | 类型 | 正则 |
|------|------|------|
| S2a | AWS 凭证配置 | `aws_access_key_id\|aws_secret_access_key` |
| S2b | MongoDB URI with creds | `mongodb(\+srv)?://[^@]+:[^@]+@` |
| S2c | MySQL URI with creds | `mysql://[^@]+:[^@]+@` |
| S2d | PostgreSQL URI with creds | `postgres(ql)?://[^@]+:[^@]+@` |
| S2e | Redis URI with creds | `redis://[^@]+:[^@]+@` |
| S2f | Private key header | `-----BEGIN (RSA \|EC \|DSA \|OPENSSH )?PRIVATE KEY-----` |

**S3 — .env 跟踪状态**

```bash
for f in .env .env.local .env.development .env.production .env.staging .env.test; do
  git ls-files --error-unmatch "$f" 2>/dev/null && echo "S3: $f — TRACKED"
done
```
若无输出，表示以上文件均未被 git 跟踪。

**S4 — 私钥文件检测（Glob）**

```
Glob pattern="**/*.pem"
Glob pattern="**/*.key"
Glob pattern="**/id_rsa*"
Glob pattern="**/*.pfx"
Glob pattern="**/*.p12"
Glob pattern="**/*.jks"
Glob pattern="**/*.keystore"
```

**S5 — 邮箱暴露检测（三合一）**

```bash
# a. git config 邮箱
echo "--- git config user.email ---"
git config user.email

# b. git 提交记录中的邮箱（最近 50 条，去重）
echo "--- git log emails ---"
git log --format="%an <%ae>" -n 50 | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | sort -u
```

使用 Grep pattern: `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` 搜索所有项目文件内容中的邮箱。

排除规则：忽略 `noreply@github.com`、`users.noreply.github.com`、`example.com`、`test@`、`localhost`、`@users.noreply`。

#### 工程扫描（E1-E6）

**E1 — .gitignore 存在性检查**

```
Glob pattern=".gitignore"
```
若存在，使用 Read 读取其内容。

**E2 — 技术栈检测（并行执行以下所有检测）**

```bash
# 并行检测所有标志文件
ls package.json 2>/dev/null && echo "E2: PROJECT_TYPE=Node.js"
ls tsconfig.json 2>/dev/null && echo "E2: TYPESCRIPT=true"
ls pyproject.toml setup.py requirements.txt 2>/dev/null && echo "E2: PROJECT_TYPE=Python"
ls *.csproj *.sln 2>/dev/null && echo "E2: PROJECT_TYPE=.NET"
ls go.mod 2>/dev/null && echo "E2: PROJECT_TYPE=Go"
ls Cargo.toml 2>/dev/null && echo "E2: PROJECT_TYPE=Rust"
ls pom.xml build.gradle build.gradle.kts 2>/dev/null && echo "E2: PROJECT_TYPE=Java"
ls Gemfile 2>/dev/null && echo "E2: PROJECT_TYPE=Ruby"
ls composer.json 2>/dev/null && echo "E2: PROJECT_TYPE=PHP"
```

**E3 — .gitignore 覆盖完整度检查**

若 E1 发现 `.gitignore` 存在，根据 E2 技术栈检查关键忽略项覆盖率：

| 技术栈 | 必须检查的忽略项 |
|--------|-----------------|
| Node.js | `node_modules/`、`dist/`、`build/`、`.next/`、`.env*` |
| Python | `__pycache__/`、`*.pyc`、`*.pyo`、`.venv/`、`dist/`、`*.egg-info/` |
| .NET | `bin/`、`obj/`、`.vs/`、`*.user`、`*.suo` |
| Go | `*.exe`、`*.test`、`.env*` |
| Rust | `target/` |
| Java | `target/`、`build/`、`.idea/`、`*.iml`、`.classpath` |
| 通用 | `.env*`、`.DS_Store`、`Thumbs.db`、`desktop.ini`、`*.log` |

记录缺漏项。

**E4 — README 存在性与质量评估**

```
Glob pattern="README.md"
```

若存在，读取并评估：
- 字数统计：< 100 字 → "严重不足"；100-200 字 → "偏少"；>= 200 字 → "良好"
- 章节检查：是否有项目描述、安装说明、使用方式、项目结构
- 是否有英文部分

**E5 — 分支状态**

```bash
# 当前分支
echo "--- current branch ---"
git branch --show-current

# 最近 20 条提交
echo "--- recent commits ---"
git log --oneline -n 20

# 未暂存变更
echo "--- uncommitted changes ---"
git status --porcelain
```

**E6 — 远程配置状态**

```bash
echo "--- remote config ---"
git remote -v

# 若已配置 origin，检查远程内容
if git remote | grep -q origin; then
  echo "--- remote content ---"
  git ls-remote origin 2>/dev/null || echo "E6: 无法访问远程"
else
  echo "E6: 未配置远程（首次发布，正常）"
fi
```

#### 发布扫描（P1-P2）

**P1 — 版本号检测**

| 技术栈 | 检测方法 |
|--------|---------|
| Node.js | Read `package.json` → 提取 `"version"` 字段 |
| Python | Read `pyproject.toml` → 提取 `[project] version`；或 Grep `setup.py` 中的 `version=` |
| .NET | Grep `*.csproj` → `<Version>([^<]+)</Version>` |
| Go | Read `go.mod` → 解析 module 路径 |
| Rust | Read `Cargo.toml` → 提取 `[package] version` |
| 其他 | 标记为"无版本信息" |

**P2 — 综合可发布性判断**

基于以上所有扫描结果：
- 是否有严重安全问题未处理？
- 是否有版本号？
- 远程是否已配置？

---

### Step 2 — 仪表盘汇总

将 Step 1 所有扫描结果按分类汇总展示，格式如下：

```
📋 项目健康扫描报告 — <项目根目录名>

🔴 严重问题（建议推送前处理，共 N 项）
   1. API Key 疑似 — src/config.ts:15
      sk-proj-abc123def456ghi789jkl...
   2. .env 文件被 git 跟踪
   3. 提交记录中发现邮箱 — young@example.com（12 条提交中出现）

🟡 建议处理（共 N 项）
   4. 项目无 .gitignore 文件
   5. README.md 内容过短（仅 46 字，缺少安装说明、项目结构）

🟢 状态正常（共 N 项）
   ✓ 无远程配置（首次发布，正常）
   ✓ 分支 main，5 个提交待推送
   ✓ 无云凭证泄露
   ✓ 无私钥文件

🎯 发布建议
   项目类型：.NET WPF
   版本号：未检测到（建议在 .csproj 中设置 <Version>）
   可发布 Release：是（需先设置版本号）

---
请输入要处理的项序号（如 "1,2,4" 或 "全部" 或 "跳过"）：
```

---

### Step 3 — 交互式选择与处理

用户输入要处理的序号后，按优先级顺序执行：

**优先级 1 — 严重问题（🔴）：每项独立处理，处理后汇报**

- **API Key / Token / 密码匹配项** → 读取匹配文件，展示上下文，询问用户处理方式：
  - "替换为占位符"：使用 Edit 将敏感值替换为 `YOUR_KEY_HERE` 或 `YOUR_PASSWORD_HERE`
  - "添加到 .gitignore"：如果整个文件都是敏感信息
  - "跳过"
- **.env 被跟踪** → 询问："是否将 .env 添加到 .gitignore 并从 git 索引移除？"
  - 确认：`echo ".env" >> .gitignore && git rm --cached .env`
  - 拒绝：跳过
- **邮箱暴露 — git config** → 建议使用 GitHub 隐私邮箱：
  ```
  建议执行：git config user.email "<id>+<username>@users.noreply.github.com"
  （可在 GitHub Settings > Emails 中找到你的隐私邮箱地址）
  ```
- **邮箱暴露 — git 历史** → 说明风险并给出选项：
  - 使用 GitHub 隐私邮箱设置
  - `git filter-branch` 重写历史（高风险，需用户确认）
  - 跳过（如为公开邮箱、不介意暴露）

**优先级 2 — 建议问题（🟡）：批量处理**

- **无 .gitignore** → 询问用户是否根据技术栈自动生成 → 需要则用 E2 检测结果，参考 `references/scan-rules.md` 中的模板生成
- **.gitignore 缺漏项** → 列出缺漏项，询问是否补充。若是 → 使用 Edit 追加到 `.gitignore`
- **README 质量低** → 展示具体问题（字数、缺失章节），询问是否补充。若是 → 根据项目实际结构补充缺失章节，并添加英文翻译部分

**优先级 3 — 发布操作：最后单独确认**

- 询问用户是否要设置远程仓库地址
- 询问用户是否要创建 Release（按 P2 建议）

---

### Step 4 — 执行与汇报

逐项汇报处理结果：

```
📊 处理报告

✅ [1] API Key — 已替换为占位符 (src/config.ts:15)
✅ [2] .env — 已添加到 .gitignore 并从 git 索引移除
✅ [4] .gitignore — 已生成（.NET WPF 模板）
✅ [5] README.md — 已补充安装说明和项目结构（现 220 字）

⏭ 跳过：[3] 邮箱暴露 — 用户选择手动处理

📊 处理完成：4 项成功，1 项跳过

🎯 Release 建议：
  在 .csproj 中设置 <Version> 后，执行：
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  gh release create v1.0.0 --generate-notes

---
若需推送，请在终端执行：
  git remote add origin <url>
  git push -u origin main
```

---

## 参考资源

- **扫描规则详情**：`references/scan-rules.md` — 完整的安全扫描规则、工程扫描规则、发布扫描规则定义
