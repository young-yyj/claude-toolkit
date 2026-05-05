---
name: y-git-history-clean
description: 重写 git 提交历史，去除 Co-Authored-By 尾缀、统一作者名、恢复 filter-branch 后悬空的附注标签。当用户要求清理 commit message、移除 co-authored-by 行、统一作者信息、或修复 git 历史元数据时触发。也适用于用户提到"整理 git 历史""去除提交尾缀""统一 git 作者"等场景。
---

# Y·Git 历史清理

重写当前分支的全部提交历史，去除不需要的 commit message 尾缀、统一作者身份，并在重写后恢复标签（含附注标签的 annotation 内容）。

## 红线（绝对不可逾越）

- **禁止增删改任何 commit 中的项目文件。**只允许修改 commit 的元信息（message、author、committer），每个 commit 对应的文件树（tree）必须逐字节保持不变。
- **禁止增删任何一条 commit 记录。**commit 数量必须与重写前一致，不允许新增、合并、拆分或删除任何 commit。
- **禁止修改任何时间信息。**author date、commit date、tagger date 全部保持原值。即使是由用户主动要求修改时间，也须拒绝并申明此条红线。

满足上述约束的方式：`git filter-branch` 的 `--msg-filter` 仅用 `sed` 删除目标行，`--env-filter` 仅修改 `GIT_AUTHOR_NAME` / `GIT_COMMITTER_NAME` 环境变量。禁止使用 `GIT_AUTHOR_DATE`、`GIT_COMMITTER_DATE`（唯一例外：步骤 4 恢复附注标签时，允许用 `GIT_COMMITTER_DATE` 保留原始 tagger 时间戳，而非修改）。不触及 tree 对象和 parent 链。

## 执行流程

严格按以下顺序执行，不得跳过验证步骤。

### 1. 审计阶段

修改前先摸清全貌。

```bash
# 列出全部 commit 及 message，检查 Co-Authored-By 等不需要的尾缀行
git log --all --format="%h %s%n%b%n---"

# 记录 commit 总数（供步骤 3 对比）
git rev-list --count master

# 检查所有唯一的作者名
git log --all --format="%an <%ae>" | sort -u

# 列出全部标签及其类型（commit = 轻量标签，tag = 附注标签）
git tag -l --format="%(refname:short) %(objecttype) %(objectname:short)"
```

将审计结果汇报给用户，逐项确认：

**① 要删除的 message 行：**列出所有出现的尾缀行（如 `Co-Authored-By: ...`），确认是否全部删除。

**② 作者名统一：**如果 `sort -u` 输出超过一个作者名，则列出**全部**作者名，编好序号，供用户选择统一成哪一个。选项末尾必须附加一个**"不做更改"**选项（跳过作者名修正，仅清理 message）。格式如下：

```
发现 N 个不同的作者名：
1. name1 <email1> — N1 条 commit
2. name2 <email2> — N2 条 commit
3. 不做更改（跳过作者名修正）

请选择要统一成哪一个作者名：
```

等用户做出选择后，将非目标作者名逐一映射到目标名（使用步骤 2 的 `--env-filter`）。若用户选择了"不做更改"，则步骤 2 省略 `--env-filter` 参数。

**③ 附注标签：**列出所有 `objecttype` 为 `tag` 的标签，告知用户这些标签在重写后需要手动恢复。

### 2. 重写历史

使用 `git filter-branch` 完成 message 清理。作者名修正根据用户选择决定是否执行。

**如果用户选择了目标作者名**（需要统一作者）：

```bash
git filter-branch -f \
  --msg-filter "sed '/^Co-Authored-By:/d'" \
  --env-filter 'if [ "$GIT_AUTHOR_NAME" = "OLD_NAME1" ] || [ "$GIT_AUTHOR_NAME" = "OLD_NAME2" ]; then
                  export GIT_AUTHOR_NAME="NEW_NAME"
                  export GIT_COMMITTER_NAME="NEW_NAME"
                fi' \
  -- master
```

**如果用户选择了"不做更改"**（仅清理 message）：

```bash
git filter-branch -f \
  --msg-filter "sed '/^Co-Authored-By:/d'" \
  -- master
```

- `--msg-filter`：用 sed 删除目标行
- `--env-filter`：修正作者名（同时修正 AUTHOR 和 COMMITTER）
- `-- master`：只重写 master 分支，避免波及远程跟踪分支

**关键提醒**：`filter-branch` 只重写分支引用，标签不会被自动更新。进入步骤 3。

### 3. 验证分支

在修复标签之前，先确认分支已干净。以下校验逐条执行，任何一条不通过都须中止并排查原因。

```bash
# ① commit 数量必须与重写前一致（红线第②条）
git rev-list --count master
# 与审计阶段记录的数值对比，不一致则中止

# ② 确认 master 上不再有目标尾缀行
git log master --format="%b" | grep "Co-Authored-By" || echo "尾缀已清除"

# ③ 确认作者名
git log master --format="%an" | sort -u
```

校验 ③ 的判定：若用户在步骤 ② 选了"不做更改"，此处输出多个名字属于正常，仅需确认名单与步骤 1 审计结果一致、无意外的新名字出现。若选了统一到某个作者，此处应只输出一个名字，多于一个则须中止。

### 4. 恢复标签

`filter-branch` 只重写了分支上的 commit，**标签不受影响**——它们仍指向旧 commit（重写后已变成悬空对象，不可达）。因此必须将标签重新指向重写后的新 commit。

逐标签处理，流程如下：

**第一步：找到标签对应的新 commit SHA。**用原 commit subject 中的关键词搜索：

```bash
git log master --oneline --grep="原 commit subject 关键字"
```

**第二步：根据标签类型分别处理。**

**轻量标签**（步骤 1 中类型为 `commit`）——无额外信息，直接移动指向：

```bash
git tag -f TAG_NAME NEW_SHA
```

**附注标签**（步骤 1 中类型为 `tag`）——包含独立于 commit 的元信息，全部需要恢复。轻量标签的 `git tag -f` 覆盖操作会**永久丢失**附注标签对象。因此必须先从悬空对象中抢救原始内容。

用步骤 1 记录的 `OLD_TAG_SHA` 提取原始 tag 对象：

```bash
git cat-file -p OLD_TAG_SHA
```

输出包含以下信息，每一项都需恢复：

```
object <old-commit-sha>    ← 仅作参考，重建时指向 NEW_SHA
type commit
tag <tag-name>             ← 标签名（保持不变）
tagger <name> <email> <timestamp> <timezone>  ← 标签者信息（保留）
                           ← 空行
<tag-message>              ← 附注内容（保留，若含尾缀则一并清理）
```

将 tag message 保存到一个临时变量，**人工逐行检查**其中是否也含有尾缀行。若有，用 sed 清理后再传入 `-m`。不能跳过检查——tag message 是独立于 commit message 的文本，filter-branch 不会触及它。

重建附注标签，保留 tagger 时间戳和清理后的 message：

```bash
# 将有尾缀的 tag message 清理后赋值给 CLEANED_MSG
CLEANED_MSG="$(echo "$ORIGINAL_TAG_MSG" | sed '/^Co-Authored-By:/d')"

GIT_COMMITTER_DATE="原始 timestamp 和 timezone" \
  git tag -f -a TAG_NAME NEW_SHA -m "$CLEANED_MSG"
```

注意：附注标签重建后成为**新的 tag 对象**（SHA 会变），但标签名、message、tagger 信息和指向的目标 commit 均正确还原。

### 5. 最终验证

```bash
# 确认所有标签指向正确 commit
git tag -l --format="%(refname:short) %(objecttype) %(subject)"

# 确认附注标签的 tagger 信息完整（姓名、邮箱、日期）
git tag -l --format="%(refname:short) | tagger: %(taggername) %(taggeremail) %(taggerdate:iso)" TAG_NAME

# 确认附注标签的 annotation 内容完整
git tag -l --format="%(contents)" TAG_NAME

# 确认标签指向的 commit 作者正确
git log TAG_NAME --format="%an" -1
```

### 6. 长期记忆

保存 feedback memory，确保后续 session 中不会再添加已被清理的尾缀行。

## 注意事项

- **红线重申**：`--msg-filter` 和 `--env-filter` 是唯一允许的修改手段。禁止使用 `--tree-filter`、`--index-filter`、`--commit-filter`。禁止使用 `GIT_AUTHOR_DATE`、`GIT_COMMITTER_DATE`（步骤 4 标签恢复除外）。即使由用户主动要求，也不得违背上述三条红线。
- `git filter-branch` 会重写全部 commit SHA，这是一次历史重写。
- `origin/master` 等远程跟踪分支不会被更新——用户需手动 `git push --force --tags` 同步远端。
- 未经用户明确指示，不得 force push 到 main/master。
- 使用 `--all` 会重写仓库中所有引用，通常不需要，`-- master` 即可。
- 附注标签含有 `tagger` 头部（姓名、邮箱、时间戳），重建时注意保留。
