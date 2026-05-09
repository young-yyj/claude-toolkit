# README.md 双语模板

## 使用说明

此模板用于生成单文件双语 README.md。中文在上半部分，英文在下半部分，用 `---` 分隔线隔开。

生成时根据项目实际文件结构填充 `{PLACEHOLDER}` 内容，**不允许虚构项目信息**。

---

## 模板正文

```markdown
# {项目名称}

## 项目简介

{根据项目文件结构生成 2-3 句中文描述，说明项目用途和核心功能}

## 技术栈

{列出项目使用的主要技术/框架/语言}

## 安装与使用

### 环境要求

{列出运行环境要求}

### 安装

```bash
{根据技术栈生成安装命令}
```

### 使用

```bash
{根据项目入口文件生成运行命令}
```

## 项目结构

```
{根据实际目录结构列出主要文件和目录，不超过 2 级深度}
```

---

# {Project Name}

## Overview

{English description of the project — 2-3 sentences corresponding to Chinese version}

## Tech Stack

{Technologies used in English}

## Installation & Usage

### Prerequisites

{Prerequisites in English}

### Installation

```bash
{Installation commands}
```

### Usage

```bash
{Run commands}
```

## Project Structure

```
{Project directory tree — same as Chinese section}
```
```

---

## 质量检查清单

生成 README 后，逐项确认：

- [ ] 项目名称正确
- [ ] 中文和英文部分信息一致
- [ ] 安装/运行命令可在项目中复现
- [ ] 项目结构反映实际目录树（不超过 2 级深度）
- [ ] 不包含任何敏感信息（密钥、密码、邮箱）
- [ ] 中文部分 >= 100 字
- [ ] 英文部分 >= 80 词

---

## 按项目类型的章节建议

| 项目类型 | 建议额外章节 |
|----------|-------------|
| WPF/桌面应用 | 截图/功能列表 |
| Web 前端 | API 文档链接 / 部署地址 |
| Python 库 | pip 安装 / 基础示例 |
| Go CLI | 编译安装 / 命令行示例 |
| Node.js 服务 | 环境变量说明 / Docker 部署 |
