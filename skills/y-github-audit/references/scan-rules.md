# GitHub Scan — 扫描规则详细定义

## 一、安全扫描规则

### 1.1 API Key / Token 正则库

| 编号 | 类型 | 正则表达式 | 严重级别 | 替换占位符 |
|------|------|-----------|---------|-----------|
| A1 | OpenAI API Key | `sk-(proj-)?[A-Za-z0-9_-]{20,}` | 🔴 严重 | `sk-YOUR_OPENAI_KEY_HERE` |
| A2 | GitHub Personal Token | `ghp_[A-Za-z0-9]{36}` | 🔴 严重 | `ghp_YOUR_GITHUB_TOKEN_HERE` |
| A3 | GitHub PAT (new) | `github_pat_[A-Za-z0-9_]{36,}` | 🔴 严重 | `github_pat_YOUR_TOKEN_HERE` |
| A4 | Slack Bot Token | `xoxb-[0-9]+-[0-9]+-[A-Za-z0-9]+` | 🔴 严重 | `xoxb-YOUR_SLACK_TOKEN` |
| A5 | Slack User Token | `xoxp-[0-9]+-[0-9]+-[0-9]+-[A-Za-z0-9]+` | 🔴 严重 | `xoxp-YOUR_SLACK_TOKEN` |
| A6 | AWS Access Key | `AKIA[0-9A-Z]{16}` | 🔴 严重 | `AKIAYOUR_AWS_KEY` |
| A7 | Generic JWT | `eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}` | 🟡 警告 | — |

### 1.2 密码/凭证模式

| 编号 | 类型 | 正则表达式 | 严重级别 |
|------|------|-----------|---------|
| P1 | 密码赋值 | `password\s*[:=]\s*["\'][^"\']+["\']` | 🔴 严重 |
| P2 | 密钥赋值 | `secret\s*[:=]\s*["\'][^"\']+["\']` | 🔴 严重 |
| P3 | passwd 变量 | `passwd\s*[:=]` | 🔴 严重 |
| P4 | AWS 凭证配置 | `aws_access_key_id\|aws_secret_access_key` | 🔴 严重 |

### 1.3 数据库连接串

| 编号 | 类型 | 正则表达式 | 严重级别 |
|------|------|-----------|---------|
| D1 | MongoDB URI | `mongodb(\+srv)?://[^@]+:[^@]+@` | 🔴 严重 |
| D2 | MySQL URI | `mysql://[^@]+:[^@]+@` | 🔴 严重 |
| D3 | PostgreSQL URI | `postgres(ql)?://[^@]+:[^@]+@` | 🔴 严重 |
| D4 | Redis URI | `redis://[^@]+:[^@]+@` | 🔴 严重 |

### 1.4 私钥文件

| 扩展名 | 说明 | 严重级别 |
|--------|------|---------|
| `*.pem` | PEM 格式证书/密钥 | 🔴 严重 |
| `*.key` | 私钥文件 | 🔴 严重 |
| `id_rsa` | SSH 私钥 | 🔴 严重 |
| `id_rsa.pub` | SSH 公钥（一般可提交） | 🟡 提示 |
| `*.pfx` | PKCS#12 证书 | 🔴 严重 |
| `*.p12` | PKCS#12 证书 | 🔴 严重 |
| `*.jks` | Java KeyStore | 🔴 严重 |
| `*.keystore` | Java KeyStore | 🔴 严重 |

### 1.5 .env 系列文件

需检查是否被 git 跟踪的文件列表：
- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.staging`
- `.env.test`

检查命令：`git ls-files --error-unmatch <file>`。若返回码为 0，说明文件被跟踪。

### 1.6 邮箱暴露检测

**三个检测面：**

1. **git config user.email** — 当前仓库配置的提交邮箱
   ```bash
   git config user.email
   ```

2. **git 提交记录** — 所有历史提交中出现的作者/提交者邮箱
   ```bash
   git log --format="%an <%ae>" -n 50 | grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' | sort -u
   ```

3. **文件内容** — 代码/配置文件中硬编码的邮箱
   - 正则：`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
   - 排除：`noreply@github.com`、`users.noreply.github.com`、`example@`、`test@`、`localhost`、占位符邮箱

**处理建议：**
- 若发现个人邮箱 → 建议使用 GitHub 提供的隐私邮箱 `{id}+{username}@users.noreply.github.com`
- 若历史提交含邮箱 → 建议检查 GitHub 设置中"Block command line pushes that expose my email"
- `git filter-branch` 为高风险操作，仅在用户充分了解风险并明确确认后执行

---

## 二、工程扫描规则

### 2.1 技术栈检测矩阵

| 技术栈 | 检测标志文件 | 包管理器 | 默认入口 |
|--------|-------------|---------|---------|
| Node.js | `package.json` | npm/yarn/pnpm | `index.js` / `src/index.ts` |
| TypeScript | `tsconfig.json` | npm/yarn/pnpm | — |
| Python | `pyproject.toml`, `setup.py`, `requirements.txt` | pip/poetry | `main.py` / `app.py` |
| .NET | `*.csproj`, `*.sln`, `*.vbproj` | nuget | `Program.cs` |
| Go | `go.mod`, `go.sum` | go mod | `main.go` |
| Rust | `Cargo.toml` | cargo | `src/main.rs` |
| Java/Maven | `pom.xml` | maven | `src/main/java/` |
| Java/Gradle | `build.gradle`, `build.gradle.kts` | gradle | — |
| Ruby | `Gemfile` | bundler | — |
| PHP | `composer.json` | composer | `index.php` |

### 2.2 .gitignore 覆盖检查

根据技术栈检查关键目录/文件是否在 `.gitignore` 中：

| 技术栈 | 必要忽略项 | 建议忽略项 |
|--------|-----------|-----------|
| Node.js | `node_modules/` | `dist/`, `build/`, `.next/` |
| Python | `__pycache__/`, `*.pyc` | `.venv/`, `dist/`, `*.egg-info/` |
| .NET | `bin/`, `obj/` | `.vs/`, `*.user` |
| Go | — | `*.exe`, `*.test` |
| Rust | `target/` | — |
| Java | `target/`, `build/` | `.idea/`, `*.iml` |
| 通用 | `.env*`, `.DS_Store`, `Thumbs.db` | `*.log` |

### 2.3 README 质量评分

| 维度 | 权重 | 评分标准 |
|------|------|---------|
| 长度 | 30% | >= 200 字满分；100-200 字半分；< 100 字零分 |
| 项目描述 | 20% | 有清晰的一两句描述 |
| 安装说明 | 20% | 有依赖安装步骤和命令 |
| 使用方式 | 20% | 有运行/构建/测试命令 |
| 中英文双语 | 10% | 包含中英文两部分 |

总分 >= 70% → 质量良好，跳过生成；< 70% → 建议补充。

---

## 三、发布扫描规则

### 3.1 版本号来源

| 技术栈 | 版本位置 | 提取方式 |
|--------|---------|---------|
| Node.js | `package.json` `"version"` | Read + JSON 解析 |
| Python/poetry | `pyproject.toml` `[project] version` | Read + TOML 解析 |
| Python/setuptools | `setup.py` `version=` | Grep `version\s*=\s*["\']([^"\']+)["\']` |
| .NET | `*.csproj` `<Version>` | Grep `<Version>([^<]+)</Version>` |
| Go | `go.mod` | 无标准版本位置，建议用 git tag |
| Rust | `Cargo.toml` `[package] version` | Read + TOML 解析 |

### 3.2 Release 创建决策树

```
有版本号？
 ├─ 是 → 建议创建 Release v{version}
 └─ 否 → 项目类型可识别？
          ├─ 是 → 建议用户设置版本号后再创建
          └─ 否 → 询问用户手动指定版本号
```

Release 创建命令（提供给用户自行执行，skill 不执行 push）：
```bash
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}
gh release create v{VERSION} --generate-notes
```
