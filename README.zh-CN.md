**[English](./README.md) | [中文](./README.zh-CN.md)**

---

# SkillRelay

> 你的 Agent 技能中继站。

SkillRelay 是一个以 CLI 为核心的本地技能仓库与多 Agent 桥接工具，支持跨 AI Agent（如 Hermes、OpenClaw、Claude Code、OpenCode、Codex 等）进行技能的发现、导入、同步、转换与发布。

---

## 为什么需要 SkillRelay

随着 AI Agent 能力不断增强，技能和工作流正在成为越来越有价值的资产。然而今天，技能往往分散在不同工具、不同格式、不同本地目录中——没有标准化的方式在 Agent 之间迁移它们。

SkillRelay 通过以下方式解决这一碎片化问题：

- 一个**本地统一仓库**，作为所有 Agent 技能的中心枢纽
- 一套**适配器体系**，将技能转换为各 Agent 的原生格式
- 一条**完整生命周期流程**：发现 → 导入 → 适配 → 同步 → 发布

目标不是让每个 Agent 加载所有技能，而是给你一个统一管理所有技能的地方，并以一致的方式将技能送达目标 Agent。

SkillRelay 是一个本地工具 —— 它运行在你的机器上并维护本地仓库。它不是共享的全局运行时，也不是云端托管服务。

## 核心概念

| 概念 | 说明 |
|---|---|
| **Skill（技能）** | 一个可复用的 Agent 知识、工作流或能力单元 |
| **Source（来源）** | 技能的获取来源 —— SkillHub、GitHub 仓库、本地目录，或其他 Agent 的技能目录 |
| **Registry（仓库）** | 本机上的规范存储，保存所有已纳管的技能 |
| **Adapter（适配器）** | 针对特定 Agent 的集成层，负责导入、导出、格式转换和同步 |

## 计划功能

- 本地技能仓库
- 多来源发现与搜索
- 导入与导出工作流
- 针对不同 Agent 的适配
- 仓库与 Agent 之间的 pull / push / sync
- 技能格式转换
- 校验与健康检查
- 版本追踪与冲突处理
- 可信度与安全检查
- 将技能发布回外部来源
- 可扩展的来源与适配器体系

## 工作流程

```
外部来源              -->   本地仓库    -->   Agent
（SkillHub、Git、            （本机）         （Hermes、Claude、
  本地目录……）                                 OpenClaw……）

                <--   双向流转   <--
```

典型的 SkillRelay 使用流程：

1. 从外部来源或其他 Agent **发现**一个技能
2. 将其**导入**本地仓库
3. 为目标 Agent 的格式进行**适配**
4. **同步**到该 Agent
5. 可选：将技能**发布**回外部来源

## CLI

主命令为 `skillrelay`（计划短别名：`sr`、`relay`）。

```
skillrelay search <query>               # 搜索仓库和来源中的技能
skillrelay install <source>             # 从来源导入技能到本地仓库
skillrelay push <agent> <skill>         # 将技能推送到指定 Agent
skillrelay pull <agent> <skill>         # 从指定 Agent 拉取技能
skillrelay sync <agent>                 # 与指定 Agent 同步仓库
skillrelay publish <skill>              # 准备技能制品或发布到已配置的外部来源
skillrelay status <skill>               # 查看技能所在位置及其同步状态
skillrelay source add <url>             # 添加技能来源
skillrelay source list                  # 列出已配置的来源
skillrelay source enable/disable <name> # 启用或停用某个来源
skillrelay list                         # 列出仓库中的技能
skillrelay info <skill>                 # 查看技能详情
```

> 注意：以上命令为计划内容，可能在设计阶段调整。

## 文档

| 文档 | 说明 |
|---|---|
| [架构设计](./docs/zh-CN/architecture.md) | 核心组件、数据流与设计原则 |
| [开发路线图](./docs/zh-CN/roadmap.md) | 各阶段开发计划 |
| [设计讨论](./docs/design-discussion.md) | 项目原始设计笔记 |
| [贡献指南](./CONTRIBUTING.zh-CN.md) | 如何参与贡献 |

## 项目状态

**SkillRelay 目前处于设计与规划阶段。**

仓库目前包含文档和架构定义，尚未开始实现。欢迎对设计、架构和文档提出贡献。

详见[开发路线图](./docs/zh-CN/roadmap.md)。

## 参与贡献

欢迎贡献！请阅读 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md) 了解如何开始。

## 许可证

[MIT](./LICENSE)
