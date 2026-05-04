# AI DSL UI Generator

**展示向**的前端项目：用自然语言（经 **DeepSeek** 等 OpenAI 兼容 API）生成 **JSON 形态 UI DSL**，经 **Zod** 校验后，由 **React** 递归渲染。无独立后端，本地 `pnpm dev` 时通过 **Vite 代理**在服务端注入 API Key，避免打进浏览器包。

## 技术亮点速览

- 声明式 **递归 DSL**（TypeScript 判别联合 + **Zod 4** 运行时校验 + Markdown 代码围栏剥离）
- **Vite 开发代理** 调用 `api.deepseek.com`，密钥仅存在于 Node 侧环境变量
- **React 19** 同构树渲染、基础 **a11y** 与主题变量（`index.css`）
- **Vitest** 单测 + **GitHub Actions**（pnpm frozen lockfile + lint + build + test）

详细架构、Mermaid 数据流与答辩话术见 **[TECHNICAL.md](./TECHNICAL.md)**。

## 本地运行

```bash
pnpm install
# 复制 .env.example → .env.local，填写 DEEPSEEK_API_KEY
pnpm dev
```

## 脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（含 DeepSeek 代理） |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest 单次跑完 |
| `pnpm test:watch` | Vitest 监听模式 |

## 说明

本仓库由 Vite 模板演化而来，根目录下原模板附带的 ESLint 配置说明已省略；需要类型感知 lint 规则时可参考 [typescript-eslint 文档](https://typescript-eslint.io/)。
