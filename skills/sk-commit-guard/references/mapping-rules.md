# 变更→文档映射规则

根据 Step 1 产出的变更文件清单逐文件分析，判断需要更新哪些文档。

## Step 0: 文档发现

扫描项目目录，列出存在的所有说明文档：

| 类别 | 扫描路径 | 匹配规则 |
|------|----------|----------|
| AI 入口指令 | 项目根目录 | `CLAUDE.md`、`AGENTS.md`、`GEMINI.md`、`CODEBUDDY.md` |
| 项目说明 | 项目根目录 | `README.md`、`README_CN.md` |
| 文档目录 | `doc/`、`docs/` | 所有 `*.md`，递归扫描 |
| AI 上下文 | `ai-context/` | 所有 `*.md`，递归扫描 |
| 技能文档 | `skills/` | `skills/*/SKILL.md`、`skills/*/README_CN.md` |

不存在的文档标注"跳过"，存在的全部纳入分析范围。

## 规则表

| 变更类型 | 影响的文档 | 更新动作 |
|----------|-----------|----------|
| 新增 skill (`A skills/sk-xxx/`) | CLAUDE.md、README.md、README_CN.md | 更新技能清单表和触发词列表 |
| 新增 skill SKILL.md | 该 skill 的 README_CN.md | 同步触发方式、工作流程、注意事项 |
| 新增 command (`A commands/cmd-xxx.md`) | CLAUDE.md、README.md | 更新命令清单 |
| 新增/删除源文件 | ai-context/files.md（如存在）| 添加/移除文件条目 |
| 修改 CLAUDE.md | README.md、README_CN.md | 同步关键信息变更 |
| 修改 README.md | README_CN.md | 同步中文说明 |
| 修改 SKILL.md 的 frontmatter/流程 | 对应 README_CN.md | 同步触发词、流程步骤、约束 |
| 修改项目目录结构 | CLAUDE.md、README.md、README_CN.md、ai-context/ | 更新目录规范和结构树 |
| 依赖/版本变更 | CLAUDE.md | 更新技术栈版本号 |
| 新增功能/特性 | README.md、README_CN.md | 更新功能列表 |
| git hooks 变更 | CLAUDE.md、README.md | 更新 hooks 说明 |
| 纯内部重构（无 API 变化） | 通常跳过 | — |
| 仅 .md 文件变更 | 关联文档互查 | 按关联性更新 |

## 各文档关注重点

- **CLAUDE.md**：项目性质描述、目录规范、技能清单、命令清单、开发注意事项、文档约定
- **AGENTS.md / GEMINI.md / CODEBUDDY.md**：同 CLAUDE.md，按各自内容结构更新
- **README.md**：功能列表、使用指南、目录结构树、安装步骤
- **README_CN.md**：中文功能说明、触发词、工作流程、注意事项；与 README.md 变更联动
- **doc/、docs/ 下各文件**：按各自主题更新（架构、API、部署、贡献指南等）
- **ai-context/ 下各文件**：架构描述、文件清单、编码规范，与变更文件精确对齐
- **skills/*/SKILL.md**：触发词、流程步骤、约束、适用范围
- **skills/*/README_CN.md**：与对应 SKILL.md 同步，重点关注触发方式、工作流程、注意事项

## 跳过信号

以下情况标记为"无需更新"：
- 变更仅修改方法内部实现，无新增 API、无功能变化
- 变更文件与文档描述无关联（如 .gitignore、配置文件格式化）
- 文档中不存在对应的描述内容（新增了文档尚未覆盖的东西 → 应标记为"需要更新"而非跳过）
