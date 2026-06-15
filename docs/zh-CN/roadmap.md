# SkillRelay 开发路线图

> **最后更新**：2026-06-15

## 当前阶段：v0.1.0 初始版本完成

SkillRelay v0.1.0 已交付 **17 条 CLI 命令**、**2 个 Agent 适配器**（Hermes + Claude）、**321 条测试**，长期项目愿景已实现 **约 76%**。完整验收记录见 [`acceptance.md`](./acceptance.md)。

---

## Phase 0 —— 基础建设 ✅

目标：建立项目骨架和核心数据结构。

- [x] TypeScript strict 模式、ESM、pnpm、tsup、vitest、Biome
- [x] 规范 `Skill` 数据结构（Zod schema、branded `SkillId`）
- [x] 文件系统仓库（ADR-0002）：每技能一目录、原子写
- [x] 可重现 Skill ID：`<normalized-name>-<10-hex-SHA-256>`
- [x] 导入流水线：识别来源类型、解析 YAML、构建规范记录
- [x] 仓库初始化 / 读 / 写 / 软删除

## Phase 1 —— 核心 CLI ✅

目标：可管理本地仓库的完整 CLI。

- [x] `skillrelay init` —— 初始化本地仓库
- [x] `skillrelay list` —— 列出本地仓库技能
- [x] `skillrelay import <path>` —— 从本地路径导入
- [x] `skillrelay import hermes:<name>` —— 从已安装的 Hermes 拉取
- [x] `skillrelay info <skill>` —— 查看技能详情
- [x] `skillrelay status <skill>` —— 查看仓库与各 Agent 同步状态
- [x] `skillrelay validate <skill>` —— 校验技能元数据与内容
- [x] `skillrelay remove <skill>` —— 软删除
- [x] `skillrelay source add/remove/list/enable/disable` —— 来源管理
- [x] `skillrelay search [query]` —— 本地搜索（名称/摘要/标签/分类/作者）
- [x] `skillrelay doctor` —— 仓库健康检查
- [x] 构建管线：tsup 产出 `dist/`，可发布 npm 包

## Phase 2 —— Agent 适配器 ✅

目标：将仓库与真实 Agent 打通。

- [x] Hermes 适配器：detect / discover / import / export / status / validate
- [x] Claude Code 适配器：detect / discover / import / export（YAML 前置元数据） / status / validate
- [x] `skillrelay export <skill> hermes` —— 导出到 Hermes 原生格式
- [x] `skillrelay export <skill> claude` —— 导出到 Claude Code 命令目录
- [x] `skillrelay config get/set/unset` —— 用户配置（`default_registry / default_adapter / color / log_level`）
- [x] `skillrelay update <skill>` —— 从原始来源刷新，保留仓库与适配器状态

## Phase 3 —— 覆盖率与构建验证 ✅

目标：补齐覆盖率，验证发布包可用。

- [x] 适配器 registry 单元测试
- [x] hermes/validate.ts、hermes/import.ts、HermesAdapter、ClaudeAdapter 的 class 单元测试
- [x] 构建验证：`pnpm build` 成功，`node dist/cli/index.js --version` 可运行
- [x] 覆盖率 ≥ 93%（阈值 80%）

## Phase 4 —— 信任与批量同步 ✅

目标：技能级安全标注与批量导出。

- [x] `skillrelay trust <skill> <level>` —— 写入 `safety.trust_level`
- [x] `skillrelay sync <agent>` —— 批量导出所有活动技能，支持 `--dry-run / --overwrite / --json`

## Phase 5 —— 标签与格式转换 ✅

目标：原地元数据编辑与无需仓库的格式互转。

- [x] `skillrelay tag <skill>` —— 列表 / `--add` / `--remove` / `--set`
- [x] `skillrelay convert --from <fmt> --to <fmt>` —— Hermes ↔ Claude 双向转换（无需仓库）

## Phase 6 —— 验收文档 ✅

目标：将项目愿景对照已交付实现，给出清晰的完成度报告。

- [x] [`docs/acceptance.md`](../acceptance.md) —— 英文验收报告，含 19 项愿景映射
- [x] [`docs/zh-CN/acceptance.md`](./acceptance.md) —— 中文镜像
- [x] 工程指标：321 测试、93.77% 覆盖、0 lint、0 type 错、构建通过
- [x] `v0.1-scope.md §6` 的 8 条验收标准逐条映射到 E2E 测试

---

## Phase 7 —— 多源发现（计划中）

目标：把仓库连接到外部技能源。

- [ ] GitHub 仓库来源（`git clone` 或 raw URL 导入）
- [ ] 本地目录来源注册与监听
- [ ] 多源联邦搜索
- [ ] SkillHub 来源接入

## Phase 8 —— 发布与生态（计划中）

目标：双向技能流转，建设开放生态。

- [ ] `skillrelay publish <skill>` —— 制品打包或直推外部源
- [ ] 版本追踪与单技能变更历史
- [ ] 同名 / 多版本 / 多源冲突解决方案
- [ ] 风险脚本自动扫描（与 `trust` 手动标注互补）
- [ ] 技能规范演进的社区 RFC 流程

## Phase 9 —— 更多适配器（计划中）

目标：覆盖更多 Agent。

- [ ] OpenClaw 适配器
- [ ] OpenCode 适配器
- [ ] Codex 适配器
- [ ] 动态 `@skillrelay/adapter-*` 发现（解决 Q-0005）

## 暂不计划

- GUI 或 Web 界面
- 托管 / 云端仓库
- 自动后台同步
