# SkillRelay 开发路线图

> **状态**：设计阶段 —— 路线图为参考性内容，可能调整。

## 当前阶段：设计与规划

项目目前处于设计与规划阶段，尚未开始实现。

进行中的工作：
- [ ] 确定实现语言
- [ ] 定义规范技能格式
- [ ] 定义仓库存储格式
- [ ] 定义适配器接口契约
- [ ] 设计 CLI 命令结构

## Phase 0 —— 基础建设

目标：建立项目骨架和核心数据结构。

- [ ] 选择实现语言和工具链
- [ ] 定义规范 `Skill` 数据结构
- [ ] 定义 `Registry` 存储格式
- [ ] 定义 `Adapter` 接口契约
- [ ] 搭建项目构建系统和测试框架
- [ ] 实现本地仓库读写

## Phase 1 —— 核心 CLI

目标：实现可管理本地仓库的基础 CLI 工具。

- [ ] `skillrelay list` —— 列出本地仓库中的技能
- [ ] `skillrelay install <source>` —— 从本地路径或 URL 导入技能
- [ ] `skillrelay info <skill>` —— 查看技能详情
- [ ] `skillrelay remove <skill>` —— 从仓库中移除技能
- [ ] `skillrelay source add/remove/list` —— 管理技能来源
- [ ] `skillrelay config` —— 管理配置项

## Phase 2 —— Agent 适配器

目标：将仓库与真实 Agent 打通。

- [ ] Claude Code 适配器
- [ ] Hermes 适配器
- [ ] OpenClaw 适配器
- [ ] `skillrelay push <agent>` —— 将技能推送到 Agent
- [ ] `skillrelay pull <agent>` —— 从 Agent 拉取技能
- [ ] `skillrelay sync <agent>` —— 与 Agent 同步仓库

## Phase 3 —— 搜索与发现

目标：实现多来源的发现与搜索能力。

- [ ] `skillrelay search <query>` —— 搜索本地仓库和外部来源
- [ ] 接入 SkillHub 来源
- [ ] 接入 GitHub 仓库来源
- [ ] 支持按标签和分类筛选

## Phase 4 —— 转换与校验

目标：实现跨 Agent 的技能兼容性保障。

- [ ] Agent 专属格式之间的相互转换
- [ ] `skillrelay validate <skill>` —— 校验技能完整性和兼容性
- [ ] 依赖关系检查
- [ ] 可信度与安全检查

## Phase 5 —— 发布与生态

目标：实现双向技能流转，构建开放生态。

- [ ] `skillrelay publish <skill>` —— 将技能发布到外部来源
- [ ] 版本追踪与冲突解决
- [ ] 社区适配器贡献机制
- [ ] 社区来源扩展机制

## 暂不计划

- GUI 或 Web 界面
- 托管 / 云端仓库
- 自动后台同步
