**[English](./README.md) | [中文](./README.zh-CN.md)**

---

# SkillRelay

> 你的 Agent 技能中继站。

SkillRelay 是一个以 CLI 为核心的本地技能仓库与多 Agent 桥接工具，支持跨 AI Agent（如 Hermes、Claude Code、OpenClaw、OpenCode、Codex 等）进行技能的发现、导入、同步、转换与发布。

[![许可证: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node ≥ 20](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)

---

## 为什么需要 SkillRelay

随着 AI Agent 能力不断增强，技能和工作流正在成为越来越有价值的资产。然而今天，技能往往分散在不同工具、不同格式、不同本地目录中——没有标准化的方式在 Agent 之间迁移它们。

SkillRelay 通过以下方式解决这一碎片化问题：

- 一个**本地统一仓库**，作为所有 Agent 技能的中心枢纽
- 一套**适配器体系**，将技能转换为各 Agent 的原生格式
- 一条**完整生命周期流程**：发现 → 导入 → 适配 → 同步 → 导出
- 一个**双向生命周期**：Agent 原生技能可以流回本地仓库，再发布到外部来源

目标不是让每个 Agent 加载所有技能，而是给你一个统一管理所有技能的地方，并以一致的方式将技能送达目标 Agent。

SkillRelay 是一个本地工具 —— 它运行在你的机器上并维护本地仓库。它不是共享的全局运行时，也不是云端托管服务。

---

## 安装

```bash
npm install -g skillrelay
```

需要 **Node.js ≥ 20**。

---

## 快速上手

```bash
# 1. 初始化本地仓库（默认路径：~/.skillrelay）
skillrelay init

# 2. 从本地 Markdown 文件导入技能
skillrelay import ./my-skill.md

# 3. 从已安装的 Hermes 技能导入
skillrelay import hermes:code-review

# 4. 列出仓库中的所有技能
skillrelay list

# 5. 将技能导出到 Claude Code 的命令目录
skillrelay export <skill-id> claude

# 6. 检查仓库健康状态
skillrelay doctor
```

---

## 核心概念

| 概念 | 说明 |
|---|---|
| **技能（Skill）** | 可复用的 Agent 知识、工作流或能力单元 |
| **来源（Source）** | 技能的来源 —— 本地文件、Git 仓库或其他 Agent 的技能目录 |
| **仓库（Registry）** | 存储在本地机器上的规范化技能中心 |
| **适配器（Adapter）** | 每个 Agent 的集成层，处理导入、导出、格式转换和同步 |

---

## 工作流

```
外部来源          -->  本地仓库           -->  目标 Agent
（本地文件、Git、      (~/.skillrelay)         （Hermes、Claude、
  Hermes、…）                                   OpenClaw、…）

              <--      双向流转      <--
```

典型的 SkillRelay 流程：

1. **发现**：从本地文件或另一个 Agent 发现技能
2. **导入**：将技能导入本地仓库
3. **搜索**：使用本地搜索引擎查找技能
4. **导出**：将技能导出为另一个 Agent 的原生格式
5. **更新**：当来源变更时重新导入

---

## 命令参考

### `skillrelay init`

初始化本地仓库。

```bash
skillrelay init                       # 使用默认路径 ~/.skillrelay
skillrelay --registry ./my-reg init   # 指定自定义路径
```

---

### `skillrelay import <path>`

从本地文件、目录或 Hermes 导入技能到仓库。

```bash
skillrelay import ./skill.md          # 从 SKILL.md 文件导入
skillrelay import ./my-skill-dir/     # 从包含 SKILL.md 的目录导入
skillrelay import hermes:code-review  # 从已安装的 Hermes 技能拉取

# 选项
skillrelay import ./skill.md --dry-run          # 解析但不写入
skillrelay import ./skill.md --name my-skill    # 覆盖检测到的名称
skillrelay import hermes:code-review --json     # JSON 输出
```

---

### `skillrelay list`

列出仓库中的所有技能。

```bash
skillrelay list
skillrelay list --json
```

---

### `skillrelay info <skill-id>`

查看单个技能的完整详情。支持精确 ID 或名称前缀匹配。

```bash
skillrelay info my-skill-a1b2c3d4e5
skillrelay info my-skill              # 前缀匹配
skillrelay info my-skill --json
```

---

### `skillrelay status <skill-id>`

查看技能的仓库状态、来源及各适配器同步状态。

```bash
skillrelay status my-skill-a1b2c3d4e5
skillrelay status my-skill --json
```

---

### `skillrelay search [query]`

按名称、摘要、描述、标签、分类和作者搜索本地仓库。

```bash
skillrelay search "代码审查"
skillrelay search --tag typescript
skillrelay search --category productivity --limit 10
skillrelay search --json
```

---

### `skillrelay validate <skill-id>`

验证技能的元数据和内容，并更新仓库中的 `validation_state`。

```bash
skillrelay validate my-skill-a1b2c3d4e5
skillrelay validate my-skill --json
```

---

### `skillrelay export <skill-id> <agent>`

将技能从仓库导出为 Agent 原生格式。

**支持的 Agent：** `hermes`、`claude`

```bash
# 导出到 Hermes（默认写入 ~/.hermes/skills/）
skillrelay export my-skill-a1b2c3d4e5 hermes
skillrelay export my-skill hermes --target ~/custom/path

# 导出到 Claude Code（默认写入 ~/.claude/commands/）
skillrelay export my-skill-a1b2c3d4e5 claude
skillrelay export my-skill claude --overwrite  # 已存在则覆盖

# 通用选项
skillrelay export my-skill hermes --dry-run    # 预览，不实际写入
skillrelay export my-skill claude --json       # JSON 输出
```

---

### `skillrelay update <skill-id>`

从原始来源 URI 重新导入技能，保留仓库状态和适配器同步元数据。

```bash
skillrelay update my-skill-a1b2c3d4e5
skillrelay update my-skill --dry-run
skillrelay update my-skill --json
```

---

### `skillrelay remove <skill-id>`

软删除仓库中的技能（目录重命名保留，可恢复）。

```bash
skillrelay remove my-skill-a1b2c3d4e5 --confirm
skillrelay remove my-skill --confirm --json
```

---

### `skillrelay doctor`

检查仓库健康状态：初始化、孤立目录、损坏技能、软删除条目。

```bash
skillrelay doctor                     # 健康退出 0，有问题退出 1
skillrelay doctor --json
```

---

### `skillrelay config`

获取、设置或删除配置项。

```bash
skillrelay config get                          # 查看所有配置
skillrelay config get log_level                # 查看单个配置项
skillrelay config set default_adapter claude   # 设置值
skillrelay config set color false              # 禁用颜色输出
skillrelay config unset default_adapter        # 删除配置项
skillrelay config get --json
```

**允许的配置键：** `default_registry`、`default_adapter`、`color`、`log_level`

---

### `skillrelay source`

管理技能来源（持久化存储于 `sources.yaml`）。

```bash
skillrelay source add https://example.com/skills
skillrelay source list
skillrelay source list --json
skillrelay source enable <source-id>
skillrelay source disable <source-id>
skillrelay source remove <source-id>
```

---

## 全局选项

所有命令均支持以下顶级选项：

| 选项 | 说明 |
|---|---|
| `--registry <path>` | 覆盖仓库根路径（默认：`~/.skillrelay`） |
| `--json` | 输出 JSON 而非人类可读文本 |
| `--no-color` | 禁用 ANSI 颜色输出 |
| `--quiet` | 屏蔽信息输出，仅显示错误 |
| `--version` | 显示版本号 |
| `--help` | 显示帮助信息 |

---

## 退出码

| 代码 | 含义 |
|---|---|
| `0` | 成功 |
| `1` | 通用错误或健康检查发现问题 |
| `2` | 仓库未初始化 |
| `3` | 技能未找到 |
| `4` | 冲突（技能已存在于目标位置） |
| `5` | 适配器不可用 |

---

## 文档

| 文档 | 说明 |
|---|---|
| [架构设计](./docs/architecture.md) | 核心组件、数据流与设计原则 |
| [路线图](./docs/roadmap.md) | 已完成阶段与规划中功能 |
| [变更日志](./CHANGELOG.md) | 版本历史 |
| [贡献指南](./CONTRIBUTING.md) | 如何参与贡献 |

---

## 项目状态

**SkillRelay v0.1.0 是首个可用版本。**

核心仓库、导入/导出流程、搜索、健康检查、配置、更新命令及适配器体系（Hermes + Claude）均已实现并通过测试，共 295 条测试，覆盖率 ≥ 93%。

---

## 贡献

欢迎参与贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详情。

## 许可证

[MIT](./LICENSE)
