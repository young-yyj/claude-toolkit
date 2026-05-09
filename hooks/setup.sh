#!/usr/bin/env bash
# 一键安装 commit-msg hook 到全局或当前仓库
# 用法：
#   ./setup.sh           # 全局安装（推荐，所有仓库生效）
#   ./setup.sh --local   # 仅当前仓库生效
set -e

HOOK_SRC="$(cd "$(dirname "$0")" && pwd)/commit-msg"

if [ ! -f "$HOOK_SRC" ]; then
  echo "错误：未找到 commit-msg hook 文件"
  exit 1
fi

if [ "$1" = "--local" ]; then
  TARGET="$(git rev-parse --show-toplevel)/.git/hooks/commit-msg"
  cp "$HOOK_SRC" "$TARGET"
  chmod +x "$TARGET"
  echo "已安装到当前仓库：$TARGET"
else
  mkdir -p "$HOME/.git-hooks"
  cp "$HOOK_SRC" "$HOME/.git-hooks/commit-msg"
  chmod +x "$HOME/.git-hooks/commit-msg"
  git config --global core.hooksPath "$HOME/.git-hooks"
  echo "已全局安装：$HOME/.git-hooks/commit-msg"
  echo "git config core.hooksPath = $HOME/.git-hooks"
fi
