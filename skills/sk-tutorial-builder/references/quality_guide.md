# 内容质量评估与来源优先级

## 来源可信度评级

### S 级（最高可信）
- 官方文档（PyTorch Docs、HuggingFace Docs、OpenAI API Docs）
- arXiv 原版论文
- 顶会论文（NeurIPS / ICML / ICLR / ACL / CVPR）
- 官方 GitHub 仓库 README 和 Wiki

### A 级（高可信）
- 高引用率技术博客（Towards Data Science、Jay Alammar 等）
- 微信公众号高质量公号（机器之心、量子位、PaperWeekly、AI 有道等）
- 知乎大 V 专栏（>1000 赞）
- Papers With Code 模型卡片

### B 级（中等可信，需交叉验证）
- CSDN、掘金、博客园技术文章
- 一般 GitHub 项目
- YouTube / Bilibili 技术视频文字整理
- 问答社区（Stack Overflow、知乎问答）

### C 级（参考用，不作为主要来源）
- 营销类文章
- 无代码示例的纯理论讲解
- 超过 2 年未更新的内容（前沿 AI 领域）

---

## 内容质量检查清单

在生成每个章节之前，检查收集到的素材是否满足：

| 维度 | 要求 |
|------|------|
| 准确性 | 至少 2 个独立来源交叉验证核心概念，低可信（B/C 级）来源需重点核实 |
| 时效性 | 前沿模型/工具优先使用 2024-2026 年来源 |
| 可操作性 | 关键步骤有可运行代码示例 |
| 完整性 | 覆盖基础篇→进阶篇→高级篇三个层次 |
| 字数 | 全文字数 ≥ 20000 字 |

---

## 搜索策略优化

### 英文搜索词模板
```
"{topic}" tutorial beginner to advanced 2024 OR 2025
"{topic}" explained in depth paper
"{topic}" implementation from scratch pytorch
"{topic}" best practices production 2025
"{topic}" vs "{related_topic}" comparison
```

### 中文搜索词模板
```
{主题} 从零到精通 教程
{主题} 原理详解 代码实现
{主题} 实战 踩坑 总结
{主题} 入门 {年份}
{主题} 面试题 知识点总结
```

也可配合 `site:` 限定平台：
```
site:zhuanlan.zhihu.com "{知识点}"
site:blog.csdn.net "{知识点}"
site:juejin.cn "{知识点}"
```

### 微信公众号搜索词（使用 `web_search` + `site:mp.weixin.qq.com`）
```
{主题} 教程
{主题} 原理
{主题} 实战案例
{主题} 最新进展
```
注意：搜索时加上时间参数，如 `2025`、`2026`。

---

## 内容去重策略

1. **完全重复**：保留质量评级最高的那份
2. **部分重复**：整合不同来源的补充信息
3. **观点冲突**：保留两种观点，说明适用场景
4. **版本差异**：明确标注各版本差异（如 LangChain v0.1 vs v0.3）

---

## 内容生成规范

### 每章节应包含
- 清晰的概念说明（避免空话）
- 具体的代码示例（可运行）
- 实际应用场景举例
- 小结或要点列表

### 代码示例要求
- 使用恰当的编程语言（AI 领域默认 Python）
- 包含必要注释
- 示例从简单到复杂递进
- 注明适用版本（如 `# Python 3.10+, PyTorch 2.0+`）
