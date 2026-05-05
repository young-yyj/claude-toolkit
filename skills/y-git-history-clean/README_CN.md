# Y·Git 历史清理

一键重写 git 仓库的全部提交历史：去除 `Co-Authored-By` 尾缀、统一作者名、恢复附注标签。

## 红线（绝对不可逾越）

- **禁止增删改任何 commit 中的项目文件**。仅允许修改 message、author、committer
- **禁止增删任何一条 commit 记录**。commit 数量必须不变
- **禁止修改任何时间信息**。author date、commit date、tagger date 全部保持原值

## 适用场景

- 批量清除 commit message 中不需要的尾缀行（如 `Co-Authored-By: ...`）
- 统一仓库中不一致的 author/committer 名称（支持多选一 + "不做更改"选项）
- 重写历史后恢复标签（区分轻量/附注标签，含 annotation 内容及 tagger 信息）

## 使用方式

在 Claude Code 中提及以下即可触发：

- "帮我清理 git 提交历史中的 Co-Authored-By"
- "统一 git 作者名"
- "整理 git 历史元数据"

## 执行步骤概览

| 步骤 | 内容 |
|------|------|
| 1. 审计 | 扫描全部 commit 尾缀行、记录 commit 总数、列出所有作者名、列出标签及类型 |
| 2. 重写 | `git filter-branch` 清理 message（+ 可选统一作者名）。用户可选择目标名或"不做更改" |
| 3. 验证分支 | 校验 commit 数量不变、尾缀已清除、作者名与预期一致（区分"不做更改"场景） |
| 4. 恢复标签 | 轻量标签直接迁移；附注标签从悬空对象抢救 tagger 信息 + annotation 内容并重建（含 tag message 尾缀清理） |
| 5. 终验 | 标签指向、tagger 信息、annotation 内容、commit 作者全部核对 |
| 6. 记忆 | 保存 feedback memory 防止再次添加已清理的尾缀 |

## 注意事项

- 会重写全部 commit SHA，属于历史重写操作
- 远程跟踪分支不会被自动更新，需手动 `git push --force --tags`
- 附注标签的 tagger 信息（姓名、邮箱、时间戳）和 annotation 内容重建时注意保留
- 唯一允许的修改手段：`--msg-filter`（sed 删行）和 `--env-filter`（改作者名）；禁止 `--tree-filter`、`--index-filter`、`--commit-filter`

## 版本

v1.1.0 — 新增三条红线、作者多选一与"不做更改"选项、tag message 尾缀清理
