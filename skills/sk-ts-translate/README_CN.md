# TS Translate — Qt Linguist TS 文件翻译工具

一键处理 Qt Linguist TS 文件中所有 `type="unfinished"` 条目：AI 翻译源文本（Google Translate API 可选辅助）、移除 unfinished 标记、严格保留 XML 格式。

## 适用场景

- 批量填充 TS 翻译文件中所有 `?` 标记的未完成条目
- 通过 AI 翻译（Google Translate API 可选辅助）自动化多语言翻译流程
- 清理 unfinished 状态，将草稿翻译定稿

## 使用方式

在 Claude Code 中提及以下即可触发：

- "翻译这个 TS 文件"
- "帮我把 TS 文件里的 unfinished 条目处理掉"
- "批量翻译 Qt Linguist 的 ? 标记"

## 执行步骤概览

| 步骤 | 内容 |
|------|------|
| 1. 发现 | 扫描项目中所有 `.ts` 文件 |
| 2. 提取 | `extract.js` 按文件顺序提取所有 unfinished 条目 |
| 3. 翻译 | AI 直接翻译（首选），Google Translate API 可选辅助 |
| 4. 映射 | `gen-mapping.js` 生成翻译映射 JSON |
| 5. 应用 | `apply.js` 安全写入翻译，仅修改 `<translation>` 元素 |
| 6. 验证 | 确认零残留 unfinished，diff 仅含 translation 行变更 |
| 7. 汇报 | 处理统计与输出路径 |

## 核心约束

- **源文件只读，绝不修改**——翻译结果始终输出到 `<原名>_translated.ts`，同名新文件
- **仅修改 `<translation>` 元素**——其余所有 XML 结构原样保留
- 源文本中的换行符在译文中同位置保留，不合并、不新增
- 空白字符使用 Qt Linguist 原生字面量，不转换为 HTML 实体
- 纯数值、Qt 占位符（`%1` 等）、已国际化字符串保持原文
- 翻译顺序与文件出现顺序严格一致

## 注意事项

- 需要 Node.js 运行 SKILL.md 同级 `scripts/` 目录下的 `extract.js`、`gen-mapping.js` 和 `apply.js`
- 翻译以 AI 为主，Google Translate API 作为可选辅助；API 不可用时 AI 直接接管
- 输出文件默认命名为 `<原名>_translated.ts`，不会覆盖原文件

## 版本

v1.1.0 — extract/gen-mapping/apply 三阶段流水线 + AI 翻译为主、API 可选辅助
