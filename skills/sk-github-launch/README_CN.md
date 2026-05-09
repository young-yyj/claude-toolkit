# GitHub Launch — 本地项目首次上线 GitHub

## 这是什么？

`sk-github-launch` 是一个**线性向导式** Skill，像导游一样一步步带你完成本地项目首次发布到 GitHub 的完整流程。

## 触发方式

在聊天中输入 **「本地项目初次提交github」** 即可启动。

> 不区分大小写，中英文混合也可以，比如「本地项目初次提交GitHub」。

## 它会做什么？

流程严格按以下 7 步顺序执行，每步完成后汇报状态再进入下一步：

| 步骤 | 做什么 | 说明 |
|------|--------|------|
| Step 1 | 获取远程地址 | 验证用户提供的 GitHub 仓库 URL 格式；若未提供则询问 |
| Step 2 | 敏感信息扫描 | 并行扫描 API Key（8 种正则）、云服务凭证、私钥文件（7 种扩展名）、. env 跟踪状态、邮箱暴露（git config + 历史 + 文件内容三方面） |
| Step 3 | .gitignore 检查 | 检查是否存在、覆盖是否完整，缺失则根据技术栈自动生成 |
| Step 4 | README 审查 | 检测技术栈 → 评估 README 质量（字数、章节、双语）→ 必要时自动生成双语 README |
| Step 5 | 汇总确认 | 展示所有变更清单（新增/修改文件、待推送提交数），等用户确认 |
| Step 6 | 连接并推送 | 配置远程仓库，检测远程是否为空，提供 push 命令（**由用户亲自执行**） |
| Step 7 | Release 评估 | 检测版本号，评估可发布性，提供 tag 和 release 创建命令 |

## 约束与安全红线

- 发现敏感信息时**先报告、等用户决策**，不自动修改或静默跳过
- 绝不执行 `git push`（含 `--force`、`--tags`），push 操作由用户亲自执行
- 绝不执行 `git push --force`
- git 写操作（`commit`、`tag`）前必须给用户确认
- README 基于项目实际文件结构生成，不虚构内容

## 适合谁用？

- 第一次把项目推 GitHub 的新手
- 需要按部就班、每步确认的谨慎型用户
- 希望有人帮你检查安全性和工程质量的人

## 和 github-audit 的区别

| | github-launch | github-audit |
|------|--------------|-------------|
| 模式 | 线性向导，7 步顺序走 | 一次性并行扫描，仪表盘汇总 |
| 体验 | 导游模式，每步一个决策点 | 体检报告模式，勾选后批量修复 |
| 范围 | 含远程配置 + push + Release | 纯本地诊断 + 修复，不配远程 |

简单说：**Launch 是陪你走全程，Audit 是给你体检报告让你自己挑着修。**

## 参考资源

- **.gitignore 模板**：`references/gitignore-templates.md` — 各技术栈的 .gitignore 模板（Node.js / Python / .NET / Go / Java / Rust / 通用）
- **README 模板**：`references/readme-template.md` — 单文件双语 README 模板及质量检查清单
