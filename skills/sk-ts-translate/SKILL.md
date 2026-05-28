---
name: sk-ts-translate
description: |
  Process Qt Linguist TS files with type="unfinished" entries. AI translates source text to target language (Google Translate API as optional assist), removes unfinished markers while preserving all XML formatting except translation elements. Uses bundled extract.js/apply.js — source files are read-only, output to _translated.ts.
  触发词：TS 文件翻译、Qt Linguist、unfinished 翻译、批量翻译、? 标记翻译。
effort: medium
context: default
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

## 🚨 CRITICAL — 三条红线

1. **源文件只读**：绝不修改原始 `.ts` 文件。翻译结果输出到 `<原名>_translated.ts`
2. **必须使用 bundled 脚本**：`extract.js` 提取、`apply.js` 应用，禁止手动正则替换 XML
3. **API 失败直接 AI 翻译**：不再 fork 子进程调用 API，由当前会话 AI 直接翻译

---

# TS Translate — Qt Linguist TS 文件翻译工具

## 功能说明

处理 Qt Linguist TS (`.ts`) XML 文件中所有 `type="unfinished"` 条目。通过 AI 翻译（Google Translate API 可选辅助）将源文本翻译为目标语言，移除 unfinished 标记，同时严格保留所有非 translation 元素的 XML 格式。

核心约束：
- **源文件只读，绝不修改**。翻译结果始终输出到新文件：`<原文件名>_translated.ts`。
- **仅修改 `<translation>` 元素**。其余所有字节——`<message>`、`<location>`、`<source>`、`<oldsource>`、空白、换行——原样保留。

---

## When to Use

- 用户提到 TS 文件翻译、Qt Linguist `?` 标记、清理 unfinished 翻译
- 批量填充 TS 文件中的未完成条目
- 需要自动化处理多语言 TS 翻译文件

## When NOT to Use

- 翻译非 TS 格式的文件（如 JSON、YAML、PO 文件）
- 用户只需要翻译单个字符串（直接翻译即可，无需走完整流程）
- TS 文件中没有 `type="unfinished"` 条目

---

## Constraints

**源文件保护：**
- 源 TS 文件**不可改动**。翻译结果必须输出到新文件：`<原文件名>_translated.ts`
- `apply.js` 的第三个参数（输出路径）不得与输入路径相同；必须使用默认的 `_translated` 后缀或用户另行指定的新文件名

**格式安全：**
- 仅允许修改 `<translation>` 元素内容，禁止重构或修改 `<message>`、`<location>`、`<source>` 等标签
- 必须使用 bundled `apply.js` 执行翻译应用，不得手动替换——手动替换容易破坏 XML 结构

**翻译质量：**
- 翻译以 AI 为主（`context: default` 保证始终可用），Google Translate API 可选辅助
- 翻译风格应参考文件中已完成条目的用词保持一致性
- 不翻译的条目类型（纯数值、Qt 占位符、已国际化字符串等）详见 Step 3 格式保留规则

**特殊字符处理：**
- 源文本中的换行符必须在译文对应位置保留，不得删除或合并行
- 翻译过程中所有空格、换行、制表符等空白字符均使用 Qt Linguist 原生字面量（即 XML 中的实际字符），不转换为 HTML 实体或转义序列

**顺序保证：**
- 提取和应用的顺序必须与文件中的出现顺序严格一致——`extract.js` 和 `apply.js` 已保证此约束

---

## 脚本定位

本 skill 的 `extract.js`、`gen-mapping.js` 和 `apply.js` 位于 SKILL.md 同级 `scripts/` 子目录。执行前先确认脚本所在的实际路径：

```
<skill-base>/scripts/extract.js
<skill-base>/scripts/gen-mapping.js
<skill-base>/scripts/apply.js
```

`<skill-base>` 即 SKILL.md 所在目录，可能为：
- 项目安装：`.claude/skills/sk-ts-translate`
- 用户全局：`~/.claude/skills/sk-ts-translate`

使用 Glob 或 Bash 确认实际路径后再执行后续步骤。

若两个位置均找不到脚本文件，**暂停执行并告知用户**：说明已尝试的路径，请用户确认 skill 是否正确安装。

---

## 执行流程

### Step 1: 发现 TS 文件

使用 Glob 工具递归扫描项目目录中所有 `.ts` 文件：

```
Glob pattern="**/*.ts"
```

若数量较多，询问用户处理全部还是部分。

### Step 2: 提取未完成条目

对每个 TS 文件，使用 bundled `extract.js` 提取所有含 `type="unfinished"` 的 message 块。提取按文件中的出现顺序进行——该顺序对 Step 5 的翻译应用至关重要。

```bash
node <skill-base>/scripts/extract.js <input.ts>
```

输出为 JSON 数组（`{src, trans}` 对象）到 stdout。打印结果供用户查看。

**确定语言对：**
- **目标语言**：从 `<TS version="2.1" language="it">` 的 `language` 属性提取
- **源语言**：检查文件中已完成翻译的条目，通过分析 source 文本的语言特征（字符集、编码范围）推断源语言。若推断不确定，直接询问用户确认源语言

### Step 3: 翻译

对每个未完成的源文本，生成目标语言的翻译。

**翻译策略（按优先级）：**

1. **AI 直接翻译（主要方案）**：当前会话 AI 根据双语知识直接翻译。参考已完成条目的术语保持一致性。这是 `context: default` 模式下的默认路径，确保翻译始终可用。

2. **Google Translate API（可选辅助）**：网络可达时可用 API 批量翻译作为参考。多条目用 `|` 分隔：
   ```
   https://translate.googleapis.com/translate_a/single?client=gtx&sl=<SOURCE>&tl=<TARGET>&dt=t&q=<TEXT>
   ```
   若 API 不可达，不影响流程——AI 翻译直接接管。

**格式保留规则：**
- **换行符**：源文本有换行时，译文必须在相同位置保留换行。不可将多行合并为一行，也不可新增换行
- **空白字符**：空格、制表符均使用 Qt Linguist 原生字面量，不转换为 `&nbsp;`、`&#9;` 等实体
- **保持原文的特殊情况**：
  - 纯数值：`0`、`X:728.998`
  - Qt 占位符：`%1`、`%2°`
  - 已国际化字符串：`Form`、`QEP:%1`

### Step 4: 生成映射文件

使用 bundled `gen-mapping.js` 衔接 extract 和 apply，根据目标语言生成 translations.json：

```bash
# 完整流水线（extract → gen-mapping → apply）
node <skill-base>/scripts/extract.js Korean.ts | \
  node <skill-base>/scripts/gen-mapping.js -l ko -o mapping.json
node <skill-base>/scripts/apply.js Korean.ts mapping.json

# 也支持从文件读取和输出到 stdout
node <skill-base>/scripts/gen-mapping.js extract.json -l ja > mapping.json
```

`gen-mapping.js` 内嵌翻译字典，查找每条 `src` 对应目标语言的译文，输出 apply.js 需要的 `[{src, trans}, ...]` 格式。

### Step 5: 应用翻译

使用 bundled `apply.js` 将翻译应用到**新文件**：

```bash
node <skill-base>/scripts/apply.js <input.ts> translations.json
```

**不可指定 output.ts 与 input.ts 相同**。默认输出为 `<input>_translated.ts`，源文件完整保留。

`apply.js` 使用 `fullMatch.replace(...)` 仅修改 `<translation type="unfinished">` 元素，绝不重构 `<message>` 包装标签——重构会导致换行折叠和标签合并。

### Step 6: 验证

对**输出文件**（`_translated.ts`）执行验证，源文件不做任何检查：

1. **零残留 unfinished：**
   ```bash
   grep -c 'type="unfinished"' <output_translated.ts>
   ```

2. **仅翻译行变更：**
   ```bash
   diff <original.ts> <output_translated.ts>
   ```
   每个 diff 块必须仅显示 `<translation>` 行的变更。源文件不得有任何改动。

### Step 7: 汇报

汇总：总处理数、分类统计（空白填充 vs 草稿定稿）、剩余 unfinished 数、输出文件路径。

---

## 常见问题

| 问题 | 原因 | 预防 |
|---|---|---|
| 翻译应用到错误的源文本 | 数组顺序与文件顺序不一致 | 使用 extract.js 确保正确顺序 |
| `<message>` 与 `<location>` 合并到一行 | 重构了 `<message>` 包装标签 | 使用 apply.js——仅操作 `<translation>` |
| 含 `<oldsource>` 的条目被遗漏 | 正则期望 `<translation>` 紧跟 `<source>` | apply.js 已处理此情况 |
| 多行草稿内容替换中断 | 非贪婪匹配在首个换行处停止 | apply.js 使用 `[\s\S]*?` |

---

## 参考资源

- `<skill-base>/scripts/extract.js` — 按文件顺序提取未完成条目到 JSON
- `<skill-base>/scripts/gen-mapping.js` — 衔接 extract 和 apply，生成翻译映射 JSON
- `<skill-base>/scripts/apply.js` — 安全应用翻译（仅修改 `<translation>` 元素）
